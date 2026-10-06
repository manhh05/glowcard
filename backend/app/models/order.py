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

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.custom_scent import CustomScentRequest
    from app.models.payment import Payment


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING','CONFIRMED','PREPARING','SHIPPED','COMPLETED','CANCELLED')",
            name="ck_orders_status",
        ),
        CheckConstraint(
            "subtotal >= 0 AND shipping_fee >= 0 AND total = subtotal + shipping_fee",
            name="ck_orders_amounts",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_code: Mapped[str] = mapped_column(String(30), unique=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), server_default="PENDING", index=True
    )
    subtotal: Mapped[int] = mapped_column(Integer)
    shipping_fee: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    note: Mapped[str | None] = mapped_column(String(500))

    # Snapshot địa chỉ giao hàng tại thời điểm đặt
    ship_recipient_name: Mapped[str] = mapped_column(String(150))
    ship_phone: Mapped[str] = mapped_column(String(20))
    ship_province: Mapped[str] = mapped_column(String(100))
    ship_district: Mapped[str | None] = mapped_column(String(100))
    ship_ward: Mapped[str] = mapped_column(String(100))
    ship_address_line: Mapped[str] = mapped_column(String(255))
    source_address_id: Mapped[int | None] = mapped_column(
        ForeignKey("shipping_addresses.id", ondelete="SET NULL")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="OrderItem.id"
    )
    history: Mapped[list["OrderStatusHistory"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="OrderStatusHistory.id",
    )
    stock_allocations: Mapped[list["OrderStockAllocation"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    payments: Mapped[list["Payment"]] = relationship(
        back_populates="order", cascade="all, delete-orphan", order_by="Payment.id"
    )
    custom_scent_requests: Mapped[list["CustomScentRequest"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="CustomScentRequest.id",
    )


class OrderItem(Base):
    """Snapshot tên, nhãn, giá tại lúc đặt: đổi giá hay tên sản phẩm sau này không ảnh hưởng đơn cũ."""

    __tablename__ = "order_items"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_order_items_quantity"),
        CheckConstraint(
            "line_total = unit_price * quantity", name="ck_order_items_line_total"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT")
    )
    variant_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT")
    )
    product_type: Mapped[str] = mapped_column(String(20))
    product_name: Mapped[str] = mapped_column(String(200))
    variant_label: Mapped[str] = mapped_column(String(200))
    size_ml: Mapped[int | None] = mapped_column(Integer)
    unit_price: Mapped[int] = mapped_column(Integer)
    quantity: Mapped[int] = mapped_column(Integer)
    line_total: Mapped[int] = mapped_column(Integer)
    custom_scent_text: Mapped[str | None] = mapped_column(String(500))  # nến lẻ custom

    order: Mapped["Order"] = relationship(back_populates="items")
    selections: Mapped[list["OrderItemSelection"]] = relationship(
        back_populates="item",
        cascade="all, delete-orphan",
        order_by="OrderItemSelection.slot_no",
    )


class OrderItemSelection(Base):
    """Mùi của từng cây nến trong combo, lưu snapshot tên mùi."""

    __tablename__ = "order_item_selections"
    __table_args__ = (
        UniqueConstraint("order_item_id", "slot_no", name="uq_order_selection_slot"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_item_id: Mapped[int] = mapped_column(
        ForeignKey("order_items.id", ondelete="CASCADE"), index=True
    )
    slot_no: Mapped[int] = mapped_column(Integer)
    slot_type: Mapped[str] = mapped_column(String(20), server_default="CANDLE")
    variant_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT")
    )
    scent_name: Mapped[str | None] = mapped_column(String(150))
    is_custom: Mapped[bool] = mapped_column(Boolean, server_default=false())
    custom_scent_text: Mapped[str | None] = mapped_column(String(500))

    item: Mapped["OrderItem"] = relationship(back_populates="selections")


class OrderStockAllocation(Base):
    """Đơn này đã trừ kho của variant nào, bao nhiêu (để trả lại đúng khi hủy)."""

    __tablename__ = "order_stock_allocations"
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_stock_alloc_quantity"),
        UniqueConstraint("order_id", "variant_id", name="uq_stock_alloc_order_variant"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT")
    )
    quantity: Mapped[int] = mapped_column(Integer)

    order: Mapped["Order"] = relationship(back_populates="stock_allocations")


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    __table_args__ = (
        CheckConstraint(
            "status IN ('PENDING','CONFIRMED','PREPARING','SHIPPED','COMPLETED','CANCELLED')",
            name="ck_order_history_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    status: Mapped[str] = mapped_column(String(20))
    note: Mapped[str | None] = mapped_column(String(500))  # shipping note
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    order: Mapped["Order"] = relationship(back_populates="history")