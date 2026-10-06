from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.order import Order


class Payment(Base):
    """Một order có thể có nhiều lần thanh toán (PayOS thất bại rồi thử lại)."""

    __tablename__ = "payments"
    __table_args__ = (
        CheckConstraint("method IN ('PAYOS','COD')", name="ck_payments_method"),
        CheckConstraint(
            "status IN ('PENDING','PAID','FAILED','CANCELLED')",
            name="ck_payments_status",
        ),
        CheckConstraint("amount >= 0", name="ck_payments_amount"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    method: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(20), server_default="PENDING")
    amount: Mapped[int] = mapped_column(Integer)
    payos_order_code: Mapped[int | None] = mapped_column(BigInteger, unique=True)
    payos_payment_link_id: Mapped[str | None] = mapped_column(String(100))
    checkout_url: Mapped[str | None] = mapped_column(String(500))
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    raw_webhook: Mapped[dict | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    order: Mapped["Order"] = relationship(back_populates="payments")