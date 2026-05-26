from __future__ import annotations

import json
import os
import asyncio
from pathlib import Path
from typing import Any, AsyncGenerator, Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from starlette.middleware.base import BaseHTTPMiddleware

from agent.react_agent import ResearchAgent
from agent.trace import AgentStep, ResearchResult
from runtime import FeedbackStore, RateLimiter, RateLimitExceeded, ResultCache, make_cache_key

WEB_DIR = Path(__file__).resolve().parent / "web"
DATA_DIR = Path(__file__).resolve().parent / "data"

# Rate limit & cache settings — tuneable via env without restart-time pain.
RATE_LIMIT_PER_MIN = int(os.environ.get("TRACEMIND_RATE_LIMIT_PER_MIN", "20"))
CACHE_TTL_SEC = int(os.environ.get("TRACEMIND_CACHE_TTL_SEC", str(60 * 60 * 24)))
CACHE_MAX_ROWS = int(os.environ.get("TRACEMIND_CACHE_MAX_ROWS", "500"))
FOLLOWUP_TIMEOUT_SEC = float(os.environ.get("TRACEMIND_FOLLOWUP_TIMEOUT_SEC", "60"))

RATE_LIMITED_ROUTES = {"/api/research", "/api/research/stream", "/api/research/followup"}

rate_limiter = RateLimiter(limit=RATE_LIMIT_PER_MIN, window_seconds=60.0)
result_cache = ResultCache(
    DATA_DIR / "result_cache.sqlite",
    ttl_seconds=CACHE_TTL_SEC,
    max_rows=CACHE_MAX_ROWS,
)
feedback_store = FeedbackStore(DATA_DIR / "feedback.sqlite")

app = FastAPI(
    title="Financial Research Agent",
    description="Traceable investment research agent demo.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply token-bucket rate limit to write-heavy research endpoints."""

    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path in RATE_LIMITED_ROUTES:
            client_ip = (request.client.host if request.client else None) or "unknown"
            try:
                await rate_limiter.check(request.url.path, client_ip)
            except RateLimitExceeded as exc:
                return JSONResponse(
                    status_code=429,
                    content={
                        "detail": str(exc),
                        "error": "rate_limit",
                        "retry_after_s": exc.retry_after,
                        "limit": exc.limit,
                        "window_s": int(exc.window),
                    },
                    headers={"Retry-After": str(int(exc.retry_after) + 1)},
                )
        return await call_next(request)


app.add_middleware(RateLimitMiddleware)


class ResearchRequest(BaseModel):
    company: str = Field(default="贵州茅台")
    question: str = Field(default="当前估值与基本面是否匹配？主要风险是什么？")
    locale: Literal["zh", "en"] = Field(default="zh")


class FollowupRequest(BaseModel):
    followup_question: str = Field(..., min_length=2, max_length=500)
    base_result: dict[str, Any] = Field(..., description="Previous ResearchResult.to_dict() payload")
    locale: Literal["zh", "en"] = Field(default="zh")


@app.get("/")
async def index() -> FileResponse:
    return FileResponse(WEB_DIR / "index.html")


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "rate_limit": rate_limiter.snapshot(),
        "cache": result_cache.snapshot(),
        "feedback": feedback_store.snapshot(),
    }


class ClaimFeedbackRequest(BaseModel):
    company: str = Field(..., min_length=1, max_length=200)
    question: str = Field(..., min_length=1, max_length=1000)
    locale: Literal["zh", "en"] = "zh"
    mode: Literal["live"] = "live"
    claim: str = Field(..., min_length=1, max_length=2000)
    verdict: Literal["up", "down"]
    note: str | None = Field(default=None, max_length=500)


def _claim_hash(claim: str) -> str:
    import hashlib

    return hashlib.sha1(claim.strip().encode("utf-8")).hexdigest()[:16]


@app.post("/api/feedback/claim")
async def submit_claim_feedback(payload: ClaimFeedbackRequest, request: Request) -> dict[str, Any]:
    cache_key = make_cache_key(
        payload.company, payload.question, locale=payload.locale, mode=payload.mode
    )
    claim_hash = _claim_hash(payload.claim)
    client_hint = (request.client.host if request.client else None) or "unknown"
    aggregate = await feedback_store.record(
        cache_key=cache_key,
        claim_hash=claim_hash,
        claim=payload.claim,
        verdict=payload.verdict,
        note=payload.note,
        client_hint=client_hint,
    )
    return {"ok": True, "aggregate": aggregate}


@app.get("/api/feedback/claim")
async def fetch_claim_feedback(
    company: str,
    question: str,
    locale: Literal["zh", "en"] = "zh",
    mode: Literal["live"] = "live",
) -> dict[str, Any]:
    cache_key = make_cache_key(company, question, locale=locale, mode=mode)
    bulk = await feedback_store.bulk_aggregate(cache_key)
    return {"cache_key": cache_key, "by_claim": bulk}


@app.get("/api/config")
async def config() -> dict[str, bool | str]:
    return {
        "demo_mode": False,
        "mode": "live",
    }


@app.post("/api/research")
async def research(payload: ResearchRequest) -> dict:
    mode = "live"
    cache_key = make_cache_key(payload.company, payload.question, locale=payload.locale, mode=mode)
    cached = await result_cache.get(cache_key)
    if cached is not None:
        cached["cache_hit"] = True
        return cached

    agent = ResearchAgent()
    try:
        result = await agent.run(payload.company, payload.question, locale=payload.locale)
        payload_dict = result.to_dict()
        payload_dict["cache_hit"] = False
        await result_cache.set(cache_key, payload_dict)
        return payload_dict
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Research failed: {type(exc).__name__}: {exc}",
        ) from exc


def _format_sse(event: str, payload: dict[str, Any]) -> str:
    body = json.dumps(payload, ensure_ascii=False)
    return f"event: {event}\ndata: {body}\n\n"


def _serialize_event(ev: dict[str, Any]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in ev.items():
        if isinstance(value, AgentStep):
            out[key] = value.to_dict()
        elif isinstance(value, ResearchResult):
            out[key] = value.to_dict()
        else:
            out[key] = value
    return out


_SSE_KEEPALIVE_INTERVAL = 25  # seconds — keeps Railway / Nginx gateway alive


@app.post("/api/research/stream")
async def research_stream(payload: ResearchRequest) -> StreamingResponse:
    agent = ResearchAgent()

    async def event_stream() -> AsyncGenerator[str, None]:
        # Wrap the agent generator in a queue so we can interleave keepalive
        # pings while waiting for the (slow) LLM to respond.
        queue: asyncio.Queue[dict[str, Any] | None] = asyncio.Queue()

        async def _produce() -> None:
            try:
                async for ev in agent.run_stream(
                    payload.company,
                    payload.question,
                    locale=payload.locale,
                ):
                    await queue.put(ev)
            except Exception as exc:  # noqa: BLE001
                await queue.put(
                    {"type": "error", "message": f"{type(exc).__name__}: {exc}"}
                )
            finally:
                await queue.put(None)  # sentinel

        producer = asyncio.create_task(_produce())
        try:
            while True:
                try:
                    ev = await asyncio.wait_for(
                        queue.get(), timeout=_SSE_KEEPALIVE_INTERVAL
                    )
                except asyncio.TimeoutError:
                    # No event in the window — send a comment ping to keep
                    # the gateway / proxy connection alive.
                    yield ": ping\n\n"
                    continue
                if ev is None:
                    break  # producer finished
                serialized = _serialize_event(ev)
                event_name = serialized.get("type", "message")
                yield _format_sse(event_name, serialized)
                if event_name == "error":
                    break
        finally:
            producer.cancel()

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/api/research/followup")
async def research_followup(payload: FollowupRequest) -> dict:
    agent = ResearchAgent()
    try:
        result = await asyncio.wait_for(
            agent.run_followup(
                payload.base_result,
                payload.followup_question,
                locale=payload.locale,
            ),
            timeout=FOLLOWUP_TIMEOUT_SEC,
        )
        return result.to_dict()
    except asyncio.TimeoutError as exc:
        raise HTTPException(status_code=504, detail="Follow-up timed out") from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"Follow-up failed: {type(exc).__name__}: {exc}",
        ) from exc


if WEB_DIR.exists():
    app.mount("/assets", StaticFiles(directory=WEB_DIR), name="assets")
