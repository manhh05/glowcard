from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Product, ProductVariant
from app.schemas.product import ProductDetail, ProductListItem


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
        ProductListItem(
            id=p.id,
            slug=p.slug,
            name=p.name,
            product_type=p.product_type,
            image_url=p.image_url,
            featured=p.featured,
            allow_custom_scent=p.allow_custom_scent,
            price_from=_price_from(p),
            in_stock=_in_stock(p, totals),
        )
        for p in db.scalars(stmt).all()
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
        id=product.id,
        slug=product.slug,
        name=product.name,
        product_type=product.product_type,
        image_url=product.image_url,
        featured=product.featured,
        allow_custom_scent=product.allow_custom_scent,
        price_from=_price_from(product),
        in_stock=_in_stock(product, _stock_totals(db)),
        description=product.description,
        story=product.story,
        burn_time=product.burn_time,
        ingredients=product.ingredients,
        variants=variants,
        components=product.components,
    )