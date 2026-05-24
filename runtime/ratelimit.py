"""Simple in-memory token-bucket rate limiter keyed by IP / route.

Designed for a single-process FastAPI demo. Not durable, not shared across
workers — for the contest demo / single-host deployment this is sufficient
and zero-dependency. Returns a clear 429 with Retry-After hint when exceeded.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass


@dataclass
class _Bucket:
    tokens: float
    last_refill: float


class RateLimitExceeded(Exception):
    """Raised when an IP exceeds the configured budget. Carries retry_after seconds."""

    def __init__(self, retry_after: float, limit: int, window: float):
        self.retry_after = max(0.5, round(retry_after, 2))
        self.limit = limit
        self.window = window
        super().__init__(
            f"Rate limit exceeded: {limit} req / {window:.0f}s; retry in {self.retry_after}s"
        )


class RateLimiter:
    """Token bucket per (route, key). One token added every (window / limit) seconds."""

    def __init__(self, limit: int, window_seconds: float):
        if limit <= 0 or window_seconds <= 0:
            raise ValueError("limit and window_seconds must be > 0")
        self.limit = limit
        self.window = float(window_seconds)
        self.refill_rate = self.limit / self.window  # tokens per second
        self._buckets: dict[tuple[str, str], _Bucket] = {}
        self._lock = asyncio.Lock()

    async def check(self, route: str, key: str) -> None:
        async with self._lock:
            now = time.monotonic()
            bucket = self._buckets.get((route, key))
            if bucket is None:
                bucket = _Bucket(tokens=float(self.limit), last_refill=now)
                self._buckets[(route, key)] = bucket
            elapsed = now - bucket.last_refill
            if elapsed > 0:
                bucket.tokens = min(self.limit, bucket.tokens + elapsed * self.refill_rate)
                bucket.last_refill = now
            if bucket.tokens < 1.0:
                retry_after = (1.0 - bucket.tokens) / self.refill_rate
                raise RateLimitExceeded(retry_after, self.limit, self.window)
            bucket.tokens -= 1.0

    def snapshot(self) -> dict[str, int]:
        return {"buckets": len(self._buckets), "limit": self.limit, "window_s": int(self.window)}
