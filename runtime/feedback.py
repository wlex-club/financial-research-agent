"""Persistent claim-level feedback store (thumbs up / down).

Used to let evaluators (and judges) report whether a specific cited claim
"holds up" against the linked sources. We persist per-claim aggregates so the
UI can show running counts and a confidence ratio.
"""

from __future__ import annotations

import asyncio
import sqlite3
import time
from pathlib import Path
from typing import Any, Literal

_FB_SCHEMA = """
CREATE TABLE IF NOT EXISTS claim_feedback (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key   TEXT NOT NULL,
    claim_hash  TEXT NOT NULL,
    claim       TEXT NOT NULL,
    verdict     TEXT NOT NULL CHECK(verdict IN ('up','down')),
    note        TEXT,
    created_at  REAL NOT NULL,
    client_hint TEXT
);
CREATE INDEX IF NOT EXISTS idx_claim_feedback_lookup
    ON claim_feedback(cache_key, claim_hash);
"""

Verdict = Literal["up", "down"]


class FeedbackStore:
    def __init__(self, db_path: str | Path):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = asyncio.Lock()
        with self._connect() as conn:
            conn.executescript(_FB_SCHEMA)

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, isolation_level=None, timeout=5.0)
        conn.row_factory = sqlite3.Row
        return conn

    async def record(
        self,
        *,
        cache_key: str,
        claim_hash: str,
        claim: str,
        verdict: Verdict,
        note: str | None,
        client_hint: str | None,
    ) -> dict[str, Any]:
        async with self._lock:
            return await asyncio.to_thread(
                self._record_sync,
                cache_key=cache_key,
                claim_hash=claim_hash,
                claim=claim,
                verdict=verdict,
                note=note,
                client_hint=client_hint,
            )

    def _record_sync(
        self,
        *,
        cache_key: str,
        claim_hash: str,
        claim: str,
        verdict: Verdict,
        note: str | None,
        client_hint: str | None,
    ) -> dict[str, Any]:
        now = time.time()
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO claim_feedback "
                "(cache_key, claim_hash, claim, verdict, note, created_at, client_hint) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (cache_key, claim_hash, claim, verdict, note, now, client_hint),
            )
            return self._aggregate_sync(cache_key=cache_key, claim_hash=claim_hash, conn=conn)

    async def aggregate(self, cache_key: str, claim_hash: str) -> dict[str, Any]:
        async with self._lock:
            return await asyncio.to_thread(self._aggregate_sync_default, cache_key, claim_hash)

    def _aggregate_sync_default(self, cache_key: str, claim_hash: str) -> dict[str, Any]:
        with self._connect() as conn:
            return self._aggregate_sync(cache_key=cache_key, claim_hash=claim_hash, conn=conn)

    def _aggregate_sync(
        self, *, cache_key: str, claim_hash: str, conn: sqlite3.Connection
    ) -> dict[str, Any]:
        row = conn.execute(
            "SELECT "
            "  SUM(CASE WHEN verdict='up'   THEN 1 ELSE 0 END) AS up, "
            "  SUM(CASE WHEN verdict='down' THEN 1 ELSE 0 END) AS down, "
            "  COUNT(*) AS total, "
            "  MAX(created_at) AS last_at "
            "FROM claim_feedback WHERE cache_key = ? AND claim_hash = ?",
            (cache_key, claim_hash),
        ).fetchone()
        up = int(row["up"] or 0)
        down = int(row["down"] or 0)
        total = int(row["total"] or 0)
        ratio = round(up / total, 3) if total else None
        return {
            "cache_key": cache_key,
            "claim_hash": claim_hash,
            "up": up,
            "down": down,
            "total": total,
            "ratio": ratio,
            "last_at": row["last_at"],
        }

    async def bulk_aggregate(self, cache_key: str) -> dict[str, dict[str, Any]]:
        async with self._lock:
            return await asyncio.to_thread(self._bulk_sync, cache_key)

    def _bulk_sync(self, cache_key: str) -> dict[str, dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT claim_hash, "
                "  SUM(CASE WHEN verdict='up'   THEN 1 ELSE 0 END) AS up, "
                "  SUM(CASE WHEN verdict='down' THEN 1 ELSE 0 END) AS down, "
                "  COUNT(*) AS total "
                "FROM claim_feedback WHERE cache_key = ? GROUP BY claim_hash",
                (cache_key,),
            ).fetchall()
        out: dict[str, dict[str, Any]] = {}
        for r in rows:
            up = int(r["up"] or 0)
            down = int(r["down"] or 0)
            total = int(r["total"] or 0)
            out[r["claim_hash"]] = {
                "up": up,
                "down": down,
                "total": total,
                "ratio": round(up / total, 3) if total else None,
            }
        return out

    def snapshot(self) -> dict[str, int]:
        with self._connect() as conn:
            row = conn.execute("SELECT COUNT(*) AS c FROM claim_feedback").fetchone()
        return {"total_votes": int(row["c"])}
