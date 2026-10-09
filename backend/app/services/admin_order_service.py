from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import exists, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import (
    CustomScentRequest,
    Order,
    OrderItem,
    OrderStatusHistory,
    Payment,
    ProductVariant,
    User,
)
from app.schemas.admin import (
    AdminCustomer,
    AdminCustomScentListItem,
    AdminCustomScentOut,
    AdminOrderDetail,
    AdminOrderListItem,
    AdminOrderPage,
    AdminPaymentOut,
    CustomScentReviewIn,
    OrderStatusUpdateIn,
)
from app.schemas.order import OrderItemOut, ShippingSnapshot, TimelineEntry
from app.services.order_service import _latest_payment

# Các bước chuyển trạng thái được phép. Muốn đổi luật thì sửa ở đây.
ALLOWED: dict[str, set[str]] = {
    "PENDING": {"CONFIRMED", "CANCELLED"},
    "CONFIRMED": {"PREPARING", "CANCELLED"},
    "PREPARING": {"SHIPPED", "CANCELLED"},
    "SHIPPED": {"COMPLETED"},
    "COMPLETED": set(),
    "CANCELLED": set(),
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ---------- đơn hàng ----------

def list_orders(
    db: Session,
    order_status: str | None,
    payment_status: str | None,
    q: str | None,
    limit: int,
    offset: int,
) -> AdminOrderPage:
    stmt = select(Order)
    if order_status:
        stmt = stmt.where(Order.status == order_status)
    if payment_status:
        stmt = stmt.where(
            exists().where(
                Payment.order_id == Order.id, Payment.status == payment_status
            )
        )
    if q and q.strip():
        like = f"%{q.strip()}%"
        stmt = stmt.where(
            or_(
                Order.order_code.ilike(like),
                Order.ship_phone.ilike(like),
                Order.ship_recipient_name.ilike(like),
            )
        )

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    orders = db.scalars(
        stmt.order_by(Order.id.desc())
        .limit(limit)
        .offset(offset)
        .options(
            selectinload(Order.payments),
            selectinload(Order.items),
            selectinload(Order.custom_scent_requests),
        )
    ).all()

    items = []
    for o in orders:
        p = _latest_payment(o)
        items.append(
            AdminOrderListItem(
                order_code=o.order_code,
                status=o.status,
                recipient_name=o.ship_recipient_name,
                phone=o.ship_phone,
                payment_method=p.method if p else None,
                payment_status=p.status if p else None,
                total=o.total,
                item_count=sum(i.quantity for i in o.items),
                pending_custom_scents=sum(
                    1 for r in o.custom_scent_requests if r.status == "PENDING"
                ),
                created_at=o.created_at,
            )
        )
    return AdminOrderPage(items=items, total=total, limit=limit, offset=offset)


def get_order_detail(db: Session, order_code: str) -> AdminOrderDetail:
    order = db.scalar(
        select(Order)
        .where(Order.order_code == order_code)
        .options(
            selectinload(Order.items).selectinload(OrderItem.selections),
            selectinload(Order.payments),
            selectinload(Order.history),
            selectinload(Order.custom_scent_requests),
        )
    )
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    user = db.get(User, order.user_id)

    return AdminOrderDetail(
        order_code=order.order_code,
        status=order.status,
        created_at=order.created_at,
        updated_at=order.updated_at,
        subtotal=order.subtotal,
        shipping_fee=order.shipping_fee,
        total=order.total,
        note=order.note,
        customer=AdminCustomer.model_validate(user),
        shipping=ShippingSnapshot(
            recipient_name=order.ship_recipient_name,
            phone=order.ship_phone,
            province=order.ship_province,
            district=order.ship_district,
            ward=order.ship_ward,
            address_line=order.ship_address_line,
        ),
        payments=[AdminPaymentOut.model_validate(p) for p in order.payments],
        items=[OrderItemOut.model_validate(i) for i in order.items],
        timeline=[TimelineEntry.model_validate(h) for h in order.history],
        custom_scent_requests=[
            AdminCustomScentOut.model_validate(r) for r in order.custom_scent_requests
        ],
    )


def _restore_stock(db: Session, order: Order) -> None:
    """Trả lại đúng số đã trừ lúc tạo đơn, theo order_stock_allocations."""
    allocations = sorted(order.stock_allocations, key=lambda a: a.variant_id)
    if not allocations:
        return
    variants = {
        v.id: v
        for v in db.scalars(
            select(ProductVariant)
            .where(ProductVariant.id.in_([a.variant_id for a in allocations]))
            .order_by(ProductVariant.id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
    }
    for a in allocations:
        variants[a.variant_id].stock_quantity += a.quantity


def update_status(
    db: Session, order_code: str, data: OrderStatusUpdateIn
) -> AdminOrderDetail:
    # Khóa dòng đơn: hai request hủy cùng lúc thì chỉ một cái chạy, không trả kho hai lần
    order = db.scalar(
        select(Order).where(Order.order_code == order_code).with_for_update()
    )
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    if data.status not in ALLOWED[order.status]:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail=(
                f"Không thể chuyển từ {order.status} sang {data.status}. "
                f"Được phép: {sorted(ALLOWED[order.status]) or 'không có'}"
            ),
        )

    if data.status == "CANCELLED":
        _restore_stock(db, order)
        for p in order.payments:
            if p.status == "PENDING":
                p.status = "CANCELLED"
    elif data.status == "COMPLETED":
        for p in order.payments:
            if p.method == "COD" and p.status == "PENDING":
                p.status = "PAID"
                p.paid_at = _now()

    order.status = data.status
    db.add(
        OrderStatusHistory(
            order_id=order.id,
            status=data.status,
            note=(data.note or "").strip() or None,
        )
    )
    db.commit()
    return get_order_detail(db, order_code)


# ---------- custom scent ----------

def _scent_item(r: CustomScentRequest, o: Order) -> AdminCustomScentListItem:
    return AdminCustomScentListItem(
        id=r.id,
        order_code=o.order_code,
        order_status=o.status,
        recipient_name=o.ship_recipient_name,
        phone=o.ship_phone,
        description=r.description,
        requested_text=r.requested_text,
        status=r.status,
        internal_note=r.internal_note,
        created_at=r.created_at,
        reviewed_at=r.reviewed_at,
    )


def list_custom_scent(
    db: Session, request_status: str | None, limit: int, offset: int
) -> list[AdminCustomScentListItem]:
    stmt = select(CustomScentRequest, Order).join(
        Order, Order.id == CustomScentRequest.order_id
    )
    if request_status:
        stmt = stmt.where(CustomScentRequest.status == request_status)
    rows = db.execute(
        stmt.order_by(CustomScentRequest.id.desc()).limit(limit).offset(offset)
    ).all()
    return [_scent_item(r, o) for r, o in rows]


def review_custom_scent(
    db: Session, request_id: int, data: CustomScentReviewIn
) -> AdminCustomScentListItem:
    req = db.get(CustomScentRequest, request_id)
    if req is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Request not found")

    req.status = data.status
    if "internal_note" in data.model_fields_set:  # không gửi thì giữ ghi chú cũ
        req.internal_note = (data.internal_note or "").strip() or None
    req.reviewed_at = _now()
    db.commit()
    return _scent_item(req, db.get(Order, req.order_id))