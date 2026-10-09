from fastapi import FastAPI

from app.routers import auth, products, users, cart, orders, admin_orders, admin_products, admin_dashboard

from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

app = FastAPI(title="Glowcard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


app.include_router(products.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin_orders.router)
app.include_router(admin_products.router)
app.include_router(admin_dashboard.router)