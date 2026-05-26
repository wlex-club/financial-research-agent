from __future__ import annotations

import asyncio
import json
from typing import Any, AsyncGenerator, Dict, List, Optional, Set

from agent.builder import build_protocol_from_result, merge_live_protocol_fields
from agent.faithfulness import check_faithfulness
from agent.prompts import get_system_prompt
from agent.trace import AgentStep, CitedClaim, ResearchResult, SourceRef, SourceType
from config import get_settings
from i18n.locale import Locale, normalize_locale, t
from llm.miromind_client import MiroMindClient, parse_tool_call
from tools import run_tool
from tools.market_data import resolve_stock_code


class ResearchAgent:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = MiroMindClient()

    @staticmethod
    def _merge_source(store: Dict[str, SourceRef], ref: SourceRef) -> None:
        existing = store.get(ref.source_id)
        if existing is None or len(ref.excerpt) > len(existing.excerpt):
            store[ref.source_id] = ref

    async def run(
        self,
        company: str,
        question: str,
        locale: str | Locale = Locale.ZH,
    ) -> ResearchResult:
        loc = normalize_locale(locale)
        return self._finalize(await self._run_live(company, question, loc))

    async def run_stream(
        self,
        company: str,
        question: str,
        locale: str | Locale = Locale.ZH,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Yield agent reasoning events one at a time for SSE streaming."""
        loc = normalize_locale(locale)
        yield {"type": "started", "company": company, "question": question}

        try:
            async for ev in self._run_live_stream(company, question, loc):
                yield ev
            return
        except RuntimeError as exc:
            yield {"type": "error", "message": str(exc)}
            return

    @staticmethod
    def _refs_from_payload(payload: Dict[str, Any]) -> List[SourceRef]:
        refs: List[SourceRef] = []
        for item in payload.get("sources", []):
            refs.append(
                SourceRef(
                    source_id=item["source_id"],
                    source_type=SourceType(item["source_type"]),
                    title=item["title"],
                    excerpt=item["excerpt"],
                    url=item.get("url"),
                    page=item.get("page"),
                )
            )
        return refs

    def _live_source_kinds(self, sources: Dict[str, SourceRef]) -> Set[str]:
        kinds: Set[str] = set()
        for ref in sources.values():
            if ref.source_id.startswith(("report:demo-tech", "news:demo-tech", "kb:")):
                continue
            if ref.source_type == SourceType.FINANCIAL_REPORT:
                kinds.add("financials")
            elif ref.source_type == SourceType.NEWS:
                kinds.add("announcements")
            elif ref.source_type == SourceType.MARKET_DATA:
                kinds.add("market")
        return kinds

    def _ensure_live_evidence(self, company: str, all_sources: Dict[str, SourceRef]) -> None:
        # Soft check only: any company is allowed to run Live mode.
        # When verified source categories are scarce (e.g. company not in registry,
        # or East Money API unreachable), the report is still generated based on
        # the LLM's general knowledge. The UI naturally reflects the limited
        # evidence via the existing trust score and citation panels.
        return

    def _bootstrap_live_evidence(
        self,
        company: str,
        question: str,
        locale: Locale,
        all_sources: Dict[str, SourceRef],
    ) -> List[AgentStep]:
        steps: List[AgentStep] = []

        def collect(payload: Dict[str, Any]) -> List[SourceRef]:
            refs = self._refs_from_payload(payload)
            for ref in refs:
                self._merge_source(all_sources, ref)
            return refs

        stock_code = resolve_stock_code(company)
        if not stock_code:
            return steps

        report = run_tool("fetch_financial_report", {"company_name": company}, locale=locale.value)
        if not report.get("error"):
            steps.append(
                AgentStep(
                    step_number=1,
                    thought=t("agent.live.bootstrap.financials", locale),
                    action="fetch_financial_report",
                    action_input={"company_name": company},
                    observation=json.dumps(
                        {
                            "data_source": report.get("data_source"),
                            "fetched_at": report.get("fetched_at"),
                            "highlights": report.get("highlights"),
                        },
                        ensure_ascii=False,
                    ),
                    sources=collect(report),
                    data_status=self._data_status(report),
                )
            )

        news = run_tool("search_news", {"company_name": company, "query": question}, locale=locale.value)
        if not news.get("error"):
            articles = news.get("articles") or []
            steps.append(
                AgentStep(
                    step_number=len(steps) + 1,
                    thought=t("agent.live.bootstrap.news", locale),
                    action="search_news",
                    action_input={"company_name": company, "query": question},
                    observation=json.dumps(
                        {
                            "data_source": news.get("data_source"),
                            "fetched_at": news.get("fetched_at"),
                            "articles": [
                                {"title": a.get("title"), "url": a.get("url")}
                                for a in articles[:6]
                            ],
                        },
                        ensure_ascii=False,
                    ),
                    sources=collect(news),
                    data_status=self._data_status(news),
                )
            )

        quote = run_tool(
            "fetch_market_data",
            {"stock_code": stock_code, "action": "quote", "company_name": company},
            locale=locale.value,
        )
        if not quote.get("error"):
            steps.append(
                AgentStep(
                    step_number=len(steps) + 1,
                    thought=t("agent.live.bootstrap.quote", locale),
                    action="fetch_market_data",
                    action_input={"stock_code": stock_code, "action": "quote"},
                    observation=json.dumps(
                        {
                            "data_source": quote.get("data_source"),
                            "fetched_at": quote.get("fetched_at"),
                            "stock_name": quote.get("stock_name"),
                            "current_price": quote.get("current_price"),
                            "change_percent": quote.get("change_percent"),
                            "pe_ratio": quote.get("pe_ratio"),
                            "pb_ratio": quote.get("pb_ratio"),
                        },
                        ensure_ascii=False,
                    ),
                    sources=collect(quote),
                    data_status=self._data_status(quote),
                )
            )

        return steps

    # Skill registry — the three deterministic deep-search loops the agent
    # always runs before letting the LLM synthesize. Exposed as a class
    # attribute so the front-end / other callers can introspect the flywheel
    # composition without having to re-derive it.
    DEEP_SEARCH_FLYWHEEL_LOOPS: List[Dict[str, str]] = [
        {"name": "risk", "tool": "search_news"},
        {"name": "catalyst", "tool": "search_news"},
        {"name": "kb", "tool": "knowledge_query"},
    ]

    def _iter_deep_search_flywheel(
        self,
        company: str,
        question: str,
        locale: Locale,
        all_sources: Dict[str, SourceRef],
        start_step: int,
    ):
        """Yield ``(loop_name, AgentStep)`` one loop at a time.

        Splitting this out from ``_run_deep_search_flywheel`` lets the
        streaming runner emit per-loop progress (so users see "Deep Search ·
        risk → catalyst → kb" in the thinking console live), while the sync
        ``_run_live`` path keeps using the eager wrapper below.
        """

        def collect(payload: Dict[str, Any]) -> List[SourceRef]:
            refs = self._refs_from_payload(payload)
            for ref in refs:
                self._merge_source(all_sources, ref)
            return refs

        loops = [
            {
                "thought_key": "agent.live.deep_search.risk",
                "tool": "search_news",
                "input": {
                    "company_name": company,
                    "query": t(
                        "agent.live.deep_search.risk_query",
                        locale,
                        company=company,
                        question=question,
                    ),
                },
            },
            {
                "thought_key": "agent.live.deep_search.catalyst",
                "tool": "search_news",
                "input": {
                    "company_name": company,
                    "query": t(
                        "agent.live.deep_search.catalyst_query",
                        locale,
                        company=company,
                        question=question,
                    ),
                },
            },
            {
                "thought_key": "agent.live.deep_search.kb",
                "tool": "knowledge_query",
                "input": {
                    "query": t(
                        "agent.live.deep_search.kb_query",
                        locale,
                        company=company,
                        question=question,
                    ),
                },
            },
        ]

        seen_signatures: Set[str] = set()
        emitted = 0
        for loop in loops:
            payload = run_tool(loop["tool"], loop["input"], locale=locale.value)
            refs = collect(payload)
            loop_name = loop["thought_key"].rsplit(".", 1)[-1]
            data_status = self._data_status(payload)
            data_status["loop"] = f"deep_search:{loop_name}"
            compact_payload: Dict[str, Any] = {
                "deep_search_loop": loop_name,
                "data_status": data_status,
            }
            if payload.get("articles"):
                compact_payload["articles"] = [
                    {
                        "title": item.get("title"),
                        "summary": (item.get("summary") or "")[:180],
                        "url": item.get("url"),
                    }
                    for item in payload.get("articles", [])[:5]
                ]
            if payload.get("chunks"):
                compact_payload["chunks"] = [
                    {
                        "chunk_id": item.get("chunk_id"),
                        "title": item.get("title"),
                        "text": (item.get("text") or "")[:220],
                    }
                    for item in payload.get("chunks", [])[:5]
                ]
            signature = json.dumps(compact_payload, ensure_ascii=False, sort_keys=True)
            if signature in seen_signatures:
                compact_payload["duplicate_evidence_note"] = "retrieval returned overlapping evidence; kept for audit trail"
            seen_signatures.add(signature)

            step = AgentStep(
                step_number=start_step + emitted,
                thought=t(loop["thought_key"], locale),
                action=loop["tool"],
                action_input=loop["input"],
                observation=json.dumps(compact_payload, ensure_ascii=False)[:2000],
                sources=refs,
                data_status=data_status,
            )
            emitted += 1
            yield loop_name, step

    def _run_deep_search_flywheel(
        self,
        company: str,
        question: str,
        locale: Locale,
        all_sources: Dict[str, SourceRef],
        start_step: int,
    ) -> List[AgentStep]:
        """Eager wrapper around :py:meth:`_iter_deep_search_flywheel` kept for
        the non-streaming code path."""
        return [
            step
            for _, step in self._iter_deep_search_flywheel(
                company, question, locale, all_sources, start_step
            )
        ]

    @staticmethod
    def _data_status(payload: Dict[str, Any]) -> Dict[str, Any]:
        status = dict(payload.get("data_status") or {})
        status.setdefault("hit", not bool(payload.get("error")))
        status.setdefault("source_count", len(payload.get("sources") or []))
        status.setdefault("data_source", payload.get("data_source") or "local")
        status.setdefault("cache_hit", bool(payload.get("cache_hit")))
        if payload.get("fetched_at"):
            status.setdefault("fetched_at", payload.get("fetched_at"))
        return status

    # Phrases that strongly indicate the model is *describing the output
    # schema* instead of answering the question. We use them to detect when
    # a "finished" payload's conclusion is just a meta-explanation and
    # should be salvaged from observations instead.
    _META_LEAK_KEYWORDS = (
        "react schema",
        "json 对象",
        "json object",
        '"action"',
        "`action`",
        '"finished"',
        "`finished`",
        '"citations"',
        "`citations`",
        "schema",
        "输出必须",
        "markdown 围栏",
        "markdown fence",
        "must start with",
    )

    @classmethod
    def _conclusion_is_meta_leak(cls, conclusion: str) -> bool:
        """Detect the "I will format my answer like this" anti-pattern."""
        text = (conclusion or "").lower()
        if not text or len(text) < 40:
            return False
        hits = sum(1 for kw in cls._META_LEAK_KEYWORDS if kw in text)
        return hits >= 2

    async def _resolve_unparseable_payload(
        self,
        raw: str,
        company: str,
        question: str,
        steps: List[AgentStep],
        locale: Locale,
    ) -> Dict[str, Any]:
        """Decide what to do when both initial chat + retries fail to parse.

        If we already collected evidence-bearing steps, try a salvage prose
        summary instead of bailing out. Otherwise, surface a clear retry
        notice (without leaking the raw off-schema JSON to the user).
        """
        has_evidence = any((s.sources for s in steps) or (s.observation or "").strip() for s in steps)
        if has_evidence:
            summary = await self._summarize_from_observations(company, question, steps, locale)
            if summary:
                return {
                    "thought": "Salvaged conclusion from collected observations.",
                    "finished": True,
                    "conclusion": summary,
                    "citations": [],
                }
        return self._safe_fallback_payload(raw, locale)

    @staticmethod
    def _safe_fallback_payload(raw: str, locale: Locale) -> Dict[str, Any]:
        """Build a guardrail payload when parse_tool_call fails.

        The model occasionally drifts and returns an unrelated JSON object
        (e.g. ``{"valid": true}`` from an audit-style prompt). Surfacing that
        raw string as the user-visible conclusion looks broken; instead we
        return a localized "schema violation" notice and let the user retry.
        Plain prose fallbacks still pass through as the conclusion so the
        report is not lost for non-JSON model output.
        """
        stripped = (raw or "").strip()
        looks_like_json = (
            (stripped.startswith("{") and stripped.endswith("}"))
            or (stripped.startswith("[") and stripped.endswith("]"))
        )
        if looks_like_json:
            return {
                "thought": "Model returned off-schema JSON; aborting gracefully.",
                "finished": True,
                "conclusion": t("agent.live.invalid_schema", locale),
                "citations": [],
            }
        return {
            "thought": raw,
            "finished": True,
            "conclusion": raw,
            "citations": [],
        }

    async def _chat_payload(self, messages: List[Dict[str, str]], locale: Locale) -> tuple[str, Dict[str, Any] | None]:
        """Call the LLM and parse a ReAct JSON payload, with progressive retries.

        We perform up to two extra rounds with increasingly strict format
        nudges before giving up. This avoids aborting the whole research run
        because of a single off-schema reply (e.g. ``{"valid": true}``).
        """
        raw = await self.client.chat(messages)
        payload = parse_tool_call(raw)
        if payload is not None:
            return raw, payload

        history: List[Dict[str, str]] = list(messages)
        last_raw = raw
        retry_keys = ("agent.live.json_retry", "agent.live.json_retry_strict")
        for key in retry_keys:
            history = [
                *history,
                {"role": "assistant", "content": last_raw},
                {"role": "user", "content": t(key, locale)},
            ]
            retry_raw = await self.client.chat(history, temperature=0.0)
            retry_payload = parse_tool_call(retry_raw)
            if retry_payload is not None:
                return retry_raw, retry_payload
            last_raw = retry_raw
        return last_raw, None

    async def _summarize_from_observations(
        self,
        company: str,
        question: str,
        steps: List[AgentStep],
        locale: Locale,
    ) -> str:
        """Salvage path: ask the model for a prose conclusion using the
        observations we already collected. Used when JSON retries all fail
        but evidence exists, so users get *something* useful instead of an
        empty "please retry" notice.
        """
        evidence_lines: List[str] = []
        for s in steps:
            obs = (s.observation or "").strip()
            if not obs:
                continue
            ids = ", ".join(ref.source_id for ref in (s.sources or [])[:4])
            tag = f"[{ids}] " if ids else ""
            evidence_lines.append(f"- step {s.step_number} {tag}{obs[:600]}")
        evidence_block = "\n".join(evidence_lines[:12]) or "(no observations collected)"
        prompt = t(
            "agent.live.salvage_prompt",
            locale,
            company=company,
            question=question,
            evidence=evidence_block,
        )
        try:
            text = await self.client.chat(
                [{"role": "user", "content": prompt}],
                temperature=0.2,
            )
        except Exception:  # noqa: BLE001 — best-effort salvage
            return ""
        stripped = (text or "").strip()
        # If the model — despite explicit instructions — still wraps the
        # answer in JSON or starts meta-describing the schema, drop the
        # salvage and let the caller fall through to the friendly retry
        # notice. Better to show "please retry" than another off-schema blob.
        if not stripped:
            return ""
        if stripped.startswith("{") or stripped.startswith("["):
            return ""
        if "```" in stripped[:80]:
            return ""
        if self._conclusion_is_meta_leak(stripped):
            return ""
        return stripped

    def _finalize(self, result: ResearchResult, live_payload: Dict[str, Any] | None = None) -> ResearchResult:
        protocol = build_protocol_from_result(result)
        if live_payload:
            protocol = merge_live_protocol_fields(protocol, live_payload, locale=result.locale)
        protocol.faithfulness = check_faithfulness(
            result.citations,
            result.all_sources,
            locale=result.locale,
        )
        result.protocol = protocol.to_dict()
        return result

    async def run_followup(
        self,
        base_result: Dict[str, Any],
        followup_question: str,
        locale: str | Locale = Locale.ZH,
    ) -> ResearchResult:
        """Incremental follow-up: reuse prior sources, produce a focused mini-report.

        ``base_result`` is the previous ``ResearchResult.to_dict()`` payload sent
        by the client. We avoid re-running the heavy tool chain and instead
        produce 1-2 lightweight reasoning steps tied to the new question.
        """
        loc = normalize_locale(locale)
        company = base_result.get("company") or ""
        prior_sources = base_result.get("all_sources") or []

        return self._finalize(
            await self._run_followup_live(company, followup_question, prior_sources, base_result, loc)
        )

    @staticmethod
    def _source_refs_from_dicts(sources: List[Dict[str, Any]]) -> List[SourceRef]:
        refs: List[SourceRef] = []
        for item in sources:
            if not isinstance(item, dict):
                continue
            stype = item.get("source_type") or "knowledge"
            try:
                source_type = SourceType(stype)
            except ValueError:
                source_type = SourceType.KNOWLEDGE
            refs.append(
                SourceRef(
                    source_id=item.get("source_id") or "",
                    source_type=source_type,
                    title=item.get("title") or "",
                    excerpt=item.get("excerpt") or "",
                    url=item.get("url"),
                    page=item.get("page"),
                )
            )
        return refs

    async def _run_followup_live(
        self,
        company: str,
        followup_question: str,
        prior_sources: List[Dict[str, Any]],
        base_result: Dict[str, Any],
        locale: Locale,
    ) -> ResearchResult:
        prior_refs = self._source_refs_from_dicts(prior_sources)
        all_sources: Dict[str, SourceRef] = {}
        for ref in prior_refs:
            self._merge_source(all_sources, ref)

        evidence_lines = []
        for src in prior_sources[:8]:
            title = (src.get("title") or "").strip()
            excerpt = (src.get("excerpt") or "").strip().replace("\n", " ")[:200]
            sid = src.get("source_id") or ""
            if title or excerpt:
                evidence_lines.append(f"- [{sid}] {title}: {excerpt}")
        evidence_block = "\n".join(evidence_lines) or "(no prior evidence)"

        prior_conclusion = (base_result.get("conclusion") or "").strip()
        followup_prompt = t(
            "agent.followup.live_prompt",
            locale,
            company=company,
            prior=prior_conclusion[:600],
            evidence=evidence_block,
            question=followup_question,
        )

        system_prompt = get_system_prompt(locale)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": followup_prompt},
        ]
        completion = await self.client.chat(messages, temperature=0.2)
        answer = (completion or "").strip()
        if not answer:
            raise RuntimeError("Empty follow-up response from LLM")

        step = AgentStep(
            step_number=1,
            thought=t("agent.followup.thought.live", locale, question=followup_question),
            action="llm_followup",
            action_input={"question": followup_question, "scope": "prior_evidence"},
            observation=answer[:600],
            sources=prior_refs[:4],
        )

        citation_ids = [src.get("source_id") for src in prior_sources[:3] if src.get("source_id")]
        citations = [
            CitedClaim(
                claim=t(
                    "agent.followup.claim",
                    locale,
                    question=followup_question,
                    titles=", ".join((s.get("title") or "")[:24] for s in prior_sources[:3]),
                ),
                source_ids=[cid for cid in citation_ids if cid],
            )
        ]

        result = ResearchResult(
            company=company,
            question=followup_question,
            conclusion=answer,
            steps=[step],
            citations=citations,
            all_sources=list(all_sources.values()),
            mode="followup_live",
            locale=locale.value,
        )
        return result

    async def _run_live(self, company: str, question: str, locale: Locale) -> ResearchResult:
        steps: List[AgentStep] = []
        all_sources: Dict[str, SourceRef] = {}
        steps.extend(self._bootstrap_live_evidence(company, question, locale, all_sources))
        steps.extend(
            self._run_deep_search_flywheel(
                company,
                question,
                locale,
                all_sources,
                start_step=len(steps) + 1,
            )
        )
        self._ensure_live_evidence(company, all_sources)
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": get_system_prompt(locale)},
            {
                "role": "user",
                "content": t(
                    "agent.live.user_start",
                    locale,
                    company=company,
                    question=question,
                ),
            },
        ]
        if steps:
            messages.append(
                {
                    "role": "user",
                    "content": t(
                        "agent.live.tool_feedback",
                        locale,
                        observation="\n\n".join(step.observation for step in steps),
                    ),
                }
            )

        for _ in range(1, self.settings.max_agent_steps + 1):
            step_idx = len(steps) + 1
            raw, payload = await self._chat_payload(messages, locale)
            if not payload:
                payload = await self._resolve_unparseable_payload(
                    raw, company, question, steps, locale
                )

            thought = str(payload.get("thought", ""))
            if payload.get("finished"):
                conclusion = str(payload.get("conclusion", ""))
                if self._conclusion_is_meta_leak(conclusion):
                    salvaged = await self._summarize_from_observations(
                        company, question, steps, locale
                    )
                    if salvaged:
                        conclusion = salvaged
                        payload = {**payload, "conclusion": salvaged, "citations": []}
                    else:
                        payload = self._safe_fallback_payload("{}", locale)
                        conclusion = str(payload.get("conclusion", ""))
                citations = [
                    CitedClaim(
                        claim=str(item.get("claim", "")),
                        source_ids=list(item.get("source_ids", [])),
                    )
                    for item in payload.get("citations", [])
                ]
                result = ResearchResult(
                    company=company,
                    question=question,
                    conclusion=conclusion,
                    steps=steps,
                    citations=citations,
                    all_sources=list(all_sources.values()),
                    mode="live",
                    locale=locale.value,
                )
                self._ensure_live_evidence(company, all_sources)
                return self._finalize(result, live_payload=payload)

            action = str(payload.get("action", ""))
            action_input = dict(payload.get("action_input", {}))
            observation_payload = run_tool(action, action_input, locale=locale.value)

            refs: List[SourceRef] = []
            for item in observation_payload.get("sources", []):
                ref = SourceRef(
                    source_id=item["source_id"],
                    source_type=SourceType(item["source_type"]),
                    title=item["title"],
                    excerpt=item["excerpt"],
                    url=item.get("url"),
                )
                self._merge_source(all_sources, ref)
                refs.append(ref)

            step = AgentStep(
                step_number=step_idx,
                thought=thought,
                action=action,
                action_input=action_input,
                observation=json.dumps(observation_payload, ensure_ascii=False)[:2000],
                sources=refs,
                data_status=self._data_status(observation_payload),
            )
            steps.append(step)

            messages.append({"role": "assistant", "content": raw})
            messages.append(
                {
                    "role": "user",
                    "content": t(
                        "agent.live.tool_feedback",
                        locale,
                        observation=step.observation,
                    ),
                }
            )

        result = ResearchResult(
            company=company,
            question=question,
            conclusion=t("agent.live.max_steps", locale),
            steps=steps,
            citations=[],
            all_sources=list(all_sources.values()),
            mode="live",
            locale=locale.value,
        )
        return self._finalize(result)

    async def _run_live_stream(
        self,
        company: str,
        question: str,
        locale: Locale,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        steps: List[AgentStep] = []
        all_sources: Dict[str, SourceRef] = {}

        yield {
            "type": "phase",
            "phase": "bootstrap",
            "label": t("agent.live.phase.bootstrap", locale),
        }
        bootstrap_steps = self._bootstrap_live_evidence(company, question, locale, all_sources)
        steps.extend(bootstrap_steps)
        for step in bootstrap_steps:
            yield {"type": "step", "step": step}

        yield {
            "type": "phase",
            "phase": "flywheel_start",
            "loops": [loop["name"] for loop in self.DEEP_SEARCH_FLYWHEEL_LOOPS],
            "label": t("agent.live.phase.flywheel_start", locale),
        }
        for loop_name, step in self._iter_deep_search_flywheel(
            company,
            question,
            locale,
            all_sources,
            start_step=len(steps) + 1,
        ):
            yield {
                "type": "phase",
                "phase": "flywheel",
                "loop": loop_name,
                "label": t(f"agent.live.deep_search.{loop_name}", locale),
                "step_number": step.step_number,
            }
            steps.append(step)
            yield {"type": "step", "step": step}

        self._ensure_live_evidence(company, all_sources)
        messages: List[Dict[str, str]] = [
            {"role": "system", "content": get_system_prompt(locale)},
            {
                "role": "user",
                "content": t(
                    "agent.live.user_start",
                    locale,
                    company=company,
                    question=question,
                ),
            },
        ]
        if steps:
            messages.append(
                {
                    "role": "user",
                    "content": t(
                        "agent.live.tool_feedback",
                        locale,
                        observation="\n\n".join(step.observation for step in steps),
                    ),
                }
            )

        for _ in range(1, self.settings.max_agent_steps + 1):
            step_idx = len(steps) + 1
            yield {"type": "phase", "phase": "thinking", "step_number": step_idx}
            raw, payload = await self._chat_payload(messages, locale)
            if not payload:
                payload = await self._resolve_unparseable_payload(
                    raw, company, question, steps, locale
                )

            thought = str(payload.get("thought", ""))
            if payload.get("finished"):
                conclusion = str(payload.get("conclusion", ""))
                if self._conclusion_is_meta_leak(conclusion):
                    yield {
                        "type": "warning",
                        "message": "Detected schema-meta in conclusion; salvaging from observations.",
                    }
                    salvaged = await self._summarize_from_observations(
                        company, question, steps, locale
                    )
                    if salvaged:
                        conclusion = salvaged
                        payload = {**payload, "conclusion": salvaged, "citations": []}
                    else:
                        payload = self._safe_fallback_payload("{}", locale)
                        conclusion = str(payload.get("conclusion", ""))
                citations = [
                    CitedClaim(
                        claim=str(item.get("claim", "")),
                        source_ids=list(item.get("source_ids", [])),
                    )
                    for item in payload.get("citations", [])
                ]
                result = ResearchResult(
                    company=company,
                    question=question,
                    conclusion=conclusion,
                    steps=steps,
                    citations=citations,
                    all_sources=list(all_sources.values()),
                    mode="live",
                    locale=locale.value,
                )
                self._ensure_live_evidence(company, all_sources)
                yield {"type": "phase", "phase": "audit"}
                finalized = self._finalize(result, live_payload=payload)
                yield {"type": "final", "result": finalized}
                return

            action = str(payload.get("action", ""))
            action_input = dict(payload.get("action_input", {}))
            observation_payload = run_tool(action, action_input, locale=locale.value)

            refs: List[SourceRef] = []
            for item in observation_payload.get("sources", []):
                ref = SourceRef(
                    source_id=item["source_id"],
                    source_type=SourceType(item["source_type"]),
                    title=item["title"],
                    excerpt=item["excerpt"],
                    url=item.get("url"),
                )
                self._merge_source(all_sources, ref)
                refs.append(ref)

            step = AgentStep(
                step_number=step_idx,
                thought=thought,
                action=action,
                action_input=action_input,
                observation=json.dumps(observation_payload, ensure_ascii=False)[:2000],
                sources=refs,
                data_status=self._data_status(observation_payload),
            )
            steps.append(step)
            yield {"type": "step", "step": step}

            messages.append({"role": "assistant", "content": raw})
            messages.append(
                {
                    "role": "user",
                    "content": t(
                        "agent.live.tool_feedback",
                        locale,
                        observation=step.observation,
                    ),
                }
            )

        result = ResearchResult(
            company=company,
            question=question,
            conclusion=t("agent.live.max_steps", locale),
            steps=steps,
            citations=[],
            all_sources=list(all_sources.values()),
            mode="live",
            locale=locale.value,
        )
        yield {"type": "final", "result": self._finalize(result)}
