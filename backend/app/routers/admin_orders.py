from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.schemas.admin import (
    AdminCustomScentListItem,
    AdminOrderDetail,
    AdminOrderPage,
    CustomScentReviewIn,
    OrderStatusUpdateIn,
)
from app.services import admin_order_service as svc

router = APIRouter(
    prefix="/admin",
    tags=["admin-orders"],
    dependencies=[Depends(get_current_admin)],
)

ORDER_STATUS = "^(PENDING|CONFIRMED|PREPARING|SHIPPED|COMPLETED|CANCELLED)$"
PAYMENT_STATUS = "^(PENDING|PAID|FAILED|CANCELLED)$"
SCENT_STATUS = "^(PENDING|ACCEPTED|REJECTED)$"


@router.get("/orders", response_model=AdminOrderPage)
def list_orders(
    status: str | None = Query(None, pattern=ORDER_STATUS),
    payment_status: str | None = Query(None, pattern=PAYMENT_STATUS),
    q: str | None = Query(None, max_length=100),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return svc.list_orders(db, status, payment_status, q, limit, offset)


@router.get("/orders/{order_code}", response_model=AdminOrderDetail)
def get_order(order_code: str, db: Session = Depends(get_db)):
    return svc.get_order_detail(db, order_code)


@router.patch("/orders/{order_code}/status", response_model=AdminOrderDetail)
def update_order_status(
    order_code: str, data: OrderStatusUpdateIn, db: Session = Depends(get_db)
):
    return svc.update_status(db, order_code, data)


@router.get("/custom-scent-requests", response_model=list[AdminCustomScentListItem])
def list_custom_scent(
    status: str | None = Query(None, pattern=SCENT_STATUS),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return svc.list_custom_scent(db, status, limit, offset)


@router.patch(
    "/custom-scent-requests/{request_id}", response_model=AdminCustomScentListItem
)
def review_custom_scent(
    request_id: int, data: CustomScentReviewIn, db: Session = Depends(get_db)
):
    return svc.review_custom_scent(db, request_id, data)