from datetime import datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import CustomScentRequest, Order, Payment, Product, ProductVariant
from app.schemas.admin_product import DailyStat, DashboardOut, LowStockItem
from app.services.order_service import VN_TZ

TZ_NAME = "Asia/Ho_Chi_Minh"


def get_dashboard(db: Session, days: int, low_stock_threshold: int) -> DashboardOut:
    counts = dict(
        db.execute(select(Order.status, func.count()).group_by(Order.status)).all()
    )
    total_orders = sum(n for s, n in counts.items() if s != "CANCELLED")

    # Doanh thu = tiền đã thu (payment PAID) của đơn chưa bị hủy
    total_revenue = db.scalar(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .join(Order, Order.id == Payment.order_id)
        .where(Payment.status == "PAID", Order.status != "CANCELLED")
    )

    pending_scents = db.scalar(
        select(func.count())
        .select_from(CustomScentRequest)
        .where(CustomScentRequest.status == "PENDING")
    )

    stock_rows = db.execute(
        select(
            ProductVariant.id,
            Product.name,
            ProductVariant.label,
            ProductVariant.stock_quantity,
        )
        .join(Product, Product.id == ProductVariant.product_id)
        .where(
            Product.product_type.in_(("CANDLE", "CARD")),
            Product.is_active.is_(True),
            ProductVariant.is_active.is_(True),
            ProductVariant.stock_quantity <= low_stock_threshold,
        )
        .order_by(ProductVariant.stock_quantity, ProductVariant.id)
    ).all()
    low_stock = [
        LowStockItem(variant_id=i, product_name=n, label=l, stock_quantity=s)
        for i, n, l, s in stock_rows
    ]

    # Thống kê theo ngày (giờ Việt Nam)
    today = datetime.now(VN_TZ).date()
    start = today - timedelta(days=days - 1)

    order_day = func.date(func.timezone(TZ_NAME, Order.created_at))
    orders_by_day = {
        d: n
        for d, n in db.execute(
            select(order_day, func.count())
            .where(Order.status != "CANCELLED", order_day >= start)
            .group_by(order_day)
        ).all()
    }
    paid_day = func.date(func.timezone(TZ_NAME, Payment.paid_at))
    revenue_by_day = {
        d: int(r)
        for d, r in db.execute(
            select(paid_day, func.sum(Payment.amount))
            .join(Order, Order.id == Payment.order_id)
            .where(
                Payment.status == "PAID",
                Payment.paid_at.is_not(None),
                Order.status != "CANCELLED",
                paid_day >= start,
            )
            .group_by(paid_day)
        ).all()
    }

    daily = []
    for i in range(days):
        d = start + timedelta(days=i)
        daily.append(
            DailyStat(
                date=d,
                orders=orders_by_day.get(d, 0),
                revenue=revenue_by_day.get(d, 0),
            )
        )

    return DashboardOut(
        total_orders=total_orders,
        cancelled_orders=counts.get("CANCELLED", 0),
        total_revenue=int(total_revenue),
        orders_pending=counts.get("PENDING", 0),
        orders_confirmed=counts.get("CONFIRMED", 0),
        orders_preparing=counts.get("PREPARING", 0),
        orders_shipped=counts.get("SHIPPED", 0),
        orders_completed=counts.get("COMPLETED", 0),
        pending_custom_scents=pending_scents or 0,
        out_of_stock_count=sum(1 for x in low_stock if x.stock_quantity <= 0),
        low_stock_threshold=low_stock_threshold,
        low_stock=low_stock,
        period_days=days,
        period_revenue=sum(x.revenue for x in daily),
        daily=daily,
    )