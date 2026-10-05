from fastapi import FastAPI

from app.routers import auth, products, users

app = FastAPI(title="Glowcard API")


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}


app.include_router(products.router)
app.include_router(auth.router)
app.include_router(users.router)