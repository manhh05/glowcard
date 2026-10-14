"""Giới hạn số lần thử (rate limit) lưu trong bộ nhớ của tiến trình.

Lưu ý:
- Bộ đếm nằm trong RAM của một tiến trình: khởi động lại server thì bộ đếm được xóa,
  và nếu chạy nhiều worker/nhiều instance thì mỗi nơi đếm riêng. Với một web service
  chạy 1 instance (Render gói thường) thì như vậy là đủ. Khi mở rộng nhiều instance,
  hãy chuyển bộ đếm sang database hoặc Redis.
- Không dựa vào địa chỉ IP: sau reverse proxy IP khó xác định chắc chắn và header
  X-Forwarded-For có thể bị giả mạo. Khóa theo tài khoản bị tấn công thì không bị ảnh hưởng.
"""
import math
import threading
import time
from collections import OrderedDict, deque
from collections.abc import Callable

from fastapi import HTTPException, status

from app.core.config import settings

# Giới hạn số khóa được theo dõi để kẻ tấn công không làm đầy bộ nhớ
MAX_TRACKED_KEYS = 50_000


def _too_many(message_template: str, retry_after: float) -> HTTPException:
    seconds = max(1, math.ceil(retry_after))
    minutes = max(1, math.ceil(seconds / 60))
    return HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=message_template.format(minutes=minutes),
        headers={"Retry-After": str(seconds)},
    )


class FailureLimiter:
    """Đếm số lần thất bại theo khóa (ví dụ email). Đủ `max_failures` lần trong
    `lockout_seconds` giây thì khóa trong `lockout_seconds` giây. Thành công thì xóa bộ đếm."""

    def __init__(
        self,
        max_failures: int,
        lockout_seconds: int,
        message: str,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_failures = max_failures
        self.lockout_seconds = lockout_seconds
        self.message = message
        self._clock = clock
        self._failures: OrderedDict[str, deque[float]] = OrderedDict()
        self._locked_until: dict[str, float] = {}
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        """Gọi TRƯỚC khi kiểm tra mật khẩu. Đang bị khóa thì ném lỗi 429."""
        now = self._clock()
        with self._lock:
            until = self._locked_until.get(key)
            if until is None:
                return
            if until <= now:  # hết thời gian khóa
                del self._locked_until[key]
                self._failures.pop(key, None)
                return
            retry_after = until - now
        raise _too_many(self.message, retry_after)

    def failure(self, key: str) -> None:
        """Ghi nhận một lần thất bại."""
        now = self._clock()
        with self._lock:
            attempts = self._failures.get(key)
            if attempts is None:
                attempts = deque()
                self._failures[key] = attempts
            else:
                self._failures.move_to_end(key)

            cutoff = now - self.lockout_seconds
            while attempts and attempts[0] <= cutoff:
                attempts.popleft()
            attempts.append(now)

            if len(attempts) >= self.max_failures:
                self._locked_until[key] = now + self.lockout_seconds
                attempts.clear()

            self._prune(now)

    def reset(self, key: str) -> None:
        """Đăng nhập thành công thì xóa bộ đếm."""
        with self._lock:
            self._failures.pop(key, None)
            self._locked_until.pop(key, None)

    def _prune(self, now: float) -> None:
        if (
            len(self._failures) <= MAX_TRACKED_KEYS
            and len(self._locked_until) <= MAX_TRACKED_KEYS
        ):
            return
        for k in [k for k, t in self._locked_until.items() if t <= now]:
            del self._locked_until[k]
        while len(self._failures) > MAX_TRACKED_KEYS:
            self._failures.popitem(last=False)


class WindowLimiter:
    """Cho phép tối đa `max_hits` lượt trong `window_seconds` giây (tính mọi lượt)."""

    def __init__(
        self,
        max_hits: int,
        window_seconds: int,
        message: str,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_hits = max_hits
        self.window_seconds = window_seconds
        self.message = message
        self._clock = clock
        self._hits: deque[float] = deque()
        self._lock = threading.Lock()

    def hit(self) -> None:
        now = self._clock()
        with self._lock:
            cutoff = now - self.window_seconds
            while self._hits and self._hits[0] <= cutoff:
                self._hits.popleft()
            if len(self._hits) >= self.max_hits:
                retry_after = self._hits[0] + self.window_seconds - now
            else:
                self._hits.append(now)
                return
        raise _too_many(self.message, retry_after)


# ---------------------------------------------------------------------------
# Các bộ giới hạn đang dùng trong ứng dụng (cấu hình ở .env)
# ---------------------------------------------------------------------------

_LOGIN_MESSAGE = "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau {minutes} phút."

customer_login_limiter = FailureLimiter(
    max_failures=settings.LOGIN_MAX_FAILURES,
    lockout_seconds=settings.LOGIN_LOCKOUT_MINUTES * 60,
    message=_LOGIN_MESSAGE,
)

admin_login_limiter = FailureLimiter(
    max_failures=settings.LOGIN_MAX_FAILURES,
    lockout_seconds=settings.LOGIN_LOCKOUT_MINUTES * 60,
    message=_LOGIN_MESSAGE,
)

register_limiter = WindowLimiter(
    max_hits=settings.REGISTER_MAX_PER_HOUR,
    window_seconds=3600,
    message="Hệ thống đang nhận quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau {minutes} phút.",
)
