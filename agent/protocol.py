from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Literal

ConfidenceLabel = Literal["low", "medium", "high"]
EvidenceRelation = Literal["supporting", "contradicting", "neutral"]
SourceReliability = Literal["A", "B", "C", "D", "E", "F"]
InfoCredibility = Literal["1", "2", "3", "4", "5", "6"]
RiskSeverity = Literal["low", "medium", "high"]
DecisionRating = Literal["positive", "watch", "cautious"]
SandtableBias = Literal["bull", "watch", "bear"]
SandtableAction = Literal["buy", "watch", "cautious"]


@dataclass
class InvestmentDecision:
    rating: DecisionRating
    confidence: ConfidenceLabel
    rationale: str
    monitoring_indicators: List[str] = field(default_factory=list)
    source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "rating": self.rating,
            "confidence": self.confidence,
            "rationale": self.rationale,
            "monitoring_indicators": self.monitoring_indicators,
            "source_ids": self.source_ids,
        }


@dataclass
class SandtableAgent:
    agent_id: str
    name: str
    role: str
    objective: str
    bias: SandtableBias
    stance: str
    source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "name": self.name,
            "role": self.role,
            "objective": self.objective,
            "bias": self.bias,
            "stance": self.stance,
            "source_ids": self.source_ids,
        }


@dataclass
class SandtableEvent:
    round_number: int
    agent_id: str
    action_type: str
    title: str
    content: str
    impact_score: float
    target_agent_id: str = ""
    reasoning: str = ""
    stance_shift: str = ""
    source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "round_number": self.round_number,
            "agent_id": self.agent_id,
            "action_type": self.action_type,
            "title": self.title,
            "content": self.content,
            "impact_score": self.impact_score,
            "target_agent_id": self.target_agent_id,
            "reasoning": self.reasoning,
            "stance_shift": self.stance_shift,
            "source_ids": self.source_ids,
        }


@dataclass
class SandtableRound:
    round_number: int
    title: str
    summary: str
    events: List[SandtableEvent] = field(default_factory=list)
    source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "round_number": self.round_number,
            "title": self.title,
            "summary": self.summary,
            "events": [event.to_dict() for event in self.events],
            "source_ids": self.source_ids,
        }


@dataclass
class SandtableSimulation:
    action: SandtableAction
    action_label: str
    confidence_score: int
    conclusion: str
    agents: List[SandtableAgent] = field(default_factory=list)
    rounds: List[SandtableRound] = field(default_factory=list)
    next_actions: List[str] = field(default_factory=list)
    source_ids: List[str] = field(default_factory=list)
    method: str = "multi_agent_sandtable"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "action": self.action,
            "action_label": self.action_label,
            "confidence_score": self.confidence_score,
            "conclusion": self.conclusion,
            "agents": [agent.to_dict() for agent in self.agents],
            "rounds": [round_item.to_dict() for round_item in self.rounds],
            "next_actions": self.next_actions,
            "source_ids": self.source_ids,
            "method": self.method,
        }


@dataclass
class BenchmarkCompany:
    company_id: str
    name: str
    revenue_billion: float
    net_margin: float
    rd_ratio: float
    debt_to_asset_ratio: float
    note: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "company_id": self.company_id,
            "name": self.name,
            "revenue_billion": self.revenue_billion,
            "net_margin": self.net_margin,
            "rd_ratio": self.rd_ratio,
            "debt_to_asset_ratio": self.debt_to_asset_ratio,
            "note": self.note,
        }


@dataclass
class FinancialMetric:
    metric_id: str
    value: float
    unit: str
    source_id: str
    formula: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "metric_id": self.metric_id,
            "value": self.value,
            "unit": self.unit,
            "source_id": self.source_id,
            "formula": self.formula,
        }


@dataclass
class RiskSignal:
    risk_id: str
    severity: RiskSeverity
    score: float
    source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "risk_id": self.risk_id,
            "severity": self.severity,
            "score": self.score,
            "source_ids": self.source_ids,
        }


@dataclass
class EvidenceItem:
    source_id: str
    relation: EvidenceRelation
    source_reliability: SourceReliability
    info_credibility: InfoCredibility
    excerpt: str
    claim: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "source_id": self.source_id,
            "relation": self.relation,
            "source_reliability": self.source_reliability,
            "info_credibility": self.info_credibility,
            "excerpt": self.excerpt,
            "claim": self.claim,
        }


@dataclass
class CompetingHypothesis:
    hypothesis_id: str
    statement: str
    confidence: ConfidenceLabel
    supporting_source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "hypothesis_id": self.hypothesis_id,
            "statement": self.statement,
            "confidence": self.confidence,
            "supporting_source_ids": self.supporting_source_ids,
        }


@dataclass
class EntityNode:
    entity_id: str
    name: str
    entity_type: str
    source_ids: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "entity_id": self.entity_id,
            "name": self.name,
            "entity_type": self.entity_type,
            "source_ids": self.source_ids,
        }


@dataclass
class EntityRelation:
    from_entity_id: str
    to_entity_id: str
    relation_type: str
    source_id: str
    label: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "from_entity_id": self.from_entity_id,
            "to_entity_id": self.to_entity_id,
            "relation_type": self.relation_type,
            "source_id": self.source_id,
            "label": self.label,
        }


@dataclass
class AuditIssue:
    code: str
    severity: Literal["info", "warning", "error"]
    message: str

    def to_dict(self) -> Dict[str, Any]:
        return {"code": self.code, "severity": self.severity, "message": self.message}


@dataclass
class AuditReport:
    passed: bool
    score: float
    issues: List[AuditIssue] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "passed": self.passed,
            "score": self.score,
            "issues": [i.to_dict() for i in self.issues],
        }


@dataclass
class ResearchProtocol:
    protocol_version: str
    conclusion: str
    confidence: ConfidenceLabel
    evidence_items: List[EvidenceItem]
    competing_hypotheses: List[CompetingHypothesis]
    financial_metrics: List[FinancialMetric] = field(default_factory=list)
    risk_signals: List[RiskSignal] = field(default_factory=list)
    investment_decision: InvestmentDecision | None = None
    industry_benchmarks: List[BenchmarkCompany] = field(default_factory=list)
    sandtable_simulation: SandtableSimulation | None = None
    entities: List[EntityNode] = field(default_factory=list)
    relations: List[EntityRelation] = field(default_factory=list)
    audit: AuditReport | None = None
    faithfulness: "FaithfulnessReport | None" = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "protocol_version": self.protocol_version,
            "conclusion": self.conclusion,
            "confidence": self.confidence,
            "evidence_items": [e.to_dict() for e in self.evidence_items],
            "competing_hypotheses": [h.to_dict() for h in self.competing_hypotheses],
            "financial_metrics": [m.to_dict() for m in self.financial_metrics],
            "risk_signals": [r.to_dict() for r in self.risk_signals],
            "investment_decision": self.investment_decision.to_dict() if self.investment_decision else None,
            "industry_benchmarks": [b.to_dict() for b in self.industry_benchmarks],
            "sandtable_simulation": self.sandtable_simulation.to_dict() if self.sandtable_simulation else None,
            "entities": [e.to_dict() for e in self.entities],
            "relations": [r.to_dict() for r in self.relations],
            "audit": self.audit.to_dict() if self.audit else None,
            "faithfulness": self.faithfulness.to_dict() if self.faithfulness else None,
        }
