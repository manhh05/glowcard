from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    false,
    func,
    true,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Scent(Base):
    __tablename__ = "scents"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True)
    name_vi: Mapped[str] = mapped_column(String(150))
    name_en: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint(
            "product_type IN ('CANDLE','CARD','COMBO')", name="ck_products_type"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(150), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    product_type: Mapped[str] = mapped_column(String(20))
    description: Mapped[str] = mapped_column(Text)
    story: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(String(500))
    burn_time: Mapped[str | None] = mapped_column(String(200))
    ingredients: Mapped[str | None] = mapped_column(Text)
    featured: Mapped[bool] = mapped_column(Boolean, server_default=false())
    allow_custom_scent: Mapped[bool] = mapped_column(Boolean, server_default=false())
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    variants: Mapped[list["ProductVariant"]] = relationship(back_populates="product")
    components: Mapped[list["ComboComponent"]] = relationship(
        back_populates="combo_product"
    )


class ProductVariant(Base):
    """Nến: 1 variant = size + mùi (có stock riêng).
    Thiệp: 1 variant. Combo: 1 variant chỉ để giữ giá (stock không dùng)."""

    __tablename__ = "product_variants"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_variants_price"),
        CheckConstraint("stock_quantity >= 0", name="ck_variants_stock"),
        UniqueConstraint(
            "product_id",
            "size_ml",
            "scent_id",
            name="uq_variant_product_size_scent",
            postgresql_nulls_not_distinct=True,
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="RESTRICT"))
    scent_id: Mapped[int | None] = mapped_column(ForeignKey("scents.id", ondelete="RESTRICT"))
    size_ml: Mapped[int | None] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(150))
    price: Mapped[int] = mapped_column(Integer)  # VND
    stock_quantity: Mapped[int] = mapped_column(Integer, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, server_default=true())

    product: Mapped["Product"] = relationship(back_populates="variants")
    scent: Mapped["Scent | None"] = relationship()


class ComboComponent(Base):
    """Combo gồm những gì. Không trỏ variant cụ thể vì mùi do khách chọn."""

    __tablename__ = "combo_components"
    __table_args__ = (
        CheckConstraint(
            "component_type IN ('CANDLE','CARD')", name="ck_components_type"
        ),
        CheckConstraint("quantity > 0", name="ck_components_quantity"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    combo_product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE")
    )
    component_type: Mapped[str] = mapped_column(String(20))
    size_ml: Mapped[int | None] = mapped_column(Integer)
    quantity: Mapped[int] = mapped_column(Integer)

    combo_product: Mapped["Product"] = relationship(back_populates="components")