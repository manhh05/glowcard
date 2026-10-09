import re
import unicodedata

from fastapi import HTTPException, status
from sqlalchemy import delete, select, update
from sqlalchemy.orm import Session, selectinload

from app.models import ComboComponent, Product, ProductVariant, Scent
from app.schemas.admin_product import (
    AdminProductOut,
    AdminScentOut,
    AdminVariantOut,
    ComponentIn,
    ProductCreateIn,
    ProductUpdateIn,
    ScentCreateIn,
    ScentUpdateIn,
    VariantCreateIn,
    VariantUpdateIn,
)

NULLABLE_PRODUCT_FIELDS = {"story", "image_url", "burn_time", "ingredients"}


def _bad(detail: str) -> HTTPException:
    return HTTPException(status.HTTP_400_BAD_REQUEST, detail)


def _conflict(detail: str) -> HTTPException:
    return HTTPException(status.HTTP_409_CONFLICT, detail)


def slugify(text: str) -> str:
    text = text.replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()


def _unique_slug(db: Session, model, base: str, maxlen: int) -> str:
    base = base or "item"
    slug = base[:maxlen]
    n = 2
    while db.scalar(select(model.id).where(model.slug == slug)) is not None:
        suffix = f"-{n}"
        slug = base[: maxlen - len(suffix)] + suffix
        n += 1
    return slug


def _clean(value: str | None) -> str | None:
    value = (value or "").strip()
    return value or None


# ---------- đọc ----------

def _get_product(db: Session, product_id: int) -> Product:
    product = db.scalar(
        select(Product)
        .where(Product.id == product_id)
        .options(
            selectinload(Product.variants).selectinload(ProductVariant.scent),
            selectinload(Product.components),
        )
        .execution_options(populate_existing=True)
    )
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


def _to_out(product: Product) -> AdminProductOut:
    out = AdminProductOut.model_validate(product)
    out.variants.sort(
        key=lambda v: (v.size_ml or 0, v.scent.name_en if v.scent else "")
    )
    out.components.sort(key=lambda c: (c.component_type, c.size_ml or 0))
    return out


def list_products(
    db: Session, product_type: str | None, q: str | None, is_active: bool | None
) -> list[AdminProductOut]:
    stmt = select(Product).options(
        selectinload(Product.variants).selectinload(ProductVariant.scent),
        selectinload(Product.components),
    )
    if product_type:
        stmt = stmt.where(Product.product_type == product_type)
    if q and q.strip():
        stmt = stmt.where(Product.name.ilike(f"%{q.strip()}%"))
    if is_active is not None:
        stmt = stmt.where(Product.is_active.is_(is_active))
    return [_to_out(p) for p in db.scalars(stmt.order_by(Product.id)).all()]


def get_product(db: Session, product_id: int) -> AdminProductOut:
    return _to_out(_get_product(db, product_id))


# ---------- tạo / sửa / ẩn sản phẩm ----------

def _ensure_single_card(db: Session, exclude_id: int | None) -> None:
    stmt = select(Product.id).where(
        Product.product_type == "CARD", Product.is_active.is_(True)
    )
    if exclude_id is not None:
        stmt = stmt.where(Product.id != exclude_id)
    if db.scalar(stmt.limit(1)) is not None:
        raise _conflict("Hiện chỉ hỗ trợ 1 sản phẩm thiệp đang hoạt động")


def _candle_sizes(db: Session) -> set[int]:
    return set(
        db.scalars(
            select(ProductVariant.size_ml)
            .join(Product, Product.id == ProductVariant.product_id)
            .where(
                Product.product_type == "CANDLE",
                Product.is_active.is_(True),
                ProductVariant.is_active.is_(True),
                ProductVariant.size_ml.is_not(None),
            )
        )
    )


def _build_components(db: Session, comps: list[ComponentIn]) -> list[ComboComponent]:
    if not any(c.component_type == "CANDLE" for c in comps):
        raise _bad("Combo cần ít nhất 1 thành phần nến")
    sizes = _candle_sizes(db)
    seen: set[tuple[str, int | None]] = set()
    result = []
    for c in comps:
        key = (c.component_type, c.size_ml)
        if key in seen:
            raise _bad("Thành phần bị trùng, hãy gộp vào một dòng và tăng quantity")
        seen.add(key)
        if c.component_type == "CANDLE":
            if c.size_ml is None or c.size_ml not in sizes:
                raise _bad(f"Nến size {c.size_ml}ml chưa có trong hệ thống")
        elif c.size_ml is not None:
            raise _bad("Thiệp không có size_ml")
        result.append(
            ComboComponent(
                component_type=c.component_type,
                size_ml=c.size_ml,
                quantity=c.quantity,
            )
        )
    return result


def _build_candle_variants(
    db: Session, items: list[VariantCreateIn]
) -> list[ProductVariant]:
    scents = {
        s.id: s
        for s in db.scalars(
            select(Scent).where(Scent.id.in_({i.scent_id for i in items}))
        )
    }
    seen: set[tuple[int, int]] = set()
    result = []
    for i in items:
        if i.scent_id not in scents:
            raise _bad(f"scent_id {i.scent_id} không tồn tại")
        if (i.size_ml, i.scent_id) in seen:
            raise _bad("Có variant bị trùng (cùng size và mùi)")
        seen.add((i.size_ml, i.scent_id))
        result.append(
            ProductVariant(
                scent_id=i.scent_id,
                size_ml=i.size_ml,
                label=_clean(i.label) or f"{i.size_ml}ml - {scents[i.scent_id].name_en}",
                price=i.price,
                stock_quantity=i.stock_quantity,
            )
        )
    return result


def create_product(db: Session, data: ProductCreateIn) -> AdminProductOut:
    t = data.product_type
    if t == "CANDLE":
        if not data.variants:
            raise _bad("Nến cần danh sách variants (size + mùi + giá)")
        if data.price is not None or data.components:
            raise _bad("Nến không dùng price hoặc components ở cấp sản phẩm")
    elif t == "CARD":
        if data.price is None:
            raise _bad("Thiệp cần price")
        if data.variants or data.components:
            raise _bad("Thiệp không dùng variants hoặc components")
        _ensure_single_card(db, None)
    else:  # COMBO
        if data.price is None or not data.components:
            raise _bad("Combo cần price và components")
        if data.variants:
            raise _bad("Combo không dùng variants")

    name = data.name.strip()
    if not name or not data.description.strip():
        raise _bad("name và description không được để trống")

    product = Product(
        slug=_unique_slug(db, Product, slugify(name), 150),
        name=name,
        product_type=t,
        description=data.description.strip(),
        story=_clean(data.story),
        image_url=_clean(data.image_url),
        burn_time=_clean(data.burn_time),
        ingredients=_clean(data.ingredients),
        featured=data.featured,
        allow_custom_scent=data.allow_custom_scent,
    )
    db.add(product)
    db.flush()

    if t == "CANDLE":
        for v in _build_candle_variants(db, data.variants):
            v.product_id = product.id
            db.add(v)
    elif t == "CARD":
        db.add(
            ProductVariant(
                product_id=product.id,
                label=name,
                price=data.price,
                stock_quantity=data.stock_quantity,
            )
        )
    else:
        db.add(
            ProductVariant(
                product_id=product.id, label=name, price=data.price, stock_quantity=0
            )
        )
        for c in _build_components(db, data.components):
            c.combo_product_id = product.id
            db.add(c)

    db.commit()
    return _to_out(_get_product(db, product.id))


def update_product(db: Session, product_id: int, data: ProductUpdateIn) -> AdminProductOut:
    product = _get_product(db, product_id)
    for key in data.model_fields_set:
        value = getattr(data, key)
        if key in NULLABLE_PRODUCT_FIELDS:
            value = _clean(value)
        else:
            if value is None:
                raise _bad(f"{key} không được null")
            if isinstance(value, str):
                value = value.strip()
                if not value:
                    raise _bad(f"{key} không được để trống")
        setattr(product, key, value)

    if product.is_active and product.product_type == "CARD":
        _ensure_single_card(db, product.id)
    db.commit()
    return _to_out(_get_product(db, product_id))


def deactivate_product(db: Session, product_id: int) -> AdminProductOut:
    """'Xóa' sản phẩm = ẩn. Đơn cũ vẫn giữ nguyên tham chiếu."""
    product = _get_product(db, product_id)
    product.is_active = False
    db.commit()
    return _to_out(_get_product(db, product_id))


def replace_components(
    db: Session, product_id: int, comps: list[ComponentIn]
) -> AdminProductOut:
    product = _get_product(db, product_id)
    if product.product_type != "COMBO":
        raise _bad("Chỉ combo mới có components")
    new_items = _build_components(db, comps)
    db.execute(
        delete(ComboComponent).where(ComboComponent.combo_product_id == product.id)
    )
    for c in new_items:
        c.combo_product_id = product.id
        db.add(c)
    db.commit()
    return _to_out(_get_product(db, product_id))


# ---------- variants và tồn kho ----------

def add_variant(db: Session, product_id: int, data: VariantCreateIn) -> AdminVariantOut:
    product = _get_product(db, product_id)
    if product.product_type != "CANDLE":
        raise _bad("Chỉ nến mới thêm variant (size + mùi)")
    if db.get(Scent, data.scent_id) is None:
        raise _bad("scent_id không tồn tại")
    duplicate = db.scalar(
        select(ProductVariant.id).where(
            ProductVariant.product_id == product_id,
            ProductVariant.size_ml == data.size_ml,
            ProductVariant.scent_id == data.scent_id,
        )
    )
    if duplicate is not None:
        raise _conflict("Variant này đã tồn tại")

    scent = db.get(Scent, data.scent_id)
    variant = ProductVariant(
        product_id=product_id,
        scent_id=data.scent_id,
        size_ml=data.size_ml,
        label=_clean(data.label) or f"{data.size_ml}ml - {scent.name_en}",
        price=data.price,
        stock_quantity=data.stock_quantity,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return AdminVariantOut.model_validate(variant)


def update_variant(db: Session, variant_id: int, data: VariantUpdateIn) -> AdminVariantOut:
    # Khóa dòng: không đè lên lượt trừ kho của khách đang đặt hàng
    variant = db.scalar(
        select(ProductVariant)
        .where(ProductVariant.id == variant_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    if variant is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")

    fields = data.model_fields_set
    if data.stock_quantity is not None and data.stock_delta is not None:
        raise _bad("Chỉ gửi stock_quantity hoặc stock_delta, không gửi cả hai")
    if (data.stock_quantity is not None or data.stock_delta is not None) and (
        variant.product.product_type == "COMBO"
    ):
        raise _bad("Combo không có kho riêng, hãy chỉnh kho của nến và thiệp")

    if "price" in fields and data.price is not None:
        variant.price = data.price
    if "label" in fields and data.label is not None:
        if not data.label.strip():
            raise _bad("label không được để trống")
        variant.label = data.label.strip()
    if "is_active" in fields and data.is_active is not None:
        variant.is_active = data.is_active
    if data.stock_quantity is not None:
        variant.stock_quantity = data.stock_quantity
    if data.stock_delta is not None:
        new_stock = variant.stock_quantity + data.stock_delta
        if new_stock < 0:
            raise _conflict(f"Tồn kho không thể âm (hiện còn {variant.stock_quantity})")
        variant.stock_quantity = new_stock

    db.commit()
    db.refresh(variant)
    return AdminVariantOut.model_validate(variant)


# ---------- mùi ----------

def list_scents(db: Session) -> list[AdminScentOut]:
    return [
        AdminScentOut.model_validate(s)
        for s in db.scalars(select(Scent).order_by(Scent.id))
    ]


def _relabel(db: Session, scent: Scent) -> None:
    for v in db.scalars(select(ProductVariant).where(ProductVariant.scent_id == scent.id)):
        if v.size_ml is not None:
            v.label = f"{v.size_ml}ml - {scent.name_en}"


def create_scent(db: Session, data: ScentCreateIn) -> AdminScentOut:
    name_en = data.name_en.strip()
    name_vi = data.name_vi.strip()
    if not name_en or not name_vi:
        raise _bad("Tên mùi không được để trống")
    if db.scalar(select(Scent.id).where(Scent.name_en == name_en)) is not None:
        raise _conflict("Tên tiếng Anh của mùi đã tồn tại")

    slug = _unique_slug(db, Scent, slugify(data.slug or name_en), 50)
    scent = Scent(
        slug=slug,
        name_vi=name_vi,
        name_en=name_en,
        description=_clean(data.description),
        notes=_clean(data.notes),
    )
    db.add(scent)
    db.flush()

    if data.add_to_candles:
        candles = db.scalars(
            select(Product)
            .where(Product.product_type == "CANDLE", Product.is_active.is_(True))
            .options(selectinload(Product.variants))
        ).all()
        for p in candles:
            prices: dict[int, int] = {}
            for v in p.variants:
                if v.size_ml is not None and v.is_active:
                    prices[v.size_ml] = min(prices.get(v.size_ml, v.price), v.price)
            for size, price in sorted(prices.items()):
                db.add(
                    ProductVariant(
                        product_id=p.id,
                        scent_id=scent.id,
                        size_ml=size,
                        label=f"{size}ml - {name_en}",
                        price=price,
                        stock_quantity=data.initial_stock,
                    )
                )
    db.commit()
    db.refresh(scent)
    return AdminScentOut.model_validate(scent)


def update_scent(db: Session, scent_id: int, data: ScentUpdateIn) -> AdminScentOut:
    scent = db.get(Scent, scent_id)
    if scent is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Scent not found")

    for key in data.model_fields_set:
        value = getattr(data, key)
        if key in ("description", "notes"):
            value = _clean(value)
        else:
            if value is None:
                raise _bad(f"{key} không được null")
            if isinstance(value, str):
                value = value.strip()
                if not value:
                    raise _bad(f"{key} không được để trống")
        if key == "name_en" and value != scent.name_en:
            taken = db.scalar(
                select(Scent.id).where(Scent.name_en == value, Scent.id != scent.id)
            )
            if taken is not None:
                raise _conflict("Tên tiếng Anh của mùi đã tồn tại")
        setattr(scent, key, value)

    if "name_en" in data.model_fields_set:
        _relabel(db, scent)
    if "is_active" in data.model_fields_set:  # tắt hoặc bật mùi thì áp cho mọi variant
        db.execute(
            update(ProductVariant)
            .where(ProductVariant.scent_id == scent.id)
            .values(is_active=scent.is_active)
        )
    db.commit()
    db.refresh(scent)
    return AdminScentOut.model_validate(scent)