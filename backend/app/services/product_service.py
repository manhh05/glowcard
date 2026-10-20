from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Product, ProductVariant
from app.schemas.product import ProductDetail, ProductListItem, ScentBrief


def _stock_totals(db: Session) -> dict[tuple[str, int | None], int]:
    """Tổng tồn kho nến theo size và thiệp, dùng để xét combo còn hàng không."""
    rows = db.execute(
        select(
            Product.product_type,
            ProductVariant.size_ml,
            func.sum(ProductVariant.stock_quantity),
        )
        .join(ProductVariant, ProductVariant.product_id == Product.id)
        .where(
            Product.is_active.is_(True),
            ProductVariant.is_active.is_(True),
            Product.product_type.in_(("CANDLE", "CARD")),
        )
        .group_by(Product.product_type, ProductVariant.size_ml)
    ).all()
    return {(t, s): int(total) for t, s, total in rows}


def _in_stock(product: Product, totals: dict) -> bool:
    if product.product_type == "COMBO":
        # Xấp xỉ: custom scent không trừ kho nên có thể còn hàng hơn con số này.
        return all(
            totals.get((c.component_type, c.size_ml), 0) >= c.quantity
            for c in product.components
        )
    return any(v.stock_quantity > 0 for v in product.variants if v.is_active)


def _price_from(product: Product) -> int:
    prices = [v.price for v in product.variants if v.is_active]
    return min(prices) if prices else 0


def _base_query():
    return (
        select(Product)
        .options(
            selectinload(Product.variants).selectinload(ProductVariant.scent),
            selectinload(Product.components),
        )
        .where(Product.is_active.is_(True))
    )


def _list_fields(product: Product, totals: dict) -> dict:
    active = [v for v in product.variants if v.is_active]
    candle_comps = [c for c in product.components if c.component_type == "CANDLE"]
    card_comps = [c for c in product.components if c.component_type == "CARD"]

    if product.product_type == "COMBO":
        sizes = sorted({c.size_ml for c in candle_comps if c.size_ml is not None})
        candle_count = sum(c.quantity for c in candle_comps)
        candle_size = sizes[0] if len(sizes) == 1 else None
        card_count = sum(c.quantity for c in card_comps)
    else:
        sizes = sorted({v.size_ml for v in active if v.size_ml is not None})
        candle_count = candle_size = card_count = None

    scents = {v.scent.id: v.scent for v in active if v.scent is not None}

    return dict(
        id=product.id,
        slug=product.slug,
        name=product.name,
        product_type=product.product_type,
        description=product.description,
        image_url=product.image_url,
        featured=product.featured,
        allow_custom_scent=product.allow_custom_scent,
        price_from=_price_from(product),
        in_stock=_in_stock(product, totals),
        available_sizes=sizes,
        scents=[ScentBrief.model_validate(s) for _, s in sorted(scents.items())],
        combo_candle_count=candle_count,
        combo_candle_size=candle_size,
        combo_card_count=card_count,
    )


def _candle_variants_for(db: Session, product: Product) -> list[ProductVariant]:
    if product.product_type != "COMBO":
        return []
    sizes = {
        c.size_ml
        for c in product.components
        if c.component_type == "CANDLE" and c.size_ml is not None
    }
    if not sizes:
        return []
    return list(
        db.scalars(
            select(ProductVariant)
            .join(Product, Product.id == ProductVariant.product_id)
            .where(
                Product.product_type == "CANDLE",
                Product.is_active.is_(True),
                ProductVariant.is_active.is_(True),
                ProductVariant.size_ml.in_(sizes),
                ProductVariant.scent_id.is_not(None),
            )
            .options(selectinload(ProductVariant.scent))
            .order_by(ProductVariant.size_ml, ProductVariant.scent_id)
        )
    )


def _card_variants_for(db: Session, product: Product) -> list[ProductVariant]:
    """Các mùi thiệp khách được chọn cho ô thiệp của combo."""
    if product.product_type != "COMBO":
        return []
    if not any(c.component_type == "CARD" for c in product.components):
        return []
    return list(
        db.scalars(
            select(ProductVariant)
            .join(Product, Product.id == ProductVariant.product_id)
            .where(
                Product.product_type == "CARD",
                Product.is_active.is_(True),
                ProductVariant.is_active.is_(True),
                ProductVariant.scent_id.is_not(None),
            )
            .options(selectinload(ProductVariant.scent))
            .order_by(ProductVariant.scent_id)
        )
    )


def list_products(
    db: Session,
    product_type: str | None = None,
    q: str | None = None,
    featured: bool | None = None,
) -> list[ProductListItem]:
    stmt = _base_query().order_by(Product.id)
    if product_type:
        stmt = stmt.where(Product.product_type == product_type)
    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q}%"))
    if featured is not None:
        stmt = stmt.where(Product.featured.is_(featured))

    totals = _stock_totals(db)
    return [
        ProductListItem(**_list_fields(p, totals)) for p in db.scalars(stmt).all()
    ]


def get_product(db: Session, slug: str) -> ProductDetail | None:
    product = db.scalar(_base_query().where(Product.slug == slug))
    if product is None:
        return None

    variants = sorted(
        (v for v in product.variants if v.is_active),
        key=lambda v: (v.size_ml or 0, v.scent.name_en if v.scent else ""),
    )
    return ProductDetail(
        **_list_fields(product, _stock_totals(db)),
        story=product.story,
        burn_time=product.burn_time,
        ingredients=product.ingredients,
        variants=variants,
        components=product.components,
        candle_variants=_candle_variants_for(db, product),
        card_variants=_card_variants_for(db, product),
    )
