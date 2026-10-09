import secrets
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models import (
    Cart,
    CustomScentRequest,
    Order,
    OrderItem,
    OrderItemSelection,
    OrderStatusHistory,
    OrderStockAllocation,
    Payment,
    ProductVariant,
    ShippingAddress,
    User,
)
from app.schemas.order import (
    CustomScentRequestOut,
    OrderCreateIn,
    OrderDetail,
    OrderItemOut,
    OrderListItem,
    PaymentOut,
    ShippingSnapshot,
    TimelineEntry,
)
from app.services import cart_service

VN_TZ = timezone(timedelta(hours=7))
_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # bỏ O/0/I/1 cho dễ đọc


def _new_order_code(db: Session) -> str:
    today = datetime.now(VN_TZ).strftime("%Y%m%d")
    for _ in range(10):
        suffix = "".join(secrets.choice(_CODE_CHARS) for _ in range(4))
        code = f"GC-{today}-{suffix}"
        if db.scalar(select(Order.id).where(Order.order_code == code)) is None:
            return code
    raise HTTPException(500, "Could not generate order code")


def _latest_payment(order: Order) -> Payment | None:
    return max(order.payments, key=lambda p: p.id, default=None)


def _load_order(db: Session, user_id: int, order_code: str) -> Order | None:
    return db.scalar(
        select(Order)
        .where(Order.order_code == order_code, Order.user_id == user_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.selections),
            selectinload(Order.payments),
            selectinload(Order.history),
            selectinload(Order.custom_scent_requests),
        )
    )


def _to_detail(order: Order) -> OrderDetail:
    payment = _latest_payment(order)
    return OrderDetail(
        order_code=order.order_code,
        status=order.status,
        created_at=order.created_at,
        subtotal=order.subtotal,
        shipping_fee=order.shipping_fee,
        total=order.total,
        note=order.note,
        shipping=ShippingSnapshot(
            recipient_name=order.ship_recipient_name,
            phone=order.ship_phone,
            province=order.ship_province,
            district=order.ship_district,
            ward=order.ship_ward,
            address_line=order.ship_address_line,
        ),
        payment=PaymentOut.model_validate(payment) if payment else None,
        items=[OrderItemOut.model_validate(i) for i in order.items],
        timeline=[TimelineEntry.model_validate(h) for h in order.history],
        custom_scent_requests=[
            CustomScentRequestOut.model_validate(r)
            for r in order.custom_scent_requests
        ],
    )


def get_order(db: Session, user: User, order_code: str) -> OrderDetail:
    order = _load_order(db, user.id, order_code)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return _to_detail(order)


def list_orders(db: Session, user: User) -> list[OrderListItem]:
    orders = db.scalars(
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(Order.id.desc())
        .limit(100)
        .options(selectinload(Order.payments), selectinload(Order.items))
    ).all()
    result = []
    for o in orders:
        p = _latest_payment(o)
        result.append(
            OrderListItem(
                order_code=o.order_code,
                status=o.status,
                payment_method=p.method if p else None,
                payment_status=p.status if p else None,
                total=o.total,
                item_count=sum(i.quantity for i in o.items),
                created_at=o.created_at,
            )
        )
    return result


def create_order(db: Session, user: User, data: OrderCreateIn) -> OrderDetail:
    if data.payment_method == "PAYOS" and not settings.PAYOS_ENABLED:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "PAYOS payment method is not enabled"
        )

    address = db.scalar(
        select(ShippingAddress).where(
            ShippingAddress.id == data.address_id,
            ShippingAddress.user_id == user.id,
        )
    )
    if address is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Address not found")

    # 1. Khóa giỏ: bấm checkout hai lần liên tiếp thì request sau phải chờ
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id).with_for_update())
    items = cart_service._load_items(db, cart.id) if cart else []
    if not items:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cart is empty")

    # 2. Tính nhu cầu kho của cả giỏ rồi khóa các variant liên quan (theo thứ tự id để tránh deadlock)
    card_variant = (
        cart_service._card_variant(db)
        if any(i.product.product_type == "COMBO" for i in items)
        else None
    )
    need: dict[int, int] = defaultdict(int)
    for item in items:
        for vid, qty in cart_service._requirements(item, card_variant):
            need[vid] += qty

    locked: dict[int, ProductVariant] = {}
    if need:
        rows = db.scalars(
            select(ProductVariant)
            .where(ProductVariant.id.in_(sorted(need)))
            .order_by(ProductVariant.id)
            .with_for_update()
            .execution_options(populate_existing=True)  # đọc lại giá trị mới nhất
        ).all()
        locked = {v.id: v for v in rows}

    # 3. Kiểm tra lại giá và tồn kho bằng đúng logic của giỏ hàng
    built = cart_service._build_cart(db, items)
    if not built.can_checkout:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail={
                "message": "Cart has stock issues",
                "items": [
                    {"item_id": i.id, "issues": [x.model_dump() for x in i.issues]}
                    for i in built.items
                    if i.has_stock_issue
                ],
            },
        )

    # 4. Tạo đơn, snapshot địa chỉ
    shipping_fee = settings.SHIPPING_FEE
    order = Order(
        order_code=_new_order_code(db),
        user_id=user.id,
        status="PENDING",
        subtotal=built.subtotal,
        shipping_fee=shipping_fee,
        total=built.subtotal + shipping_fee,
        note=(data.note or "").strip() or None,
        ship_recipient_name=address.recipient_name,
        ship_phone=address.phone,
        ship_province=address.province,
        ship_district=address.district,
        ship_ward=address.ward,
        ship_address_line=address.address_line,
        source_address_id=address.id,
    )
    db.add(order)
    db.flush()

    # 5. Dòng hàng (snapshot giá lúc này) + mùi từng cây + yêu cầu custom scent
    for item, line in zip(items, built.items):
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            variant_id=item.variant_id,
            product_type=item.product.product_type,
            product_name=item.product.name,
            variant_label=line.label,
            size_ml=item.size_ml
            if item.size_ml is not None
            else (item.variant.size_ml if item.variant is not None else None),
            unit_price=line.unit_price,
            quantity=item.quantity,
            line_total=line.line_total,
            custom_scent_text=item.custom_scent_text,
        )
        db.add(order_item)
        db.flush()

        if item.custom_scent_text:  # nến lẻ custom
            db.add(
                CustomScentRequest(
                    order_id=order.id,
                    order_item_id=order_item.id,
                    description=f"Nến {item.size_ml}ml x{item.quantity}",
                    requested_text=item.custom_scent_text,
                )
            )

        for sel in item.selections:  # combo
            order_sel = OrderItemSelection(
                order_item_id=order_item.id,
                slot_no=sel.slot_no,
                slot_type=sel.slot_type,
                variant_id=sel.variant_id,
                scent_name=(
                    sel.variant.scent.name_vi
                    if sel.variant is not None and sel.variant.scent is not None
                    else None
                ),
                is_custom=sel.is_custom,
                custom_scent_text=sel.custom_scent_text,
            )
            db.add(order_sel)
            db.flush()
            if sel.is_custom and sel.custom_scent_text:
                db.add(
                    CustomScentRequest(
                        order_id=order.id,
                        order_item_id=order_item.id,
                        selection_id=order_sel.id,
                        description=f"{item.product.name} - nến số {sel.slot_no}",
                        requested_text=sel.custom_scent_text,
                    )
                )

    # 6. Trừ kho và ghi lại đã trừ gì
    for vid, qty in need.items():
        locked[vid].stock_quantity -= qty
        db.add(OrderStockAllocation(order_id=order.id, variant_id=vid, quantity=qty))

    # 7. Lịch sử trạng thái và thanh toán
    db.add(OrderStatusHistory(order_id=order.id, status="PENDING"))
    db.add(
        Payment(
            order_id=order.id,
            method=data.payment_method,
            status="PENDING",
            amount=order.total,
        )
    )

    # 8. COD: xóa giỏ ngay. PayOS: giữ giỏ, xóa khi thanh toán thành công.
    if data.payment_method == "COD":
        for it in list(cart.items):
            db.delete(it)

    order_code = order.order_code
    db.commit()
    return get_order(db, user, order_code)