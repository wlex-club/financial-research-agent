from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    miromind_api_key: str = ""
    miromind_base_url: str = "https://api.miromind.ai/v1"
    miromind_model: str = "mirothinker-1-7-deepresearch"
    max_agent_steps: int = 6
    request_timeout_seconds: float = 120.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
