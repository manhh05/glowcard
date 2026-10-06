from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.order import Order


class CustomScentRequest(Base):
    __tablename__ = "custom_scent_requests"
    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING','ACCEPTED','REJECTED')",
            name="ck_custom_scent_status",
        ),
        UniqueConstraint(
            "order_item_id",
            "selection_id",
            name="uq_custom_scent_target",
            postgresql_nulls_not_distinct=True,
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    order_item_id: Mapped[int] = mapped_column(
        ForeignKey("order_items.id", ondelete="CASCADE")
    )
    # Null nếu là nến lẻ custom, có giá trị nếu là cây nến trong combo
    selection_id: Mapped[int | None] = mapped_column(
        ForeignKey("order_item_selections.id", ondelete="CASCADE")
    )
    description: Mapped[str] = mapped_column(String(250))
    requested_text: Mapped[str] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(20), server_default="PENDING")
    internal_note: Mapped[str | None] = mapped_column(String(500))
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    order: Mapped["Order"] = relationship(back_populates="custom_scent_requests")