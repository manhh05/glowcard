from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    false,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.product import Product, ProductVariant


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart",
        cascade="all, delete-orphan",
        order_by="CartItem.id",
    )


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        CheckConstraint("quantity BETWEEN 1 AND 99", name="ck_cart_items_quantity"),
        # Hoặc trỏ tới 1 variant, hoặc là nến custom (size + mô tả mùi)
        CheckConstraint(
            "variant_id IS NOT NULL "
            "OR (size_ml IS NOT NULL AND custom_scent_text IS NOT NULL)",
            name="ck_cart_items_target",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cart_id: Mapped[int] = mapped_column(
        ForeignKey("carts.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT")
    )
    # Nến mùi có sẵn / thiệp: variant của nó. Combo: variant giữ giá của combo.
    variant_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT")
    )
    # Chỉ dùng cho nến lẻ custom scent
    size_ml: Mapped[int | None] = mapped_column(Integer)
    custom_scent_text: Mapped[str | None] = mapped_column(String(500))
    quantity: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    cart: Mapped["Cart"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship()
    variant: Mapped["ProductVariant | None"] = relationship()
    selections: Mapped[list["CartItemSelection"]] = relationship(
        back_populates="item",
        cascade="all, delete-orphan",
        order_by="CartItemSelection.slot_no",
    )


class CartItemSelection(Base):
    """Mùi của từng cây nến trong combo."""

    __tablename__ = "cart_item_selections"
    __table_args__ = (
        UniqueConstraint("cart_item_id", "slot_no", name="uq_cart_selection_slot"),
        CheckConstraint(
            "slot_type IN ('CANDLE','CARD')", name="ck_cart_selection_type"
        ),
        # Slot nến: đúng một trong hai, mùi có sẵn hoặc custom
        CheckConstraint(
            "slot_type <> 'CANDLE' OR "
            "((variant_id IS NOT NULL AND NOT is_custom) "
            "OR (variant_id IS NULL AND is_custom AND custom_scent_text IS NOT NULL))",
            name="ck_cart_selection_scent",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cart_item_id: Mapped[int] = mapped_column(
        ForeignKey("cart_items.id", ondelete="CASCADE"), index=True
    )
    slot_no: Mapped[int] = mapped_column(Integer)
    slot_type: Mapped[str] = mapped_column(String(20), server_default="CANDLE")
    variant_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT")
    )
    is_custom: Mapped[bool] = mapped_column(Boolean, server_default=false())
    custom_scent_text: Mapped[str | None] = mapped_column(String(500))

    item: Mapped["CartItem"] = relationship(back_populates="selections")
    variant: Mapped["ProductVariant | None"] = relationship()