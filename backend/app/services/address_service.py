from fastapi import HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import ShippingAddress, User
from app.schemas.user import AddressIn, AddressUpdate


def _clear_default(db: Session, user_id: int) -> None:
    db.execute(
        update(ShippingAddress)
        .where(
            ShippingAddress.user_id == user_id,
            ShippingAddress.is_default.is_(True),
        )
        .values(is_default=False)
    )


def list_addresses(db: Session, user: User) -> list[ShippingAddress]:
    return list(
        db.scalars(
            select(ShippingAddress)
            .where(ShippingAddress.user_id == user.id)
            .order_by(ShippingAddress.is_default.desc(), ShippingAddress.id)
        )
    )


def get_address(db: Session, user: User, address_id: int) -> ShippingAddress:
    addr = db.scalar(
        select(ShippingAddress).where(
            ShippingAddress.id == address_id,
            ShippingAddress.user_id == user.id,  # chỉ lấy địa chỉ của chính user
        )
    )
    if addr is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Address not found")
    return addr


def create_address(db: Session, user: User, data: AddressIn) -> ShippingAddress:
    has_any = db.scalar(
        select(func.count())
        .select_from(ShippingAddress)
        .where(ShippingAddress.user_id == user.id)
    )
    make_default = data.is_default or not has_any  # địa chỉ đầu tiên luôn là mặc định
    if make_default:
        _clear_default(db, user.id)

    addr = ShippingAddress(
        user_id=user.id,
        **data.model_dump(exclude={"is_default"}),
        is_default=make_default,
    )
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


def update_address(
    db: Session, user: User, address_id: int, data: AddressUpdate
) -> ShippingAddress:
    addr = get_address(db, user, address_id)
    fields = {
        k: v
        for k, v in data.model_dump(exclude_unset=True).items()
        if v is not None or k == "district"  # chỉ district được phép xóa về trống
    }

    if fields.get("is_default") is True:
        _clear_default(db, user.id)
    elif fields.get("is_default") is False:
        # Không bỏ mặc định trực tiếp: muốn đổi thì đặt địa chỉ khác làm mặc định
        fields.pop("is_default")

    for key, value in fields.items():
        setattr(addr, key, value)
    db.commit()
    db.refresh(addr)
    return addr


def delete_address(db: Session, user: User, address_id: int) -> None:
    addr = get_address(db, user, address_id)
    was_default = addr.is_default
    db.delete(addr)
    db.flush()

    if was_default:
        # Xóa địa chỉ mặc định thì địa chỉ mới nhất còn lại lên làm mặc định
        newest = db.scalar(
            select(ShippingAddress)
            .where(ShippingAddress.user_id == user.id)
            .order_by(ShippingAddress.id.desc())
            .limit(1)
        )
        if newest is not None:
            newest.is_default = True
    db.commit()