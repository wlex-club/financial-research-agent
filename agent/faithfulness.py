from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List

from agent.trace import CitedClaim, SourceRef

FAITHFULNESS_PASS_THRESHOLD = 0.7

_STOPWORDS_EN = {
    "the", "and", "for", "with", "from", "that", "this", "are", "was", "has",
    "have", "about", "into", "their", "they", "its", "may", "not", "but",
}
_STOPWORDS_ZH = {"的", "了", "与", "及", "在", "是", "有", "为", "等", "对", "中", "上", "下"}


@dataclass
class ClaimGrounding:
    claim: str
    source_ids: List[str]
    grounded: bool
    reason: str

    def to_dict(self) -> dict:
        return {
            "claim": self.claim,
            "source_ids": self.source_ids,
            "grounded": self.grounded,
            "reason": self.reason,
        }


@dataclass
class FaithfulnessReport:
    score: float
    passed: bool
    total_claims: int
    grounded_claims: int
    ungrounded_claims: List[str] = field(default_factory=list)
    claim_details: List[ClaimGrounding] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "score": self.score,
            "passed": self.passed,
            "total_claims": self.total_claims,
            "grounded_claims": self.grounded_claims,
            "ungrounded_claims": self.ungrounded_claims,
            "claim_details": [c.to_dict() for c in self.claim_details],
        }


def check_faithfulness(
    citations: List[CitedClaim],
    sources: List[SourceRef],
    *,
    locale: str = "zh",
) -> FaithfulnessReport:
    source_map: Dict[str, SourceRef] = {s.source_id: s for s in sources}
    details: List[ClaimGrounding] = []
    ungrounded: List[str] = []

    for cite in citations:
        claim = cite.claim.strip()
        if not claim:
            continue

        if not cite.source_ids:
            details.append(
                ClaimGrounding(
                    claim=claim,
                    source_ids=[],
                    grounded=False,
                    reason=_msg("no_source_ids", locale),
                )
            )
            ungrounded.append(claim)
            continue

        missing = [sid for sid in cite.source_ids if sid not in source_map]
        if missing:
            details.append(
                ClaimGrounding(
                    claim=claim,
                    source_ids=cite.source_ids,
                    grounded=False,
                    reason=_msg("unknown_source", locale, ids=", ".join(missing)),
                )
            )
            ungrounded.append(claim)
            continue

        excerpts = " ".join(source_map[sid].excerpt for sid in cite.source_ids)
        grounded, reason = _claim_grounded_in_text(claim, excerpts, locale)
        details.append(
            ClaimGrounding(
                claim=claim,
                source_ids=cite.source_ids,
                grounded=grounded,
                reason=reason,
            )
        )
        if not grounded:
            ungrounded.append(claim)

    total = len(details)
    grounded_count = sum(1 for d in details if d.grounded)
    score = round(grounded_count / total, 2) if total else 1.0
    passed = score >= FAITHFULNESS_PASS_THRESHOLD and not ungrounded
    return FaithfulnessReport(
        score=score,
        passed=passed,
        total_claims=total,
        grounded_claims=grounded_count,
        ungrounded_claims=ungrounded,
        claim_details=details,
    )


def _claim_grounded_in_text(claim: str, excerpt: str, locale: str) -> tuple[bool, str]:
    claim_lower = claim.lower()
    excerpt_lower = excerpt.lower()

    numbers = re.findall(r"\d[\d,.\s]*\d|\d+", claim)
    for num in numbers:
        if not _number_in_text(num, excerpt_lower):
            return False, _msg("number_mismatch", locale, num=num.strip())

    tokens = _extract_tokens(claim, locale)
    if not tokens:
        return True, _msg("generic_ok", locale)

    hits = sum(1 for token in tokens if token in excerpt_lower)
    ratio = hits / len(tokens)
    if ratio >= 0.35 or hits >= 2:
        return True, _msg("token_overlap", locale, hits=hits, total=len(tokens))

    return False, _msg("weak_overlap", locale, hits=hits, total=len(tokens))


def _extract_tokens(text: str, locale: str) -> List[str]:
    tokens: List[str] = []
    if locale.startswith("zh"):
        tokens.extend(ch for ch in text if "\u4e00" <= ch <= "\u9fff" and ch not in _STOPWORDS_ZH)
    tokens.extend(
        w.lower()
        for w in re.findall(r"[a-zA-Z]{3,}", text)
        if w.lower() not in _STOPWORDS_EN
    )
    dedup: List[str] = []
    for token in tokens:
        if token not in dedup:
            dedup.append(token)
    return dedup[:12]


def _number_in_text(num: str, text: str) -> bool:
    normalized = re.sub(r"[\s,]", "", num)
    text_norm = re.sub(r"[\s,]", "", text)
    if normalized and normalized in text_norm:
        return True
    digits_only = re.sub(r"[^\d]", "", num)
    text_digits = re.sub(r"[^\d]", "", text_norm)
    if len(digits_only) >= 3 and digits_only in text_digits:
        return True
    return False


def _msg(code: str, locale: str, **kwargs: object) -> str:
    messages = {
        "no_source_ids": ("缺少 source_id", "Missing source_id"),
        "unknown_source": ("来源不存在: {ids}", "Unknown source: {ids}"),
        "number_mismatch": ("数字 {num} 未在来源中出现", "Number {num} not found in sources"),
        "generic_ok": ("判断性表述，来源覆盖可接受", "Judgment claim with acceptable coverage"),
        "token_overlap": ("关键词命中 {hits}/{total}", "Keyword overlap {hits}/{total}"),
        "weak_overlap": ("来源支撑不足 ({hits}/{total})", "Weak source support ({hits}/{total})"),
    }
    zh, en = messages.get(code, (code, code))
    template = zh if locale.startswith("zh") else en
    return template.format(**kwargs)
