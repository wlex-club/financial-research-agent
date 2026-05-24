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


def parse_tool_call(text: str) -> Optional[Dict[str, Any]]:
    """Parse a JSON tool call block from model output."""
    fenced = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except json.JSONDecodeError:
            pass

    brace = re.search(r"\{[^{}]*\"action\"[^{}]*\}", text, re.DOTALL)
    if brace:
        try:
            return json.loads(brace.group(0))
        except json.JSONDecodeError:
            return None
    return None
