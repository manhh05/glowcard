from collections import defaultdict
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models import (
    Cart,
    CartItem,
    CartItemSelection,
    Product,
    ProductVariant,
    User,
)
from app.schemas.cart import (
    CartItemIn,
    CartItemOut,
    CartOut,
    SelectionOut,
    StockIssue,
)

MAX_QTY = 99
LOW_STOCK_THRESHOLD = 3


# ---------- helpers ----------

def _bad(detail: str) -> HTTPException:
    return HTTPException(status.HTTP_400_BAD_REQUEST, detail)


def _get_or_create_cart(db: Session, user: User) -> Cart:
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    if cart is not None:
        return cart
    try:
        with db.begin_nested():
            cart = Cart(user_id=user.id)
            db.add(cart)
    except IntegrityError:  # hai request tạo giỏ cùng lúc
        cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    return cart


def _get_variant(db: Session, variant_id: int) -> ProductVariant:
    v = db.get(ProductVariant, variant_id)
    if v is None or not v.is_active or not v.product.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")
    return v


def _require_stock(v: ProductVariant) -> None:
    if v.stock_quantity <= 0:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Out of stock: {v.label}")


def _clean(text: str | None) -> str | None:
    text = (text or "").strip()
    return text or None


def _get_item(db: Session, user: User, item_id: int) -> CartItem:
    item = db.scalar(
        select(CartItem)
        .join(Cart, Cart.id == CartItem.cart_id)
        .where(CartItem.id == item_id, Cart.user_id == user.id)
    )
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cart item not found")
    return item


def _touch(cart: Cart) -> None:
    cart.updated_at = datetime.now(timezone.utc)


# ---------- thêm món ----------

def _add_single(db: Session, cart: Cart, product: Product, data: CartItemIn) -> None:
    if data.selections:
        raise _bad("selections chỉ dùng cho combo")
    text = _clean(data.custom_scent_text)

    if product.product_type == "CARD":
        if text or data.size_ml is not None:
            raise _bad("Thiệp chưa hỗ trợ chọn mùi")
        if data.variant_id is not None:
            variant = _get_variant(db, data.variant_id)
            if variant.product_id != product.id:
                raise _bad("variant_id không thuộc sản phẩm này")
        else:
            active = [v for v in product.variants if v.is_active]
            if len(active) != 1:
                raise _bad("Cần variant_id")
            variant = active[0]
    else:  # CANDLE
        if (data.variant_id is not None) == (text is not None):
            raise _bad("Chọn mùi có sẵn (variant_id) hoặc custom scent, không chọn cả hai")
        if data.variant_id is not None:
            variant = _get_variant(db, data.variant_id)
            if variant.product_id != product.id or variant.scent_id is None:
                raise _bad("variant_id không hợp lệ")
        else:
            if not product.allow_custom_scent:
                raise _bad("Sản phẩm này không hỗ trợ custom scent")
            sizes = {v.size_ml for v in product.variants if v.is_active}
            if data.size_ml not in sizes:
                raise _bad("size_ml không hợp lệ")
            db.add(
                CartItem(
                    cart_id=cart.id,
                    product_id=product.id,
                    size_ml=data.size_ml,
                    custom_scent_text=text,
                    quantity=data.quantity,
                )
            )
            return

    _require_stock(variant)
    existing = db.scalar(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product.id,
            CartItem.variant_id == variant.id,
            CartItem.custom_scent_text.is_(None),
        )
    )
    if existing:
        existing.quantity = min(existing.quantity + data.quantity, MAX_QTY)
    else:
        db.add(
            CartItem(
                cart_id=cart.id,
                product_id=product.id,
                variant_id=variant.id,
                quantity=data.quantity,
            )
        )


def _add_combo(db: Session, cart: Cart, product: Product, data: CartItemIn) -> None:
    if data.variant_id is not None or data.size_ml is not None or data.custom_scent_text:
        raise _bad("Combo chỉ cấu hình qua selections")

    combo_variants = [v for v in product.variants if v.is_active]
    if len(combo_variants) != 1:
        raise _bad("Combo chưa được cấu hình giá")

    # Danh sách size của từng cây nến theo thứ tự slot
    slot_sizes: list[int | None] = []
    for comp in sorted(product.components, key=lambda c: c.id):
        if comp.component_type == "CANDLE":
            slot_sizes += [comp.size_ml] * comp.quantity

    sels = data.selections or []
    if sorted(s.slot_no for s in sels) != list(range(1, len(slot_sizes) + 1)):
        raise _bad(f"Combo cần chọn mùi cho đúng {len(slot_sizes)} cây nến (slot_no 1..{len(slot_sizes)})")

    item = CartItem(
        cart_id=cart.id,
        product_id=product.id,
        variant_id=combo_variants[0].id,
        quantity=data.quantity,
    )
    for s in sorted(sels, key=lambda x: x.slot_no):
        text = _clean(s.custom_scent_text)
        if (s.variant_id is not None) == (text is not None):
            raise _bad(f"Slot {s.slot_no}: chọn mùi có sẵn hoặc custom, không chọn cả hai")
        if s.variant_id is not None:
            v = _get_variant(db, s.variant_id)
            size = slot_sizes[s.slot_no - 1]
            if v.product.product_type != "CANDLE" or v.scent_id is None:
                raise _bad(f"Slot {s.slot_no}: variant không phải nến")
            if size is not None and v.size_ml != size:
                raise _bad(f"Slot {s.slot_no}: cần nến {size}ml")
            _require_stock(v)
        elif not product.allow_custom_scent:
            raise _bad("Sản phẩm này không hỗ trợ custom scent")
        item.selections.append(
            CartItemSelection(
                slot_no=s.slot_no,
                slot_type="CANDLE",
                variant_id=s.variant_id,
                is_custom=text is not None,
                custom_scent_text=text,
            )
        )
    db.add(item)


def add_item(db: Session, user: User, data: CartItemIn) -> CartOut:
    product = db.get(Product, data.product_id)
    if product is None or not product.is_active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")

    cart = _get_or_create_cart(db, user)
    if product.product_type == "COMBO":
        _add_combo(db, cart, product, data)
    else:
        _add_single(db, cart, product, data)
    _touch(cart)
    db.commit()
    return get_cart(db, user)


def update_quantity(db: Session, user: User, item_id: int, quantity: int) -> CartOut:
    item = _get_item(db, user, item_id)
    item.quantity = quantity
    _touch(item.cart)
    db.commit()
    return get_cart(db, user)


def remove_item(db: Session, user: User, item_id: int) -> CartOut:
    item = _get_item(db, user, item_id)
    cart = item.cart
    db.delete(item)
    _touch(cart)
    db.commit()
    return get_cart(db, user)


def clear_cart(db: Session, user: User) -> CartOut:
    """Cũng sẽ được order service gọi khi COD tạo đơn / PayOS thanh toán xong."""
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    if cart is not None:
        for item in list(cart.items):
            db.delete(item)
        _touch(cart)
        db.commit()
    return get_cart(db, user)


# ---------- đọc giỏ + tính tồn kho ----------

def _load_items(db: Session, cart_id: int) -> list[CartItem]:
    return list(
        db.scalars(
            select(CartItem)
            .where(CartItem.cart_id == cart_id)
            .order_by(CartItem.id)
            .options(
                selectinload(CartItem.product).selectinload(Product.components),
                selectinload(CartItem.variant),
                selectinload(CartItem.selections)
                .selectinload(CartItemSelection.variant)
                .selectinload(ProductVariant.scent),
            )
        )
    )


def _card_variant(db: Session) -> ProductVariant | None:
    return db.scalar(
        select(ProductVariant)
        .join(Product, Product.id == ProductVariant.product_id)
        .where(
            Product.product_type == "CARD",
            Product.is_active.is_(True),
            ProductVariant.is_active.is_(True),
        )
        .order_by(ProductVariant.id)
        .limit(1)
    )


def _requirements(
    item: CartItem, card_variant: ProductVariant | None
) -> list[tuple[int, int]]:
    """Dòng này cần bao nhiêu từ mỗi variant: [(variant_id, số lượng)]."""
    if item.product.product_type == "COMBO":
        reqs = [
            (s.variant_id, item.quantity)
            for s in item.selections
            if s.variant_id is not None
        ]
        if card_variant is not None:
            for comp in item.product.components:
                if comp.component_type == "CARD":
                    reqs.append((card_variant.id, comp.quantity * item.quantity))
        return reqs
    if item.variant_id is not None:
        return [(item.variant_id, item.quantity)]
    return []  # nến custom: không trừ kho


def _unit_price(db: Session, item: CartItem) -> int | None:
    if item.variant is not None:
        return item.variant.price
    return db.scalar(  # nến custom: giá theo size, không phụ thu
        select(func.min(ProductVariant.price)).where(
            ProductVariant.product_id == item.product_id,
            ProductVariant.size_ml == item.size_ml,
            ProductVariant.is_active.is_(True),
        )
    )


def _build_cart(db: Session, items: list[CartItem]) -> CartOut:
    has_combo = any(i.product.product_type == "COMBO" for i in items)
    card_variant = _card_variant(db) if has_combo else None
    reqs = {i.id: _requirements(i, card_variant) for i in items}

    # Nhu cầu gộp cả giỏ theo từng variant
    need: dict[int, int] = defaultdict(int)
    for r in reqs.values():
        for vid, qty in r:
            need[vid] += qty

    variants: dict[int, ProductVariant] = {}
    if need:
        variants = {
            v.id: v
            for v in db.scalars(
                select(ProductVariant)
                .where(ProductVariant.id.in_(list(need)))
                .options(selectinload(ProductVariant.product))
            )
        }

    out_items: list[CartItemOut] = []
    for item in items:
        issues: list[StockIssue] = []
        if not item.product.is_active:
            issues.append(
                StockIssue(code="OUT_OF_STOCK", label=item.product.name, available=0)
            )

        seen: set[int] = set()
        for vid, _qty in reqs[item.id]:
            if vid in seen:
                continue
            seen.add(vid)
            v = variants.get(vid)
            if (
                v is None
                or not v.is_active
                or not v.product.is_active
                or v.stock_quantity <= 0
            ):
                issues.append(
                    StockIssue(
                        code="OUT_OF_STOCK",
                        label=v.label if v else item.product.name,
                        available=0,
                    )
                )
            elif need[vid] > v.stock_quantity:
                issues.append(
                    StockIssue(
                        code="INSUFFICIENT_STOCK",
                        label=v.label,
                        available=v.stock_quantity,
                    )
                )

        price = _unit_price(db, item)
        if price is None:
            price = 0
            issues.append(
                StockIssue(code="OUT_OF_STOCK", label=item.product.name, available=0)
            )

        is_out = any(i.code == "OUT_OF_STOCK" for i in issues)
        plain_variant = variants.get(item.variant_id) if item.product.product_type != "COMBO" else None
        stock_available = plain_variant.stock_quantity if plain_variant else None
        low_stock = any(
            0 < variants[vid].stock_quantity <= LOW_STOCK_THRESHOLD
            for vid in seen
            if vid in variants
        )

        if item.product.product_type == "COMBO":
            label = item.product.name
        elif item.variant is not None:
            label = item.variant.label
        else:
            label = f"{item.size_ml}ml - Mùi tùy chỉnh"

        out_items.append(
            CartItemOut(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name,
                product_type=item.product.product_type,
                image_url=item.product.image_url,
                variant_id=item.variant_id,
                label=label,
                size_ml=item.size_ml,
                quantity=item.quantity,
                unit_price=price,
                line_total=price * item.quantity,
                custom_scent_text=item.custom_scent_text,
                selections=[
                    SelectionOut(
                        slot_no=s.slot_no,
                        slot_type=s.slot_type,
                        variant_id=s.variant_id,
                        scent_name=(
                            s.variant.scent.name_vi
                            if s.variant is not None and s.variant.scent is not None
                            else None
                        ),
                        is_custom=s.is_custom,
                        custom_scent_text=s.custom_scent_text,
                    )
                    for s in item.selections
                ],
                stock_available=stock_available,
                low_stock=low_stock,
                is_out_of_stock=is_out,
                has_stock_issue=bool(issues),
                issues=issues,
            )
        )

    has_issue = any(i.has_stock_issue for i in out_items)
    return CartOut(
        items=out_items,
        subtotal=sum(i.line_total for i in out_items if not i.is_out_of_stock),
        item_count=sum(i.quantity for i in out_items),
        has_stock_issue=has_issue,
        can_checkout=bool(out_items) and not has_issue,
    )


def get_cart(db: Session, user: User) -> CartOut:
    cart = db.scalar(select(Cart).where(Cart.user_id == user.id))
    items = _load_items(db, cart.id) if cart else []
    return _build_cart(db, items)