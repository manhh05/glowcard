from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.auth import AdminLoginIn, LoginIn, RegisterIn, TokenOut
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenOut, status_code=201)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    return auth_service.register(db, data)


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    return auth_service.login(db, data)


@router.post("/admin/login", response_model=TokenOut)
def admin_login(data: AdminLoginIn, db: Session = Depends(get_db)):
    return auth_service.admin_login(db, data)