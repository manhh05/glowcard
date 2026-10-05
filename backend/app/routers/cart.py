from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.cart import CartItemIn, CartItemUpdate, CartOut
from app.services import cart_service

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartOut)
def get_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_service.get_cart(db, user)


@router.post("/items", response_model=CartOut, status_code=201)
def add_item(
    data: CartItemIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.add_item(db, user, data)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_item(
    item_id: int,
    data: CartItemUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.update_quantity(db, user, item_id, data.quantity)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_item(
    item_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return cart_service.remove_item(db, user, item_id)


@router.delete("", response_model=CartOut)
def clear_cart(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return cart_service.clear_cart(db, user)