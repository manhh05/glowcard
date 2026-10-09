from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.order import OrderItemOut, ShippingSnapshot, TimelineEntry


class _FromAttrs(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class AdminCustomer(_FromAttrs):
    id: int
    email: str
    full_name: str
    phone: str | None


class AdminPaymentOut(_FromAttrs):
    id: int
    method: str
    status: str
    amount: int
    paid_at: datetime | None
    created_at: datetime


class AdminCustomScentOut(_FromAttrs):
    id: int
    order_item_id: int
    description: str
    requested_text: str
    status: str
    internal_note: str | None
    reviewed_at: datetime | None


class AdminOrderDetail(BaseModel):
    order_code: str
    status: str
    created_at: datetime
    updated_at: datetime
    subtotal: int
    shipping_fee: int
    total: int
    note: str | None
    customer: AdminCustomer
    shipping: ShippingSnapshot
    payments: list[AdminPaymentOut]
    items: list[OrderItemOut]
    timeline: list[TimelineEntry]
    custom_scent_requests: list[AdminCustomScentOut]


class AdminOrderListItem(BaseModel):
    order_code: str
    status: str
    recipient_name: str
    phone: str
    payment_method: str | None
    payment_status: str | None
    total: int
    item_count: int
    pending_custom_scents: int
    created_at: datetime


class AdminOrderPage(BaseModel):
    items: list[AdminOrderListItem]
    total: int
    limit: int
    offset: int


class OrderStatusUpdateIn(BaseModel):
    status: Literal["CONFIRMED", "PREPARING", "SHIPPED", "COMPLETED", "CANCELLED"]
    note: str | None = Field(None, max_length=500)  # shipping note, hiện trong timeline


class CustomScentReviewIn(BaseModel):
    status: Literal["ACCEPTED", "REJECTED"]
    internal_note: str | None = Field(None, max_length=500)


class AdminCustomScentListItem(BaseModel):
    id: int
    order_code: str
    order_status: str
    recipient_name: str
    phone: str
    description: str
    requested_text: str
    status: str
    internal_note: str | None
    created_at: datetime
    reviewed_at: datetime | None