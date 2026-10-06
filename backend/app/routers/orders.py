from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.order import OrderCreateIn, OrderDetail, OrderListItem
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderDetail, status_code=201)
def create_order(
    data: OrderCreateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return order_service.create_order(db, user, data)


@router.get("", response_model=list[OrderListItem])
def list_orders(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return order_service.list_orders(db, user)


@router.get("/{order_code}", response_model=OrderDetail)
def get_order(
    order_code: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return order_service.get_order(db, user, order_code)