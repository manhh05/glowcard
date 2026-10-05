from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    func,
    text,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "password_hash IS NOT NULL OR google_id IS NOT NULL",
            name="ck_users_has_login_method",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))  # null nếu chỉ dùng Google
    google_id: Mapped[str | None] = mapped_column(String(100), unique=True)
    full_name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str | None] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    addresses: Mapped[list["ShippingAddress"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class Admin(Base):
    """Tài khoản admin dùng chung, đăng nhập bằng username, không có email."""

    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class ShippingAddress(Base):
    __tablename__ = "shipping_addresses"
    __table_args__ = (
        # Mỗi user tối đa 1 địa chỉ mặc định
        Index(
            "uq_one_default_address_per_user",
            "user_id",
            unique=True,
            postgresql_where=text("is_default"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    recipient_name: Mapped[str] = mapped_column(String(150))
    phone: Mapped[str] = mapped_column(String(20))
    province: Mapped[str] = mapped_column(String(100))
    district: Mapped[str | None] = mapped_column(String(100))  # có thể bỏ sau
    ward: Mapped[str] = mapped_column(String(100))
    address_line: Mapped[str] = mapped_column(String(255))
    is_default: Mapped[bool] = mapped_column(Boolean, server_default="false")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(back_populates="addresses")