from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class OrderCreateIn(BaseModel):
    address_id: int
    payment_method: Literal["PAYOS", "COD"]
    note: str | None = Field(None, max_length=500)


class _FromAttrs(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SelectionOut(_FromAttrs):
    slot_no: int
    slot_type: str
    scent_name: str | None
    is_custom: bool
    custom_scent_text: str | None


class OrderItemOut(_FromAttrs):
    id: int
    product_type: str
    product_name: str
    variant_label: str
    size_ml: int | None
    quantity: int
    unit_price: int
    line_total: int
    custom_scent_text: str | None
    selections: list[SelectionOut]


class PaymentOut(_FromAttrs):
    method: str
    status: str
    amount: int
    paid_at: datetime | None


class TimelineEntry(_FromAttrs):
    status: str
    note: str | None
    created_at: datetime


class CustomScentRequestOut(_FromAttrs):
    id: int
    order_item_id: int
    description: str
    requested_text: str
    status: str


class ShippingSnapshot(BaseModel):
    recipient_name: str
    phone: str
    province: str
    district: str | None
    ward: str
    address_line: str


class OrderDetail(BaseModel):
    order_code: str
    status: str
    created_at: datetime
    subtotal: int
    shipping_fee: int
    total: int
    note: str | None
    shipping: ShippingSnapshot
    payment: PaymentOut | None
    items: list[OrderItemOut]
    timeline: list[TimelineEntry]
    custom_scent_requests: list[CustomScentRequestOut]


class OrderListItem(BaseModel):
    order_code: str
    status: str
    payment_method: str | None
    payment_status: str | None
    total: int
    item_count: int
    created_at: datetime