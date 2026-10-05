from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import Admin, User

_bearer = HTTPBearer(auto_error=False)

_unauthorized = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated",
    headers={"WWW-Authenticate": "Bearer"},
)


def _subject_id(creds: HTTPAuthorizationCredentials | None, role: str) -> int:
    if creds is None:
        raise _unauthorized
    payload = decode_access_token(creds.credentials)
    # Token phải đúng role: token admin không dùng được cho API khách và ngược lại
    if payload is None or payload.get("role") != role:
        raise _unauthorized
    return int(payload["sub"])


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, _subject_id(creds, "customer"))
    if user is None or not user.is_active:
        raise _unauthorized
    return user


def get_current_admin(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Admin:
    admin = db.get(Admin, _subject_id(creds, "admin"))
    if admin is None:
        raise _unauthorized
    return admin