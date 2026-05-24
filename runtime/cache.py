"""Result cache (SQLite + SHA256 key).

Caches `ResearchResult.to_dict()` payloads keyed by sha256(company|question|locale|mode).
Survives process restarts, bounded by TTL and row count.

This is intentionally a tiny, dependency-free wrapper around `sqlite3` so the
demo box doesn't need Redis. For multi-worker / multi-host production we'd swap
the implementation but keep the public surface (`get` / `set` / `key`).
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import sqlite3
import time
from pathlib import Path
from typing import Any

_SCHEMA = """
CREATE TABLE IF NOT EXISTS research_cache (
    cache_key   TEXT PRIMARY KEY,
    payload     TEXT NOT NULL,
    created_at  REAL NOT NULL,
    hit_count   INTEGER NOT NULL DEFAULT 0,
    last_hit_at REAL
);
CREATE INDEX IF NOT EXISTS idx_research_cache_created ON research_cache(created_at);
"""


def make_cache_key(company: str, question: str, *, locale: str, mode: str) -> str:
    raw = "|".join([company.strip(), question.strip(), locale, mode])
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class ResultCache:
    """SQLite-backed JSON blob cache."""

    def __init__(
        self,
        db_path: str | Path,
        *,
        ttl_seconds: float = 60 * 60 * 24,  # 1 day
        max_rows: int = 500,
    ):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.ttl = float(ttl_seconds)
        self.max_rows = int(max_rows)
        self._lock = asyncio.Lock()
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, isolation_level=None, timeout=5.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(_SCHEMA)

    async def get(self, key: str) -> dict[str, Any] | None:
        async with self._lock:
            return await asyncio.to_thread(self._get_sync, key)

    def _get_sync(self, key: str) -> dict[str, Any] | None:
        now = time.time()
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload, created_at FROM research_cache WHERE cache_key = ?",
                (key,),
            ).fetchone()
            if not row:
                return None
            if now - row["created_at"] > self.ttl:
                conn.execute("DELETE FROM research_cache WHERE cache_key = ?", (key,))
                return None
            conn.execute(
                "UPDATE research_cache SET hit_count = hit_count + 1, last_hit_at = ? WHERE cache_key = ?",
                (now, key),
            )
            try:
                return json.loads(row["payload"])
            except json.JSONDecodeError:
                conn.execute("DELETE FROM research_cache WHERE cache_key = ?", (key,))
                return None

    async def set(self, key: str, payload: dict[str, Any]) -> None:
        async with self._lock:
            await asyncio.to_thread(self._set_sync, key, payload)

    def _set_sync(self, key: str, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, ensure_ascii=False)
        now = time.time()
        with self._connect() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO research_cache (cache_key, payload, created_at, hit_count, last_hit_at) "
                "VALUES (?, ?, ?, COALESCE((SELECT hit_count FROM research_cache WHERE cache_key = ?), 0), NULL)",
                (key, body, now, key),
            )
            count = conn.execute("SELECT COUNT(*) AS c FROM research_cache").fetchone()["c"]
            if count > self.max_rows:
                overflow = count - self.max_rows
                conn.execute(
                    "DELETE FROM research_cache WHERE cache_key IN ("
                    "  SELECT cache_key FROM research_cache ORDER BY created_at ASC LIMIT ?"
                    ")",
                    (overflow,),
                )

    def snapshot(self) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) AS rows, COALESCE(SUM(hit_count), 0) AS hits FROM research_cache"
            ).fetchone()
        return {
            "rows": int(row["rows"]),
            "hits": int(row["hits"]),
            "ttl_s": int(self.ttl),
            "max_rows": self.max_rows,
        }
