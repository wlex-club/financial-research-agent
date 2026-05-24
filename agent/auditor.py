from __future__ import annotations

from agent.protocol import AuditIssue, AuditReport, ResearchProtocol

AUDIT_PASS_THRESHOLD = 0.75


def audit_protocol(protocol: ResearchProtocol, *, locale: str = "zh") -> AuditReport:
    issues: list[AuditIssue] = []
    score = 1.0

    if not protocol.conclusion.strip():
        issues.append(_issue("empty_conclusion", "error", locale))
        score -= 0.4

    if len(protocol.evidence_items) == 0:
        issues.append(_issue("no_evidence", "error", locale))
        score -= 0.35

    if len(protocol.competing_hypotheses) < 2:
        issues.append(_issue("missing_hypotheses", "error", locale))
        score -= 0.25

    unsupported = [
        item for item in protocol.evidence_items if not item.source_id.strip()
    ]
    if unsupported:
        issues.append(_issue("missing_source_id", "error", locale))
        score -= 0.2

    if protocol.confidence == "high" and len(protocol.evidence_items) < 2:
        issues.append(_issue("thin_evidence_high_conf", "warning", locale))
        score -= 0.1

    supporting = [e for e in protocol.evidence_items if e.relation == "supporting"]
    contradicting = [e for e in protocol.evidence_items if e.relation == "contradicting"]
    if supporting and not contradicting and protocol.confidence != "low":
        issues.append(_issue("no_contradicting_considered", "warning", locale))
        score -= 0.08

    low_cred = [e for e in protocol.evidence_items if e.info_credibility in ("5", "6")]
    if len(low_cred) > len(protocol.evidence_items) // 2:
        issues.append(_issue("weak_source_credibility", "warning", locale))
        score -= 0.08

    score = max(0.0, min(1.0, score))
    passed = score >= AUDIT_PASS_THRESHOLD and not any(i.severity == "error" for i in issues)
    return AuditReport(passed=passed, score=round(score, 2), issues=issues)


def _issue(code: str, severity: str, locale: str) -> AuditIssue:
    messages = {
        "empty_conclusion": ("结论为空", "Conclusion is empty"),
        "no_evidence": ("缺少证据项", "No evidence items attached"),
        "missing_hypotheses": ("竞争假设不足 2 条", "Fewer than 2 competing hypotheses"),
        "missing_source_id": ("存在无 source_id 的证据", "Evidence missing source_id"),
        "thin_evidence_high_conf": ("高置信但证据偏少", "High confidence with thin evidence"),
        "no_contradicting_considered": ("未纳入反证", "No contradicting evidence considered"),
        "weak_source_credibility": ("低可信度来源占比过高", "Too many low-credibility sources"),
    }
    zh, en = messages.get(code, (code, code))
    return AuditIssue(code=code, severity=severity, message=zh if locale.startswith("zh") else en)
