from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import ComboComponentOut, ScentOut


class _FromAttrs(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- output ----------

class AdminVariantOut(_FromAttrs):
    id: int
    product_id: int
    size_ml: int | None
    label: str
    price: int
    stock_quantity: int
    is_active: bool
    scent: ScentOut | None


class AdminProductOut(_FromAttrs):
    id: int
    slug: str
    name: str
    product_type: str
    description: str
    story: str | None
    image_url: str | None
    burn_time: str | None
    ingredients: str | None
    featured: bool
    allow_custom_scent: bool
    is_active: bool
    created_at: datetime
    variants: list[AdminVariantOut]
    components: list[ComboComponentOut]


class AdminScentOut(_FromAttrs):
    id: int
    slug: str
    name_vi: str
    name_en: str
    description: str | None
    notes: str | None
    is_active: bool


# ---------- input ----------

class VariantCreateIn(BaseModel):
    scent_id: int
    size_ml: int = Field(gt=0, le=5000)
    price: int = Field(ge=0, le=100_000_000)
    stock_quantity: int = Field(0, ge=0, le=1_000_000)
    label: str | None = Field(None, max_length=150)


class ComponentIn(BaseModel):
    component_type: Literal["CANDLE", "CARD"]
    size_ml: int | None = Field(None, gt=0, le=5000)
    quantity: int = Field(ge=1, le=20)


class ProductCreateIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    product_type: Literal["CANDLE", "CARD", "COMBO"]
    description: str = Field(min_length=1)
    story: str | None = None
    image_url: str | None = Field(None, max_length=500)
    burn_time: str | None = Field(None, max_length=200)
    ingredients: str | None = None
    featured: bool = False
    allow_custom_scent: bool = False
    price: int | None = Field(None, ge=0, le=100_000_000)  # CARD, COMBO
    stock_quantity: int = Field(0, ge=0, le=1_000_000)  # CARD
    variants: list[VariantCreateIn] | None = None  # CANDLE
    components: list[ComponentIn] | None = None  # COMBO


class ProductUpdateIn(BaseModel):
    name: str | None = Field(None, max_length=200)
    description: str | None = None
    story: str | None = None
    image_url: str | None = Field(None, max_length=500)
    burn_time: str | None = Field(None, max_length=200)
    ingredients: str | None = None
    featured: bool | None = None
    allow_custom_scent: bool | None = None
    is_active: bool | None = None


class VariantUpdateIn(BaseModel):
    price: int | None = Field(None, ge=0, le=100_000_000)
    label: str | None = Field(None, max_length=150)
    is_active: bool | None = None
    stock_quantity: int | None = Field(None, ge=0, le=1_000_000)  # đặt số tuyệt đối
    stock_delta: int | None = Field(None, ge=-1_000_000, le=1_000_000)  # cộng trừ


class ScentCreateIn(BaseModel):
    name_vi: str = Field(min_length=1, max_length=150)
    name_en: str = Field(min_length=1, max_length=100)
    slug: str | None = Field(None, max_length=50)
    description: str | None = None
    notes: str | None = None
    add_to_candles: bool = True  # tự tạo variant cho các sản phẩm nến
    initial_stock: int = Field(0, ge=0, le=1_000_000)


class ScentUpdateIn(BaseModel):
    name_vi: str | None = Field(None, max_length=150)
    name_en: str | None = Field(None, max_length=100)
    description: str | None = None
    notes: str | None = None
    is_active: bool | None = None


# ---------- dashboard ----------

class DailyStat(BaseModel):
    date: date
    orders: int
    revenue: int


class LowStockItem(BaseModel):
    variant_id: int
    product_name: str
    label: str
    stock_quantity: int


class DashboardOut(BaseModel):
    total_orders: int  # không tính đơn đã hủy
    cancelled_orders: int
    total_revenue: int
    orders_pending: int  # chờ xác nhận
    orders_confirmed: int
    orders_preparing: int
    orders_shipped: int
    orders_completed: int
    pending_custom_scents: int
    out_of_stock_count: int
    low_stock_threshold: int
    low_stock: list[LowStockItem]
    period_days: int
    period_revenue: int
    daily: list[DailyStat]