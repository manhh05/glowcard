from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import User
from app.schemas.user import AddressIn, AddressOut, AddressUpdate, UserOut, UserUpdate
from app.services import address_service

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.patch("", response_model=UserOut)
def update_me(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fields = {
        k: v
        for k, v in data.model_dump(exclude_unset=True).items()
        if v is not None or k == "phone"
    }
    for key, value in fields.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user


@router.get("/addresses", response_model=list[AddressOut])
def list_addresses(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return address_service.list_addresses(db, user)


@router.post("/addresses", response_model=AddressOut, status_code=201)
def create_address(
    data: AddressIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return address_service.create_address(db, user, data)


@router.patch("/addresses/{address_id}", response_model=AddressOut)
def update_address(
    address_id: int,
    data: AddressUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return address_service.update_address(db, user, address_id, data)


@router.delete("/addresses/{address_id}", status_code=204)
def delete_address(
    address_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    address_service.delete_address(db, user, address_id)
    return Response(status_code=204)