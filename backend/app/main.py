from fastapi import FastAPI

from app.routers import auth, products, users, cart, orders, admin_orders

app = FastAPI(title="Glowcard API")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


app.include_router(products.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin_orders.router)