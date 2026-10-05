from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Admin, User
from app.schemas.auth import AdminLoginIn, LoginIn, RegisterIn, TokenOut

_bad_login = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid credentials",
)


def register(db: Session, data: RegisterIn) -> TokenOut:
    email = data.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(data.password),
        full_name=data.full_name.strip(),
        phone=data.phone,
    )
    db.add(user)
    db.commit()
    return TokenOut(
        access_token=create_access_token(
            user.id, "customer", settings.CUSTOMER_TOKEN_MINUTES
        )
    )


def login(db: Session, data: LoginIn) -> TokenOut:
    user = db.scalar(select(User).where(User.email == data.email.strip().lower()))
    # Cùng một lỗi cho "sai email" và "sai mật khẩu" để không lộ email nào đã đăng ký
    if (
        user is None
        or not user.is_active
        or user.password_hash is None
        or not verify_password(data.password, user.password_hash)
    ):
        raise _bad_login
    return TokenOut(
        access_token=create_access_token(
            user.id, "customer", settings.CUSTOMER_TOKEN_MINUTES
        )
    )


def admin_login(db: Session, data: AdminLoginIn) -> TokenOut:
    admin = db.scalar(select(Admin).where(Admin.username == data.username))
    if admin is None or not verify_password(data.password, admin.password_hash):
        raise _bad_login
    return TokenOut(
        access_token=create_access_token(
            admin.id, "admin", settings.ADMIN_TOKEN_MINUTES
        )
    )