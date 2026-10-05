from typing import Literal

from pydantic import BaseModel, Field


class SelectionIn(BaseModel):
    slot_no: int = Field(ge=1, le=20)
    variant_id: int | None = None  # mùi có sẵn
    custom_scent_text: str | None = Field(None, max_length=500)  # hoặc custom


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1, le=99)
    variant_id: int | None = None  # nến mùi có sẵn / thiệp
    size_ml: int | None = None  # nến custom scent
    custom_scent_text: str | None = Field(None, max_length=500)
    selections: list[SelectionIn] | None = None  # combo


class CartItemUpdate(BaseModel):
    quantity: int = Field(ge=1, le=99)


class StockIssue(BaseModel):
    code: Literal["OUT_OF_STOCK", "INSUFFICIENT_STOCK"]
    label: str
    available: int


class SelectionOut(BaseModel):
    slot_no: int
    slot_type: str
    variant_id: int | None
    scent_name: str | None
    is_custom: bool
    custom_scent_text: str | None


class CartItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_type: str
    image_url: str | None
    variant_id: int | None
    label: str
    size_ml: int | None
    quantity: int
    unit_price: int
    line_total: int
    custom_scent_text: str | None
    selections: list[SelectionOut]
    stock_available: int | None  # chỉ có với nến mùi sẵn / thiệp
    low_stock: bool
    is_out_of_stock: bool
    has_stock_issue: bool
    issues: list[StockIssue]


class CartOut(BaseModel):
    items: list[CartItemOut]
    subtotal: int  # đã loại các dòng hết hàng
    item_count: int
    has_stock_issue: bool
    can_checkout: bool