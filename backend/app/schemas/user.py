from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    phone: str | None
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=1, max_length=150)
    phone: str | None = Field(None, max_length=20)


class AddressIn(BaseModel):
    recipient_name: str = Field(min_length=1, max_length=150)
    phone: str = Field(min_length=1, max_length=20)
    province: str = Field(min_length=1, max_length=100)
    district: str | None = Field(None, max_length=100)
    ward: str = Field(min_length=1, max_length=100)
    address_line: str = Field(min_length=1, max_length=255)
    is_default: bool = False


class AddressUpdate(BaseModel):
    recipient_name: str | None = Field(None, min_length=1, max_length=150)
    phone: str | None = Field(None, min_length=1, max_length=20)
    province: str | None = Field(None, min_length=1, max_length=100)
    district: str | None = Field(None, max_length=100)
    ward: str | None = Field(None, min_length=1, max_length=100)
    address_line: str | None = Field(None, min_length=1, max_length=255)
    is_default: bool | None = None


class AddressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    recipient_name: str
    phone: str
    province: str
    district: str | None
    ward: str
    address_line: str
    is_default: bool