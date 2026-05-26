from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

import httpx

from config import get_settings


class MiroMindClient:
    """OpenAI-compatible chat client for MiroMind API."""

    def __init__(self) -> None:
        settings = get_settings()
        self.api_key = settings.miromind_api_key.strip()
        self.base_url = settings.miromind_base_url.rstrip("/")
        self.model = settings.miromind_model
        self.timeout = settings.request_timeout_seconds

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        *,
        temperature: float = 0.2,
    ) -> str:
        if not self.is_configured:
            raise RuntimeError("MIROMIND_API_KEY is not configured")

        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": False,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            try:
                response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                body = exc.response.text[:200]
                raise RuntimeError(
                    f"MiroMind API returned HTTP {status}. "
                    f"The service may be temporarily unavailable. Detail: {body}"
                ) from exc
            data = response.json()

        return data["choices"][0]["message"]["content"]


_SCHEMA_KEYS = ("action", "conclusion", "finished", "thought")


def _looks_like_react_payload(data: Any) -> bool:
    """Return True if the parsed object resembles our ReAct schema."""
    if not isinstance(data, dict):
        return False
    return any(key in data for key in _SCHEMA_KEYS)


def _extract_balanced_json_objects(text: str) -> List[str]:
    """Return JSON-object substrings extracted by brace-balancing.

    The earlier regex required an `"action"` key, which silently dropped
    schema-compliant finished payloads (they contain `conclusion` instead).
    Brace-balancing is also resilient to nested braces inside string values.
    """
    candidates: List[str] = []
    depth = 0
    start = -1
    in_string = False
    escape = False
    for idx, ch in enumerate(text):
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
            continue
        if ch == "{":
            if depth == 0:
                start = idx
            depth += 1
        elif ch == "}" and depth > 0:
            depth -= 1
            if depth == 0 and start >= 0:
                candidates.append(text[start : idx + 1])
                start = -1
    return candidates


def parse_tool_call(text: str) -> Optional[Dict[str, Any]]:
    """Parse a JSON ReAct payload from model output.

    Accepts both fenced and bare JSON objects. A candidate is accepted only
    if it contains at least one known schema key (action / conclusion /
    finished / thought) so unrelated JSON like ``{"valid": true}`` is not
    mistaken for a final answer.
    """
    fenced_matches = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    for block in fenced_matches:
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        if _looks_like_react_payload(data):
            return data

    for block in _extract_balanced_json_objects(text):
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        if _looks_like_react_payload(data):
            return data
    return None
