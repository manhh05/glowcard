import pytest
from fastapi import HTTPException

from app.core.rate_limit import FailureLimiter, WindowLimiter


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now

    def advance(self, seconds: float) -> None:
        self.now += seconds


def make_failure_limiter(clock: FakeClock, max_failures: int = 3, lockout: int = 600):
    return FailureLimiter(max_failures, lockout, "Thử lại sau {minutes} phút.", clock=clock)


def test_locks_after_max_failures_and_returns_429_with_retry_after():
    clock = FakeClock()
    limiter = make_failure_limiter(clock)

    for _ in range(3):
        limiter.check("a@x.com")
        limiter.failure("a@x.com")

    with pytest.raises(HTTPException) as exc:
        limiter.check("a@x.com")
    assert exc.value.status_code == 429
    assert exc.value.headers is not None
    assert int(exc.value.headers["Retry-After"]) == 600
    assert "10 phút" in exc.value.detail


def test_other_keys_are_not_affected():
    clock = FakeClock()
    limiter = make_failure_limiter(clock)
    for _ in range(3):
        limiter.failure("a@x.com")

    limiter.check("b@x.com")  # không ném lỗi


def test_lock_expires_after_lockout_period():
    clock = FakeClock()
    limiter = make_failure_limiter(clock)
    for _ in range(3):
        limiter.failure("a@x.com")

    clock.advance(601)
    limiter.check("a@x.com")  # hết khóa, không ném lỗi

    # sau khi hết khóa, bộ đếm bắt đầu lại từ đầu
    limiter.failure("a@x.com")
    limiter.failure("a@x.com")
    limiter.check("a@x.com")


def test_success_resets_counter():
    clock = FakeClock()
    limiter = make_failure_limiter(clock)
    limiter.failure("a@x.com")
    limiter.failure("a@x.com")
    limiter.reset("a@x.com")
    limiter.failure("a@x.com")
    limiter.failure("a@x.com")

    limiter.check("a@x.com")  # mới 2 lần sai sau khi reset, chưa bị khóa


def test_old_failures_outside_window_do_not_count():
    clock = FakeClock()
    limiter = make_failure_limiter(clock)
    limiter.failure("a@x.com")
    limiter.failure("a@x.com")
    clock.advance(601)  # hai lần sai trên đã quá cũ
    limiter.failure("a@x.com")

    limiter.check("a@x.com")


def test_window_limiter_blocks_then_recovers():
    clock = FakeClock()
    limiter = WindowLimiter(2, 3600, "Thử lại sau {minutes} phút.", clock=clock)
    limiter.hit()
    limiter.hit()

    with pytest.raises(HTTPException) as exc:
        limiter.hit()
    assert exc.value.status_code == 429

    clock.advance(3601)
    limiter.hit()  # đã qua cửa sổ thời gian
