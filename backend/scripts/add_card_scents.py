"""Thêm các mùi hương cho thiệp sáp thơm vào database (chạy lại nhiều lần cũng không tạo trùng).

Việc script làm:
  1. Tạo các mùi trong CARD_SCENTS nếu chưa có.
  2. Với mỗi mùi, tạo một biến thể của thiệp (giá lấy theo giá thiệp hiện tại, tồn kho DEFAULT_STOCK).
     Mùi/biến thể đã có thì giữ nguyên (không ghi đè giá hay tồn kho đã sửa trong Admin).
  3. Tắt biến thể thiệp cũ không có mùi (nếu có) để khách không còn thấy.

Muốn thêm mùi thiệp mới sau này: thêm một dòng vào CARD_SCENTS rồi chạy lại script.

Chạy trong thư mục backend, có venv. Để chạy lên database thật (Neon), gán DATABASE_URL trước:
    $env:DATABASE_URL = (Get-Clipboard -Raw).Trim()
    python -m scripts.add_card_scents
    Remove-Item Env:DATABASE_URL
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models import Product, ProductVariant, Scent

DEFAULT_STOCK = 20  # tồn kho tạm cho mỗi mùi, hãy sửa lại cho đúng trong Admin
FALLBACK_PRICE = 29000  # chỉ dùng khi không tìm thấy giá hiện có của thiệp

# (slug, tên tiếng Việt, tên tiếng Anh). Có thể chỉnh tên tiếng Việt trong Admin, Mùi hương.
CARD_SCENTS = [
    ("wild-tuberose", "Huệ Dại (Wild Tuberose)", "Wild Tuberose"),
    ("lotus-sandalwood", "Đàn Hương Sen (Lotus Sandalwood)", "Lotus Sandalwood"),
    ("natural-citrus", "Cam Chanh Tự Nhiên (Natural Citrus)", "Natural Citrus"),
    ("wild-wood", "Gỗ Hoang Dã (Wild Wood)", "Wild Wood"),
    ("blackberry-wine", "Mâm Xôi Đen & Rượu Vang (Blackberry & Wine)", "Blackberry & Wine"),
    ("citrus-bergamot", "Cam Bergamot (Citrus Bergamot)", "Citrus Bergamot"),
]


def run(db: Session) -> None:
    card = db.scalar(
        select(Product).where(Product.product_type == "CARD", Product.is_active.is_(True))
    )
    if card is None:
        raise SystemExit("Không tìm thấy sản phẩm thiệp đang bán.")

    # Luôn đọc biến thể trực tiếp từ database, không dựa vào dữ liệu đã nạp sẵn trong phiên
    variants = list(db.scalars(select(ProductVariant).where(ProductVariant.product_id == card.id)))
    legacy = [v for v in variants if v.scent_id is None and v.is_active]
    scented_prices = [v.price for v in variants if v.scent_id is not None and v.is_active]
    if legacy:
        price = legacy[0].price
    elif scented_prices:
        price = min(scented_prices)
    else:
        price = FALLBACK_PRICE

    created_scents = created_variants = 0
    for slug, name_vi, name_en in CARD_SCENTS:
        scent = db.scalar(select(Scent).where((Scent.slug == slug) | (Scent.name_en == name_en)))
        if scent is None:
            scent = Scent(slug=slug, name_vi=name_vi, name_en=name_en)
            db.add(scent)
            db.flush()
            created_scents += 1

        if not any(v.scent_id == scent.id for v in variants):
            db.add(
                ProductVariant(
                    product_id=card.id,
                    scent_id=scent.id,
                    size_ml=None,
                    label=f"Thiệp - {scent.name_en}",
                    price=price,
                    stock_quantity=DEFAULT_STOCK,
                )
            )
            created_variants += 1

    for v in legacy:
        v.is_active = False

    db.commit()
    print(
        f"Xong. Mùi mới: {created_scents}, biến thể thiệp mới: {created_variants}, "
        f"biến thể cũ đã tắt: {len(legacy)}."
    )


def main() -> None:
    with SessionLocal() as db:
        run(db)


if __name__ == "__main__":
    main()
