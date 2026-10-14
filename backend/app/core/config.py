from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    CUSTOMER_TOKEN_MINUTES: int = 60 * 24 * 7  # 7 ngày
    ADMIN_TOKEN_MINUTES: int = 60 * 8          # 8 tiếng
    SHIPPING_FEE: int = 0  # VND, business chưa chốt
    PAYOS_ENABLED: bool = False
    CORS_ORIGINS: str = "http://localhost:5173"  # nhiều domain thì cách nhau bằng dấu phẩy
    LOGIN_MAX_FAILURES: int = 5
    LOGIN_LOCKOUT_MINUTES: int = 15
    REGISTER_MAX_PER_HOUR: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()