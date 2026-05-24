from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional


class SourceType(str, Enum):
    FINANCIAL_REPORT = "financial_report"
    NEWS = "news"
    KNOWLEDGE = "knowledge"
    MARKET_DATA = "market_data"


@dataclass
class SourceRef:
    source_id: str
    source_type: SourceType
    title: str
    excerpt: str
    url: Optional[str] = None
    page: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "source_type": self.source_type.value,
            "title": self.title,
            "excerpt": self.excerpt,
            "url": self.url,
            "page": self.page,
        }


@dataclass
class AgentStep:
    step_number: int
    thought: str
    action: str
    action_input: Dict[str, Any]
    observation: str
    sources: List[SourceRef] = field(default_factory=list)
    data_status: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        payload = {
            "step_number": self.step_number,
            "thought": self.thought,
            "action": self.action,
            "action_input": self.action_input,
            "observation": self.observation,
            "sources": [s.to_dict() for s in self.sources],
        }
        if self.data_status:
            payload["data_status"] = self.data_status
        return payload


@dataclass
class CitedClaim:
    claim: str
    source_ids: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return {"claim": self.claim, "source_ids": self.source_ids}


@dataclass
class ResearchResult:
    company: str
    question: str
    conclusion: str
    steps: List[AgentStep]
    citations: List[CitedClaim]
    all_sources: List[SourceRef]
    mode: str
    locale: str = "zh"
    protocol: Optional[Dict[str, Any]] = None
    warning: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        payload = {
            "company": self.company,
            "question": self.question,
            "conclusion": self.conclusion,
            "steps": [s.to_dict() for s in self.steps],
            "citations": [c.to_dict() for c in self.citations],
            "all_sources": [s.to_dict() for s in self.all_sources],
            "mode": self.mode,
            "locale": self.locale,
        }
        if self.warning:
            payload["warning"] = self.warning
        if self.protocol is not None:
            payload["protocol"] = self.protocol
        return payload
