from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import ProductDetail, ProductListItem
from app.services import product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductListItem])
def list_products(
    type: str | None = Query(None, pattern="^(CANDLE|CARD|COMBO)$"),
    q: str | None = None,
    featured: bool | None = None,
    db: Session = Depends(get_db),
):
    return product_service.list_products(db, type, q, featured)


@router.get("/{slug}", response_model=ProductDetail)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = product_service.get_product(db, slug)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product