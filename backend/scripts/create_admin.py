from getpass import getpass

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models import Admin


def main() -> None:
    with SessionLocal() as db:
        admin = db.scalar(select(Admin).limit(1))

        if admin is None:
            username = input("Username admin: ").strip()
            if not username:
                print("Username không được để trống.")
                return
        else:
            print(f"Đã có admin '{admin.username}'. Chỉ đổi mật khẩu.")
            username = admin.username

        password = getpass("Mật khẩu (tối thiểu 8 ký tự): ")
        if len(password) < 8:
            print("Mật khẩu quá ngắn.")
            return
        if password != getpass("Nhập lại mật khẩu: "):
            print("Hai lần nhập không khớp.")
            return

        if admin is None:
            db.add(Admin(username=username, password_hash=hash_password(password)))
        else:
            admin.password_hash = hash_password(password)
        db.commit()
        print("Xong.")


if __name__ == "__main__":
    main()