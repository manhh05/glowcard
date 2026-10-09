from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.schemas.admin_product import DashboardOut
from app.services import admin_dashboard_service

router = APIRouter(
    prefix="/admin",
    tags=["admin-dashboard"],
    dependencies=[Depends(get_current_admin)],
)


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(
    days: int = Query(30, ge=1, le=365),
    low_stock_threshold: int = Query(5, ge=0, le=1000),
    db: Session = Depends(get_db),
):
    return admin_dashboard_service.get_dashboard(db, days, low_stock_threshold)