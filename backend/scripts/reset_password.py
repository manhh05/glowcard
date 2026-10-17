"""Đặt lại mật khẩu cho một khách hàng (khi khách quên mật khẩu và nhắn tin cho shop).

Chạy trong thư mục backend, có venv, và (để sửa database thật trên Neon) gán DATABASE_URL
trong cửa sổ terminal trước:

    $env:DATABASE_URL = 'postgresql+psycopg://...'
    python -m scripts.reset_password
    Remove-Item Env:DATABASE_URL
"""
from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import User


def main() -> None:
    email = input("Email đăng ký của khách: ").strip().lower()
    if not email:
        print("Email không được để trống.")
        return

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == email))
        if user is None:
            print("Không tìm thấy tài khoản nào với email này.")
            return

        print(f"Tài khoản: {user.full_name} <{user.email}>")
        if input("Đúng khách này? Gõ 'y' để tiếp tục: ").strip().lower() != "y":
            print("Đã hủy.")
            return

        password = getpass("Mật khẩu mới cho khách (tối thiểu 8 ký tự): ")
        if len(password) < 8:
            print("Mật khẩu quá ngắn.")
            return
        if password != getpass("Nhập lại mật khẩu: "):
            print("Hai lần nhập không khớp.")
            return

        user.password_hash = hash_password(password)
        db.commit()
        print("Xong. Gửi mật khẩu mới cho khách và nhắc khách đổi lại sau khi đăng nhập.")


if __name__ == "__main__":
    main()
