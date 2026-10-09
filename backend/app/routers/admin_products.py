from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
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
from app.services import admin_product_service as svc

router = APIRouter(
    prefix="/admin",
    tags=["admin-products"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("/products", response_model=list[AdminProductOut])
def list_products(
    type: str | None = Query(None, pattern="^(CANDLE|CARD|COMBO)$"),
    q: str | None = Query(None, max_length=100),
    is_active: bool | None = None,
    db: Session = Depends(get_db),
):
    return svc.list_products(db, type, q, is_active)


@router.post("/products", response_model=AdminProductOut, status_code=201)
def create_product(data: ProductCreateIn, db: Session = Depends(get_db)):
    return svc.create_product(db, data)


@router.get("/products/{product_id}", response_model=AdminProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return svc.get_product(db, product_id)


@router.patch("/products/{product_id}", response_model=AdminProductOut)
def update_product(product_id: int, data: ProductUpdateIn, db: Session = Depends(get_db)):
    return svc.update_product(db, product_id, data)


@router.delete("/products/{product_id}", response_model=AdminProductOut)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Ẩn sản phẩm (is_active = false), không xóa khỏi DB."""
    return svc.deactivate_product(db, product_id)


@router.put("/products/{product_id}/components", response_model=AdminProductOut)
def replace_components(
    product_id: int, data: list[ComponentIn], db: Session = Depends(get_db)
):
    return svc.replace_components(db, product_id, data)


@router.post(
    "/products/{product_id}/variants", response_model=AdminVariantOut, status_code=201
)
def add_variant(product_id: int, data: VariantCreateIn, db: Session = Depends(get_db)):
    return svc.add_variant(db, product_id, data)


@router.patch("/variants/{variant_id}", response_model=AdminVariantOut)
def update_variant(variant_id: int, data: VariantUpdateIn, db: Session = Depends(get_db)):
    return svc.update_variant(db, variant_id, data)


@router.get("/scents", response_model=list[AdminScentOut])
def list_scents(db: Session = Depends(get_db)):
    return svc.list_scents(db)


@router.post("/scents", response_model=AdminScentOut, status_code=201)
def create_scent(data: ScentCreateIn, db: Session = Depends(get_db)):
    return svc.create_scent(db, data)


@router.patch("/scents/{scent_id}", response_model=AdminScentOut)
def update_scent(scent_id: int, data: ScentUpdateIn, db: Session = Depends(get_db)):
    return svc.update_scent(db, scent_id, data)