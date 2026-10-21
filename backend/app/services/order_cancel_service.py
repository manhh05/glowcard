"""Khách hàng tự hủy đơn khi đơn còn ở trạng thái chờ xác nhận (PENDING)."""
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Order, OrderStatusHistory, ProductVariant, User
from app.schemas.order import OrderDetail
from app.services import order_service


def close_pending_custom_scents(order: Order) -> None:
    """Đơn bị hủy thì đóng các yêu cầu mùi hương tuỳ chỉnh còn chờ xử lý
    (đánh dấu 'Từ chối' kèm lý do) để không còn nằm trong danh sách việc cần duyệt."""
    for req in order.custom_scent_requests:
        if req.status == "PENDING":
            req.status = "REJECTED"
            req.internal_note = "Đơn hàng đã bị hủy"
            req.reviewed_at = datetime.now(timezone.utc)


def _restore_stock(db: Session, order: Order) -> None:
    """Trả lại đúng số đã trừ lúc tạo đơn (theo order_stock_allocations).
    Giống hệt cách Admin hủy đơn."""
    allocations = sorted(order.stock_allocations, key=lambda a: a.variant_id)
    if not allocations:
        return
    variants = {
        v.id: v
        for v in db.scalars(
            select(ProductVariant)
            .where(ProductVariant.id.in_([a.variant_id for a in allocations]))
            .order_by(ProductVariant.id)
            .with_for_update()
            .execution_options(populate_existing=True)
        )
    }
    for a in allocations:
        variants[a.variant_id].stock_quantity += a.quantity


def cancel_order(
    db: Session, user: User, order_code: str, reason: str | None
) -> OrderDetail:
    # Khóa dòng đơn: nếu Admin đang bấm xác nhận cùng lúc thì chỉ một bên thắng,
    # bên còn lại thấy trạng thái đã đổi và bị từ chối, không bao giờ trả kho hai lần.
    order = db.scalar(
        select(Order)
        .where(Order.order_code == order_code, Order.user_id == user.id)
        .with_for_update()
    )
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    if order.status == "CANCELLED":
        raise HTTPException(status.HTTP_409_CONFLICT, "Đơn hàng này đã được hủy trước đó.")
    if order.status != "PENDING":
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Đơn hàng đã được Glowcard xác nhận nên không thể tự hủy trên web. "
            "Vui lòng liên hệ Glowcard để được hỗ trợ.",
        )
    if any(p.status == "PAID" for p in order.payments):
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Đơn hàng đã thanh toán nên không thể tự hủy trên web. "
            "Vui lòng liên hệ Glowcard để được hỗ trợ hoàn tiền.",
        )

    _restore_stock(db, order)
    for p in order.payments:
        if p.status == "PENDING":
            p.status = "CANCELLED"
    close_pending_custom_scents(order)

    clean = (reason or "").strip()
    note = "Khách hàng đã hủy đơn" + (f": {clean}" if clean else "")
    order.status = "CANCELLED"
    db.add(OrderStatusHistory(order_id=order.id, status="CANCELLED", note=note[:500]))
    db.commit()
    return order_service.get_order(db, user, order_code)
