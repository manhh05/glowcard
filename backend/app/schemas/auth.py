from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=150)
    phone: str | None = Field(None, max_length=20)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class AdminLoginIn(BaseModel):
    username: str = Field(max_length=50)
    password: str = Field(max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"