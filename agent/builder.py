from __future__ import annotations

import re
from typing import Any, Dict, List

from agent.auditor import audit_protocol
from agent.faithfulness import check_faithfulness
from agent.protocol import (
    CompetingHypothesis,
    EntityNode,
    EntityRelation,
    EvidenceItem,
    BenchmarkCompany,
    FinancialMetric,
    InvestmentDecision,
    ResearchProtocol,
    RiskSignal,
    SandtableAgent,
    SandtableEvent,
    SandtableRound,
    SandtableSimulation,
)
from agent.trace import CitedClaim, ResearchResult, SourceRef, SourceType

RISK_KEYWORDS_ZH = ("风险", "监管", "负面", "问询")
REGULATORY_KEYWORDS_ZH = ("监管", "问询")
CHIP_KEYWORDS_ZH = ("芯片",)
CUSTOMER_KEYWORDS_ZH = ("客户", "云厂商")
YIELD_KEYWORDS_ZH = ("良率", "量产")
MARGIN_KEYWORDS_ZH = ("利润率", "研发")
FINANCIAL_LABELS_ZH = {
    "revenue": "营业总收入",
    "net_profit": "净利润",
    "rd_expense": "研发费用",
    "total_assets": "资产总计",
    "total_liabilities": "负债合计",
}


def _rating_for_source(source: SourceRef) -> tuple[str, str]:
    if source.source_type == SourceType.FINANCIAL_REPORT:
        return "B", "2"
    if source.source_type == SourceType.MARKET_DATA:
        return "B", "2"
    if source.source_type == SourceType.NEWS:
        return "C", "3"
    return "B", "3"


def _relation_for_source(source_id: str, citations: List[CitedClaim]) -> str:
    for cite in citations:
        if source_id in cite.source_ids and any(
            kw in cite.claim.lower()
            for kw in ("risk", "negative", "regulatory", *RISK_KEYWORDS_ZH)
        ):
            return "contradicting"
    if "news:demo-tech-002" in source_id:
        return "contradicting"
    return "supporting"


def build_entity_graph(
    company: str,
    sources: List[SourceRef],
    locale: str,
) -> tuple[List[EntityNode], List[EntityRelation]]:
    company_id = "entity:company"
    entities = [
        EntityNode(
            entity_id=company_id,
            name=company,
            entity_type="company",
            source_ids=[s.source_id for s in sources if s.source_type == SourceType.FINANCIAL_REPORT][:1],
        )
    ]
    relations: List[EntityRelation] = []

    for src in sources:
        if src.source_type != SourceType.NEWS:
            continue
        if (
            "002" in src.source_id
            or "inquiry" in (src.source_id + src.title).lower()
            or any(keyword in src.title for keyword in REGULATORY_KEYWORDS_ZH)
        ):
            reg_id = "entity:regulator"
            entities.append(
                EntityNode(
                    entity_id=reg_id,
                    name="Regulatory inquiry" if locale == "en" else "监管问询",
                    entity_type="event",
                    source_ids=[src.source_id],
                )
            )
            relations.append(
                EntityRelation(
                    from_entity_id=reg_id,
                    to_entity_id=company_id,
                    relation_type="regulatory_risk",
                    source_id=src.source_id,
                    label="triggers scrutiny" if locale == "en" else "引发监管关注",
                )
            )
        if (
            "001" in src.source_id
            or "chip" in src.title.lower()
            or any(keyword in src.title for keyword in CHIP_KEYWORDS_ZH)
        ):
            cust_id = "entity:cloud_customer"
            entities.append(
                EntityNode(
                    entity_id=cust_id,
                    name="Cloud customers" if locale == "en" else "云厂商客户",
                    entity_type="customer",
                    source_ids=[src.source_id],
                )
            )
            relations.append(
                EntityRelation(
                    from_entity_id=cust_id,
                    to_entity_id=company_id,
                    relation_type="trial_order",
                    source_id=src.source_id,
                    label="trial orders" if locale == "en" else "试订单合作",
                )
            )

    dedup = {e.entity_id: e for e in entities}
    return list(dedup.values()), relations


def build_protocol_from_result(result: ResearchResult) -> ResearchProtocol:
    source_map = {s.source_id: s for s in result.all_sources}
    evidence_items: List[EvidenceItem] = []

    for cite in result.citations:
        for sid in cite.source_ids:
            src = source_map.get(sid)
            rel, cred = _rating_for_source(src) if src else ("C", "4")
            evidence_items.append(
                EvidenceItem(
                    source_id=sid,
                    relation=_relation_for_source(sid, result.citations),
                    source_reliability=rel,
                    info_credibility=cred,
                    excerpt=src.excerpt[:240] if src else "",
                    claim=cite.claim,
                )
            )

    for src in result.all_sources:
        if any(e.source_id == src.source_id for e in evidence_items):
            continue
        rel_rating, info_rating = _rating_for_source(src)
        evidence_items.append(
            EvidenceItem(
                source_id=src.source_id,
                relation=_relation_for_source(src.source_id, result.citations),
                source_reliability=rel_rating,
                info_credibility=info_rating,
                excerpt=src.excerpt[:240],
            )
        )

    hypotheses = _default_hypotheses(result)
    entities, relations = build_entity_graph(result.company, result.all_sources, result.locale)
    financial_metrics = build_financial_metrics(result.all_sources)
    risk_signals = build_risk_signals(result.all_sources)
    investment_decision = build_investment_decision(financial_metrics, risk_signals, result)
    industry_benchmarks = build_industry_benchmarks(result.company, financial_metrics, result.locale)
    sandtable_simulation = build_sandtable_simulation(
        result=result,
        metrics=financial_metrics,
        risks=risk_signals,
        hypotheses=hypotheses,
        decision=investment_decision,
    )

    confidence = _infer_confidence(evidence_items, result.citations)
    protocol = ResearchProtocol(
        protocol_version="1.0",
        conclusion=result.conclusion,
        confidence=confidence,
        evidence_items=evidence_items,
        competing_hypotheses=hypotheses,
        financial_metrics=financial_metrics,
        risk_signals=risk_signals,
        investment_decision=investment_decision,
        industry_benchmarks=industry_benchmarks,
        sandtable_simulation=sandtable_simulation,
        entities=entities,
        relations=relations,
    )
    protocol.audit = audit_protocol(protocol, locale=result.locale)
    protocol.faithfulness = check_faithfulness(
        result.citations,
        result.all_sources,
        locale=result.locale,
    )
    return protocol


def build_investment_decision(
    metrics: List[FinancialMetric],
    risks: List[RiskSignal],
    result: ResearchResult,
) -> InvestmentDecision:
    metric_map = {m.metric_id: m for m in metrics}
    high_risks = [risk for risk in risks if risk.severity == "high"]
    medium_or_high_risks = [risk for risk in risks if risk.severity in ("medium", "high")]
    net_margin = metric_map.get("net_margin")
    debt_ratio = metric_map.get("debt_to_asset_ratio")

    if high_risks:
        rating = "watch"
        confidence = "medium"
    elif net_margin and net_margin.value >= 12 and debt_ratio and debt_ratio.value <= 50:
        rating = "positive"
        confidence = "high"
    else:
        rating = "cautious"
        confidence = "medium"

    if result.locale == "en":
        rationale = (
            "Fundamentals are supported by profitability and R&D investment, "
            "but risk signals should be monitored before a stronger positive call."
        )
        monitoring = [
            "Top-five customer revenue concentration",
            "Receivables aging and collection",
            "Mass-production yield rate",
            "R&D spend pressure on margins",
        ]
    else:
        rationale = "盈利能力与研发投入提供基本面支撑，但监管问询、客户集中度与量产良率仍需跟踪。"
        monitoring = [
            "前五大客户收入占比",
            "应收账款账龄与回款",
            "量产良率",
            "研发投入对利润率的压制",
        ]

    source_ids = sorted({sid for risk in medium_or_high_risks for sid in risk.source_ids})
    if not source_ids:
        source_ids = [m.source_id for m in metrics[:1]]

    return InvestmentDecision(
        rating=rating,
        confidence=confidence,
        rationale=rationale,
        monitoring_indicators=monitoring,
        source_ids=source_ids,
    )


def build_industry_benchmarks(
    company: str,
    metrics: List[FinancialMetric],
    locale: str,
) -> List[BenchmarkCompany]:
    metric_map = {m.metric_id: m for m in metrics}
    revenue_billion = round((metric_map.get("revenue").value if metric_map.get("revenue") else 0) / 100000000, 2)
    net_margin = metric_map.get("net_margin").value if metric_map.get("net_margin") else 0
    rd_ratio = metric_map.get("rd_expense_ratio").value if metric_map.get("rd_expense_ratio") else 0
    debt_ratio = metric_map.get("debt_to_asset_ratio").value if metric_map.get("debt_to_asset_ratio") else 0

    target_note = "target company" if locale == "en" else "目标公司"
    cloud_note = "larger scale, lower R&D ratio" if locale == "en" else "规模更大，研发费用率较低"
    chip_note = "higher R&D intensity" if locale == "en" else "研发强度更高"
    software_note = "higher margin, asset-light model" if locale == "en" else "利润率较高，资产较轻"

    return [
        BenchmarkCompany(
            company_id="target",
            name=company,
            revenue_billion=revenue_billion,
            net_margin=round(net_margin, 2),
            rd_ratio=round(rd_ratio, 2),
            debt_to_asset_ratio=round(debt_ratio, 2),
            note=target_note,
        ),
        BenchmarkCompany(
            company_id="peer-cloud",
            name="CloudInfra Peer A",
            revenue_billion=156.4,
            net_margin=10.8,
            rd_ratio=5.6,
            debt_to_asset_ratio=48.2,
            note=cloud_note,
        ),
        BenchmarkCompany(
            company_id="peer-chip",
            name="AIChip Peer B",
            revenue_billion=72.1,
            net_margin=8.9,
            rd_ratio=14.5,
            debt_to_asset_ratio=36.7,
            note=chip_note,
        ),
        BenchmarkCompany(
            company_id="peer-software",
            name="InfraSoftware Peer C",
            revenue_billion=88.6,
            net_margin=18.4,
            rd_ratio=9.2,
            debt_to_asset_ratio=28.9,
            note=software_note,
        ),
    ]


def build_sandtable_simulation(
    *,
    result: ResearchResult,
    metrics: List[FinancialMetric],
    risks: List[RiskSignal],
    hypotheses: List[CompetingHypothesis],
    decision: InvestmentDecision,
) -> SandtableSimulation:
    locale = result.locale
    metric_map = {m.metric_id: m for m in metrics}
    net_margin = metric_map.get("net_margin")
    rd_ratio = metric_map.get("rd_expense_ratio")
    debt_ratio = metric_map.get("debt_to_asset_ratio")
    high_risks = [risk for risk in risks if risk.severity == "high"]
    risk_score = sum(risk.score for risk in risks) / max(1, len(risks))
    source_ids = _sandtable_source_ids(result, risks, decision)
    action = _sandtable_action(decision.rating)
    action_label = _sandtable_action_label(action, locale)
    confidence_score = max(
        55,
        min(
            96,
            round(
                _confidence_base(decision.confidence)
                - risk_score * 8
                + min(8, len(result.citations) * 2),
            ),
        ),
    )

    cfo_bias = "bull" if (net_margin and net_margin.value >= 15 and (not debt_ratio or debt_ratio.value <= 65)) else "bear" if (debt_ratio and debt_ratio.value >= 75) else "watch"
    strategy_bias = "bull" if (rd_ratio and rd_ratio.value >= 5) or len(hypotheses) >= 2 else "watch"
    risk_bias = "bear" if high_risks else "watch" if risks else "bull"
    market_bias = "bull" if decision.rating == "positive" else "bear" if decision.rating == "cautious" else "watch"
    allocator_bias = "bull" if action == "buy" else "bear" if action == "cautious" else "watch"

    agents = [
        SandtableAgent(
            agent_id="financial_modeler",
            name="Financial Modeler" if locale == "en" else "财务建模 Agent",
            role="Financial baseline validator" if locale == "en" else "财务基线验证者",
            objective="Validate revenue, profit, leverage, and metric consistency." if locale == "en" else "验证收入、利润、杠杆与指标一致性。",
            bias=cfo_bias,
            stance=_financial_agent_stance(net_margin, debt_ratio, locale),
            source_ids=[m.source_id for m in metrics[:4]],
        ),
        SandtableAgent(
            agent_id="industry_researcher",
            name="Industry Researcher" if locale == "en" else "行业研究 Agent",
            role="Growth and competitive position challenger" if locale == "en" else "增长与竞争格局挑战者",
            objective="Test whether catalysts can offset uncertainty." if locale == "en" else "检验增长催化能否覆盖不确定性。",
            bias=strategy_bias,
            stance=_strategy_agent_stance(hypotheses, locale),
            source_ids=_unique_ids([sid for h in hypotheses for sid in h.supporting_source_ids])[:4],
        ),
        SandtableAgent(
            agent_id="risk_officer",
            name="Risk Officer" if locale == "en" else "风控 Agent",
            role="Counter-evidence and downside detector" if locale == "en" else "反证与下行情景搜索者",
            objective="Force the investment case through risk and stress scenarios." if locale == "en" else "用风险与压力情景反向检验投资结论。",
            bias=risk_bias,
            stance=_risk_agent_stance(risks, locale),
            source_ids=_unique_ids([sid for risk in risks for sid in risk.source_ids])[:4],
        ),
        SandtableAgent(
            agent_id="market_sentiment",
            name="Market Sentiment" if locale == "en" else "市场情绪 Agent",
            role="Price and expectation feedback reader" if locale == "en" else "价格与预期反馈读取者",
            objective="Compare the research conclusion with market-data signals." if locale == "en" else "用行情与估值反馈校验研究结论。",
            bias=market_bias,
            stance=decision.rationale,
            source_ids=source_ids[:4],
        ),
        SandtableAgent(
            agent_id="portfolio_manager",
            name="Portfolio Manager" if locale == "en" else "组合经理 Agent",
            role="Final allocation decision maker" if locale == "en" else "最终仓位决策者",
            objective="Convert debate into an executable action and monitoring list." if locale == "en" else "把攻防结果转化为可执行动作与监控清单。",
            bias=allocator_bias,
            stance=action_label,
            source_ids=source_ids[:6],
        ),
    ]

    rounds = [
        SandtableRound(
            round_number=1,
            title="Baseline calibration" if locale == "en" else "基线校准",
            summary=_round_one_summary(net_margin, rd_ratio, debt_ratio, locale),
            events=[
                SandtableEvent(
                    round_number=1,
                    agent_id="financial_modeler",
                    action_type="baseline",
                    title="Financial baseline" if locale == "en" else "财务基线",
                    content=_round_one_summary(net_margin, rd_ratio, debt_ratio, locale),
                    impact_score=7.0,
                    reasoning="Financial metrics anchor the rest of the debate." if locale == "en" else "财务指标决定后续推演的基本盘。",
                    stance_shift=_financial_agent_stance(net_margin, debt_ratio, locale),
                    source_ids=[m.source_id for m in metrics[:4]],
                ),
                SandtableEvent(
                    round_number=1,
                    agent_id="market_sentiment",
                    action_type="observation",
                    title="Market feedback" if locale == "en" else "市场反馈",
                    content=decision.rationale,
                    impact_score=6.0,
                    reasoning="Market feedback checks whether fundamentals are already priced." if locale == "en" else "行情反馈用于判断基本面是否已被定价。",
                    stance_shift=_bias_label(market_bias, locale),
                    source_ids=source_ids[:4],
                ),
            ],
            source_ids=source_ids[:4],
        ),
        SandtableRound(
            round_number=2,
            title="Stress scenario debate" if locale == "en" else "压力情景攻防",
            summary=_round_two_summary(risks, hypotheses, locale),
            events=[
                SandtableEvent(
                    round_number=2,
                    agent_id="risk_officer",
                    action_type="warning",
                    title="Counter-evidence scan" if locale == "en" else "反证扫描",
                    content=_risk_agent_stance(risks, locale),
                    impact_score=8.0 if high_risks else 6.0,
                    target_agent_id="industry_researcher",
                    reasoning="A decision is only useful after downside paths are tested." if locale == "en" else "只有通过下行情景测试，结论才有决策价值。",
                    stance_shift=_bias_label(risk_bias, locale),
                    source_ids=_unique_ids([sid for risk in risks for sid in risk.source_ids])[:4],
                ),
                SandtableEvent(
                    round_number=2,
                    agent_id="industry_researcher",
                    action_type="rebuttal",
                    title="Growth hypothesis" if locale == "en" else "增长假设",
                    content=_strategy_agent_stance(hypotheses, locale),
                    impact_score=7.0,
                    target_agent_id="risk_officer",
                    reasoning="Catalysts must be weighed against risk signals." if locale == "en" else "增长催化需要与风险信号同场对比。",
                    stance_shift=_bias_label(strategy_bias, locale),
                    source_ids=_unique_ids([sid for h in hypotheses for sid in h.supporting_source_ids])[:4],
                ),
            ],
            source_ids=source_ids[1:6],
        ),
        SandtableRound(
            round_number=3,
            title="Decision convergence" if locale == "en" else "决策收敛",
            summary=_round_three_summary(result.company, action_label, locale),
            events=[
                SandtableEvent(
                    round_number=3,
                    agent_id="portfolio_manager",
                    action_type="decision",
                    title="Allocation action" if locale == "en" else "仓位动作",
                    content=_round_three_summary(result.company, action_label, locale),
                    impact_score=9.0,
                    reasoning="The final action must stay conditional on monitoring indicators." if locale == "en" else "最终动作必须绑定后续监控指标，而不是无条件判断。",
                    stance_shift=action_label,
                    source_ids=source_ids[:6],
                )
            ],
            source_ids=source_ids[:6],
        ),
    ]

    return SandtableSimulation(
        action=action,
        action_label=action_label,
        confidence_score=confidence_score,
        conclusion=_sandtable_conclusion(result.company, action_label, risks, locale),
        agents=agents,
        rounds=rounds,
        next_actions=decision.monitoring_indicators[:4],
        source_ids=source_ids,
    )


def _sandtable_action(rating: str) -> str:
    if rating == "positive":
        return "buy"
    if rating == "cautious":
        return "cautious"
    return "watch"


def _sandtable_action_label(action: str, locale: str) -> str:
    labels = {
        "zh": {
            "buy": "建议积极配置",
            "watch": "建议观察/分批",
            "cautious": "建议谨慎回避",
        },
        "en": {
            "buy": "Actively allocate",
            "watch": "Watch / stage in",
            "cautious": "Stay cautious",
        },
    }
    return labels.get(locale, labels["zh"]).get(action, labels["zh"]["watch"])


def _confidence_base(confidence: str) -> int:
    return {"high": 88, "medium": 74, "low": 62}.get(confidence, 70)


def _unique_ids(source_ids: List[str]) -> List[str]:
    return list(dict.fromkeys(sid for sid in source_ids if sid))


def _sandtable_source_ids(
    result: ResearchResult,
    risks: List[RiskSignal],
    decision: InvestmentDecision,
) -> List[str]:
    return _unique_ids(
        decision.source_ids
        + [sid for citation in result.citations for sid in citation.source_ids]
        + [sid for risk in risks for sid in risk.source_ids]
        + [source.source_id for source in result.all_sources]
    )[:8]


def _metric_value(metric: FinancialMetric | None) -> str:
    if metric is None:
        return "—"
    return f"{metric.value:g}{'%' if metric.unit == 'percent' else ' ' + metric.unit}"


def _bias_label(bias: str, locale: str) -> str:
    if locale == "en":
        return {"bull": "bullish", "bear": "cautious", "watch": "neutral watch"}.get(bias, "neutral watch")
    return {"bull": "偏多", "bear": "偏谨慎", "watch": "中性观察"}.get(bias, "中性观察")


def _financial_agent_stance(
    net_margin: FinancialMetric | None,
    debt_ratio: FinancialMetric | None,
    locale: str,
) -> str:
    if locale == "en":
        return f"Margin {_metric_value(net_margin)} and leverage {_metric_value(debt_ratio)} define the baseline."
    return f"净利率 {_metric_value(net_margin)}、资产负债率 {_metric_value(debt_ratio)} 是本轮基线。"


def _strategy_agent_stance(hypotheses: List[CompetingHypothesis], locale: str) -> str:
    main = hypotheses[0].statement if hypotheses else ""
    if locale == "en":
        return main or "Growth catalysts still need evidence confirmation."
    return main or "增长催化仍需证据确认。"


def _risk_agent_stance(risks: List[RiskSignal], locale: str) -> str:
    if not risks:
        return "No high-severity risk signal detected." if locale == "en" else "暂未检出高强度风险信号。"
    top = sorted(risks, key=lambda r: r.score, reverse=True)[0]
    if locale == "en":
        return f"Top risk is {top.risk_id} with severity {top.severity} and score {top.score:.0%}."
    return f"首要风险为 {top.risk_id}，强度 {top.severity}，风险分 {top.score:.0%}。"


def _round_one_summary(
    net_margin: FinancialMetric | None,
    rd_ratio: FinancialMetric | None,
    debt_ratio: FinancialMetric | None,
    locale: str,
) -> str:
    if locale == "en":
        return (
            f"The sandbox first anchors fundamentals: margin {_metric_value(net_margin)}, "
            f"R&D ratio {_metric_value(rd_ratio)}, debt ratio {_metric_value(debt_ratio)}."
        )
    return (
        f"沙盘先校准基本盘：净利率 {_metric_value(net_margin)}，"
        f"研发投入率 {_metric_value(rd_ratio)}，资产负债率 {_metric_value(debt_ratio)}。"
    )


def _round_two_summary(
    risks: List[RiskSignal],
    hypotheses: List[CompetingHypothesis],
    locale: str,
) -> str:
    risk_text = _risk_agent_stance(risks, locale)
    hyp_text = _strategy_agent_stance(hypotheses, locale)
    if locale == "en":
        return f"Risk and Strategy debate whether '{hyp_text}' can withstand the counter-evidence: {risk_text}"
    return f"风控与行业研究进入攻防：增长假设「{hyp_text}」需要经受反证检验，{risk_text}"


def _round_three_summary(company: str, action_label: str, locale: str) -> str:
    if locale == "en":
        return f"Portfolio Manager converges on {company}: {action_label}, conditional on the monitoring list."
    return f"组合经理对 {company} 收敛为「{action_label}」，并将动作绑定到后续监控清单。"


def _sandtable_conclusion(
    company: str,
    action_label: str,
    risks: List[RiskSignal],
    locale: str,
) -> str:
    if locale == "en":
        risk_clause = "Risk constraints remain material." if risks else "No material high-severity risk dominates."
        return (
            f"Sandbox consensus: {company} is best handled as '{action_label}'. "
            f"The decision is supported by the financial baseline and growth hypothesis, while {risk_clause} "
            "This is a conditional decision, not a black-box rating."
        )
    risk_clause = "风险约束仍然存在" if risks else "暂未出现主导性高强度风险"
    return (
        f"沙盘共识：{company} 当前更适合「{action_label}」。"
        f"支持点来自财务基线与增长假设，约束项为{risk_clause}。"
        "该结论是带监控条件的推演决策，不是黑箱评级。"
    )


def build_financial_metrics(sources: List[SourceRef]) -> List[FinancialMetric]:
    report = next((s for s in sources if s.source_type == SourceType.FINANCIAL_REPORT), None)
    if not report:
        return []

    text = report.excerpt
    values = {
        metric_id: _extract_amount(text, label)
        for metric_id, label in FINANCIAL_LABELS_ZH.items()
    }
    source_id = report.source_id
    metrics: List[FinancialMetric] = []

    for metric_id, value in values.items():
        if value is not None:
            metrics.append(
                FinancialMetric(
                    metric_id=metric_id,
                    value=round(value, 2),
                    unit="CNY",
                    source_id=source_id,
                )
            )

    revenue = values["revenue"]
    if revenue:
        if values["net_profit"] is not None:
            metrics.append(
                FinancialMetric(
                    metric_id="net_margin",
                    value=round(values["net_profit"] / revenue * 100, 2),
                    unit="percent",
                    source_id=source_id,
                    formula="net_profit / revenue",
                )
            )
        if values["rd_expense"] is not None:
            metrics.append(
                FinancialMetric(
                    metric_id="rd_expense_ratio",
                    value=round(values["rd_expense"] / revenue * 100, 2),
                    unit="percent",
                    source_id=source_id,
                    formula="rd_expense / revenue",
                )
            )

    if values["total_assets"] and values["total_liabilities"] is not None:
        metrics.append(
            FinancialMetric(
                metric_id="debt_to_asset_ratio",
                value=round(values["total_liabilities"] / values["total_assets"] * 100, 2),
                unit="percent",
                source_id=source_id,
                formula="total_liabilities / total_assets",
            )
        )

    return metrics


def build_risk_signals(sources: List[SourceRef]) -> List[RiskSignal]:
    signals: List[RiskSignal] = []
    source_text = {s.source_id: f"{s.title} {s.excerpt}".lower() for s in sources}

    regulatory_ids = [sid for sid, text in source_text.items() if "regulatory" in text or "inquiry" in text or any(kw in text for kw in REGULATORY_KEYWORDS_ZH)]
    if regulatory_ids:
        signals.append(RiskSignal(risk_id="regulatory_disclosure", severity="high", score=0.82, source_ids=regulatory_ids))

    customer_ids = [sid for sid, text in source_text.items() if "customer" in text or any(kw in text for kw in CUSTOMER_KEYWORDS_ZH)]
    if customer_ids:
        signals.append(RiskSignal(risk_id="customer_concentration", severity="medium", score=0.62, source_ids=customer_ids))

    yield_ids = [sid for sid, text in source_text.items() if "yield" in text or any(kw in text for kw in YIELD_KEYWORDS_ZH)]
    if yield_ids:
        signals.append(RiskSignal(risk_id="commercialization_yield", severity="medium", score=0.58, source_ids=yield_ids))

    margin_ids = [sid for sid, text in source_text.items() if "margin" in text or any(kw in text for kw in MARGIN_KEYWORDS_ZH)]
    if margin_ids:
        signals.append(RiskSignal(risk_id="margin_pressure", severity="medium", score=0.55, source_ids=margin_ids))

    return signals


def _extract_amount(text: str, label: str) -> float | None:
    match = re.search(rf"{re.escape(label)}\s*[:：]?\s*([0-9,]+(?:\.\d+)?)", text)
    if not match:
        return None
    return float(match.group(1).replace(",", ""))


def _infer_confidence(evidence: List[EvidenceItem], citations: List[CitedClaim]) -> str:
    if len(citations) >= 3 and len(evidence) >= 3:
        return "high"
    if len(citations) >= 2:
        return "medium"
    return "low"


def _default_hypotheses(result: ResearchResult) -> List[CompetingHypothesis]:
    locale = result.locale
    has_risk = any(
        "002" in sid or "inquiry" in sid
        for c in result.citations
        for sid in c.source_ids
    ) or any(s.source_id.endswith("002") for s in result.all_sources)

    if locale == "en":
        main = CompetingHypothesis(
            hypothesis_id="h-main",
            statement="Fundamentals are broadly stable with solid revenue and R&D investment.",
            confidence="medium" if has_risk else "high",
            supporting_source_ids=[s.source_id for s in result.all_sources if "report" in s.source_id],
        )
        alt = CompetingHypothesis(
            hypothesis_id="h-alt",
            statement="Regulatory scrutiny and customer concentration may pressure near-term outlook.",
            confidence="medium" if has_risk else "low",
            supporting_source_ids=[s.source_id for s in result.all_sources if s.source_type == SourceType.NEWS],
        )
    else:
        main = CompetingHypothesis(
            hypothesis_id="h-main",
            statement="基本面整体稳健，营收与研发投入具备支撑。",
            confidence="medium" if has_risk else "high",
            supporting_source_ids=[s.source_id for s in result.all_sources if "report" in s.source_id],
        )
        alt = CompetingHypothesis(
            hypothesis_id="h-alt",
            statement="监管问询与客户集中度可能带来短期风险压力。",
            confidence="medium" if has_risk else "low",
            supporting_source_ids=[s.source_id for s in result.all_sources if s.source_type == SourceType.NEWS],
        )
    return [main, alt]


def merge_live_protocol_fields(
    protocol: ResearchProtocol,
    payload: Dict[str, Any],
    *,
    locale: str = "zh",
) -> ResearchProtocol:
    if payload.get("confidence") in ("low", "medium", "high"):
        protocol.confidence = payload["confidence"]

    if payload.get("competing_hypotheses"):
        protocol.competing_hypotheses = [
            CompetingHypothesis(
                hypothesis_id=str(h.get("hypothesis_id", f"h-{i}")),
                statement=str(h.get("statement", "")),
                confidence=h.get("confidence", "medium"),
                supporting_source_ids=list(h.get("supporting_source_ids", [])),
            )
            for i, h in enumerate(payload["competing_hypotheses"])
            if h.get("statement")
        ]

    if payload.get("evidence_items"):
        protocol.evidence_items = [
            EvidenceItem(
                source_id=str(e.get("source_id", "")),
                relation=e.get("relation", "supporting"),
                source_reliability=e.get("source_reliability", "C"),
                info_credibility=e.get("info_credibility", "3"),
                excerpt=str(e.get("excerpt", ""))[:240],
                claim=str(e.get("claim", "")),
            )
            for e in payload["evidence_items"]
            if e.get("source_id")
        ]

    if payload.get("entities"):
        protocol.entities = [
            EntityNode(
                entity_id=str(e.get("entity_id", f"entity:{i}")),
                name=str(e.get("name", "")),
                entity_type=str(e.get("entity_type", "unknown")),
                source_ids=list(e.get("source_ids", [])),
            )
            for i, e in enumerate(payload["entities"])
            if e.get("name")
        ]

    if payload.get("relations"):
        protocol.relations = [
            EntityRelation(
                from_entity_id=str(r.get("from_entity_id", "")),
                to_entity_id=str(r.get("to_entity_id", "")),
                relation_type=str(r.get("relation_type", "related_to")),
                source_id=str(r.get("source_id", "")),
                label=str(r.get("label", "")),
            )
            for r in payload["relations"]
            if r.get("from_entity_id") and r.get("to_entity_id")
        ]

    protocol.audit = audit_protocol(protocol, locale=locale)
    return protocol
