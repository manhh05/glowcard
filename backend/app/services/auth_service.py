from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import (
    admin_login_limiter,
    customer_login_limiter,
    register_limiter,
)
from app.core.security import create_access_token, hash_password, verify_password
from app.models import Admin, User
from app.schemas.auth import AdminLoginIn, LoginIn, RegisterIn, TokenOut

# Băm giả: khi email/username không tồn tại vẫn chạy một lần kiểm tra mật khẩu,
# để thời gian phản hồi không tiết lộ tài khoản nào có thật.
_DUMMY_HASH = hash_password("glowcard-dummy-password")


def _bad_login() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
    )


def register(db: Session, data: RegisterIn) -> TokenOut:
    register_limiter.hit()

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
    email = data.email.strip().lower()
    key = f"customer:{email}"
    customer_login_limiter.check(key)  # đang bị khóa thì dừng ngay

    user = db.scalar(select(User).where(User.email == email))
    stored_hash = user.password_hash if user is not None and user.is_active else None
    password_ok = verify_password(data.password, stored_hash or _DUMMY_HASH)

    # Cùng một lỗi cho "sai email" và "sai mật khẩu" để không lộ email nào đã đăng ký
    if stored_hash is None or not password_ok:
        customer_login_limiter.failure(key)
        raise _bad_login()

    customer_login_limiter.reset(key)
    return TokenOut(
        access_token=create_access_token(
            user.id, "customer", settings.CUSTOMER_TOKEN_MINUTES
        )
    )


def admin_login(db: Session, data: AdminLoginIn) -> TokenOut:
    key = f"admin:{data.username}"
    admin_login_limiter.check(key)

    admin = db.scalar(select(Admin).where(Admin.username == data.username))
    stored_hash = admin.password_hash if admin is not None else None
    password_ok = verify_password(data.password, stored_hash or _DUMMY_HASH)

    if stored_hash is None or not password_ok:
        admin_login_limiter.failure(key)
        raise _bad_login()

    admin_login_limiter.reset(key)
    return TokenOut(
        access_token=create_access_token(
            admin.id, "admin", settings.ADMIN_TOKEN_MINUTES
        )
    )
