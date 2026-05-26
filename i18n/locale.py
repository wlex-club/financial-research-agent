from __future__ import annotations

from enum import Enum
from typing import Any, Dict


class Locale(str, Enum):
    ZH = "zh"
    EN = "en"


MESSAGES: Dict[str, Dict[str, str]] = {
    "app.title": {
        "zh": "Financial Research Agent",
        "en": "Financial Research Agent",
    },
    "app.caption": {
        "zh": "投研决策 Demo · 每步有依据 · 结论可溯源",
        "en": "Investment Research Demo · Evidence at Every Step · Traceable Conclusions",
    },
    "app.mode.demo": {
        "zh": "Demo 模式（本地样本）",
        "en": "Demo mode (local samples)",
    },
    "app.mode.live": {
        "zh": "Live 模式（MiroMind API）",
        "en": "Live mode (MiroMind API)",
    },
    "app.mode.current": {
        "zh": "当前运行模式：**{mode}**",
        "en": "Current mode: **{mode}**",
    },
    "app.badge.traceable": {
        "zh": "结论可溯源",
        "en": "Traceable Conclusions",
    },
    "app.metric.steps": {
        "zh": "推理步骤",
        "en": "Reasoning Steps",
    },
    "app.metric.citations": {
        "zh": "引用依据",
        "en": "Citations",
    },
    "app.metric.sources": {
        "zh": "来源数量",
        "en": "Sources",
    },
    "app.empty.title": {
        "zh": "填写研究参数，点击「开始尽调」",
        "en": "Fill in parameters and click Run Due Diligence",
    },
    "app.empty.body": {
        "zh": "Agent 将展示完整推理链路与引用来源",
        "en": "The agent will show the full reasoning trace and cited sources",
    },
    "app.step.tool_input": {
        "zh": "工具输入",
        "en": "Tool Input",
    },
    "app.sidebar.lang": {
        "zh": "语言 / Language",
        "en": "Language / 语言",
    },
    "app.sidebar.params": {
        "zh": "研究参数",
        "en": "Research Parameters",
    },
    "app.sidebar.company": {
        "zh": "目标公司",
        "en": "Target Company",
    },
    "app.sidebar.question": {
        "zh": "研究问题",
        "en": "Research Question",
    },
    "app.sidebar.run": {
        "zh": "开始尽调",
        "en": "Run Due Diligence",
    },
    "app.sidebar.trace_title": {
        "zh": "可追溯设计",
        "en": "Traceability Design",
    },
    "app.sidebar.trace_body": {
        "zh": (
            "- 每一步展示：思考 → 工具 → 观察结果\n"
            "- 每条结论绑定 `source_id`\n"
            "- 未配置 API Key 时自动 Demo，不暴露核心产品代码"
        ),
        "en": (
            "- Each step shows: thought → tool → observation\n"
            "- Every claim is bound to a `source_id`\n"
            "- Auto Demo when no API key is configured; core product code stays private"
        ),
    },
    "app.spinner": {
        "zh": "Agent 正在多步推理...",
        "en": "Agent is running multi-step reasoning...",
    },
    "app.conclusion": {
        "zh": "研究结论",
        "en": "Research Conclusion",
    },
    "app.citations": {
        "zh": "结论依据（Citation）",
        "en": "Supporting Evidence (Citations)",
    },
    "app.steps": {
        "zh": "推理链路",
        "en": "Reasoning Trace",
    },
    "app.step.thought": {
        "zh": "思考",
        "en": "Thought",
    },
    "app.step.tool": {
        "zh": "工具",
        "en": "Tool",
    },
    "app.step.observation": {
        "zh": "观察结果",
        "en": "Observation",
    },
    "app.step.sources": {
        "zh": "本步引用来源",
        "en": "Sources in This Step",
    },
    "app.all_sources": {
        "zh": "全部来源索引",
        "en": "All Source Index",
    },
    "app.raw_json": {
        "zh": "原始 JSON（便于提交评审材料）",
        "en": "Raw JSON (for submission / review)",
    },
    "app.tab.conclusion": {
        "zh": "研究结论",
        "en": "Conclusion",
    },
    "app.tab.citations": {
        "zh": "引用依据",
        "en": "Citations",
    },
    "app.tab.trace": {
        "zh": "推理链路",
        "en": "Reasoning Trace",
    },
    "app.tab.sources": {
        "zh": "来源索引",
        "en": "Sources",
    },
    "app.sidebar.clear": {
        "zh": "清除结果",
        "en": "Clear Results",
    },
    "app.download.label": {
        "zh": "导出 JSON",
        "en": "Export JSON",
    },
    "app.download.filename": {
        "zh": "research_result.json",
        "en": "research_result.json",
    },
    "app.source_type.financial_report": {
        "zh": "财报",
        "en": "Annual Report",
    },
    "app.source_type.news": {
        "zh": "新闻",
        "en": "News",
    },
    "app.source_type.knowledge": {
        "zh": "知识库",
        "en": "Knowledge",
    },
    "app.sentiment.positive": {
        "zh": "利好",
        "en": "Positive",
    },
    "app.sentiment.negative": {
        "zh": "风险",
        "en": "Risk",
    },
    "app.sentiment.neutral": {
        "zh": "中性",
        "en": "Neutral",
    },
    "app.step.expand_hint": {
        "zh": "点击展开详情",
        "en": "Click to expand details",
    },
    "defaults.company": {
        "zh": "演示科技有限公司",
        "en": "Demo Technology Co., Ltd.",
    },
    "defaults.question": {
        "zh": "这家公司近期基本面与主要风险点是什么？",
        "en": "What are the company's recent fundamentals and key risk factors?",
    },
    "agent.demo.thought.report": {
        "zh": "先获取公司最新财报，建立财务基线。",
        "en": "Fetch the latest financial report to establish a financial baseline.",
    },
    "agent.demo.thought.news": {
        "zh": "检索近期新闻，识别经营与监管风险信号。",
        "en": "Search recent news to identify operational and regulatory risk signals.",
    },
    "agent.demo.thought.kb": {
        "zh": "在知识库中交叉验证问题相关的关键指标。",
        "en": "Cross-check key metrics related to the question in the knowledge base.",
    },
    "agent.demo.thought.market": {
        "zh": "拉取 A 股实时行情，与样本财报交叉验证估值与市场预期。",
        "en": "Fetch live A-share quote to cross-check valuation vs sample fundamentals.",
    },
    "agent.followup.thought.synthesize": {
        "zh": "针对追问「{question}」在已有证据池内做定向检索与重组。",
        "en": "Re-query the existing evidence pool to focus on the follow-up: \"{question}\".",
    },
    "agent.followup.thought.live": {
        "zh": "基于上轮收集到的证据，请 LLM 针对「{question}」生成增量回答。",
        "en": "Ask the LLM for an incremental answer to \"{question}\" using prior evidence.",
    },
    "agent.followup.conclusion": {
        "zh": (
            "针对追问「{question}」，基于对 {company} 已收集的 {evidence_count} 条证据进行的增量分析：\n\n"
            "**上轮主要结论**：{prior}\n\n"
            "**本轮聚焦**：在已有财报、新闻与知识库片段中检索匹配该问题的关键信号。"
            "如需更深入证据，可在原研究基础上发起新一轮带过滤条件的尽调。"
        ),
        "en": (
            "On the follow-up \"{question}\", incremental analysis over {evidence_count} prior pieces of "
            "evidence for {company}:\n\n"
            "**Prior takeaway**: {prior}\n\n"
            "**This round**: surfaced the most relevant filings, news and knowledge chunks for the new "
            "question. For deeper coverage, kick off a fresh due-diligence run with tighter filters."
        ),
    },
    "agent.followup.no_prior": {
        "zh": "（上轮结论较短，仅复用已抓取的来源池）",
        "en": "(Prior conclusion was brief — only reusing the existing source pool.)",
    },
    "agent.followup.claim": {
        "zh": "针对追问「{question}」，结论参考了已有来源：{titles}。",
        "en": "Follow-up \"{question}\" relies on prior sources: {titles}.",
    },
    "agent.followup.live_prompt": {
        "zh": (
            "你是一名严谨的金融研究分析师。下面是关于 {company} 的上一轮尽调摘要和证据要点：\n\n"
            "[上一轮结论]\n{prior}\n\n"
            "[关键证据]\n{evidence}\n\n"
            "现在请基于以上信息回答追问：「{question}」\n"
            "要求：1) 限制在 3-5 个简短段落；2) 在论点末尾用 [source_id] 引用证据；"
            "3) 如证据不足，明确指出需要补充哪些信息。"
        ),
        "en": (
            "You are a rigorous financial research analyst. Below is the prior due-diligence summary "
            "and key evidence for {company}:\n\n"
            "[Prior conclusion]\n{prior}\n\n"
            "[Key evidence]\n{evidence}\n\n"
            "Now answer the follow-up question: \"{question}\".\n"
            "Constraints: 1) 3-5 short paragraphs; 2) cite each claim with [source_id]; "
            "3) if evidence is insufficient, explicitly state what additional data is needed."
        ),
    },
    "agent.demo.news_query": {
        "zh": "风险 监管 订单",
        "en": "risk regulation orders",
    },
    "agent.demo.conclusion.base": {
        "zh": (
            "对 {company} 的尽调显示：2023 年营收约 {revenue} 元、净利润 {profit} 元，"
            "研发支出 {rd} 元，盈利与资产结构整体稳健。"
        ),
        "en": (
            "Due diligence on {company}: 2023 revenue ~{revenue} CNY, net profit {profit} CNY, "
            "R&D spend {rd} CNY. Profitability and asset structure look broadly stable."
        ),
    },
    "agent.demo.conclusion.risk": {
        "zh": " 但需关注 {count} 条负面舆情（如「{title}」），建议进一步核实订单与客户集中度。",
        "en": (
            " However, monitor {count} negative headline(s) (e.g. \"{title}\"). "
            "Further verify order pipeline and customer concentration."
        ),
    },
    "agent.demo.conclusion.no_risk": {
        "zh": " 当前样本新闻未出现重大负面信号。",
        "en": " Sample news feed shows no major negative signals.",
    },
    "agent.demo.cite.revenue": {
        "zh": "2023 营收约 {revenue} 元，净利润 {profit} 元",
        "en": "2023 revenue ~{revenue} CNY, net profit {profit} CNY",
    },
    "agent.demo.cite.rd": {
        "zh": "研发支出 8.002 亿元，体现持续投入",
        "en": "R&D spend of 800.2M CNY reflects sustained investment",
    },
    "agent.demo.cite.negative": {
        "zh": "存在负面舆情：{title}",
        "en": "Negative headline detected: {title}",
    },
    "agent.live.max_steps": {
        "zh": "已达到最大推理步数，请缩小问题范围后重试。",
        "en": "Maximum reasoning steps reached. Narrow the question and retry.",
    },
    "agent.live.user_start": {
        "zh": "公司：{company}\n问题：{question}\n请开始第一步工具调用。",
        "en": "Company: {company}\nQuestion: {question}\nStart with the first tool call.",
    },
    "agent.live.tool_feedback": {
        "zh": "工具结果：{observation}\n若信息不足继续调用工具，否则输出 finished=true 的最终 JSON。",
        "en": (
            "Tool result: {observation}\n"
            "If more evidence is needed, call another tool; otherwise return final JSON with finished=true."
        ),
    },
    "agent.live.bootstrap.financials": {
        "zh": "先拉取真实财务报表，建立 Live 财务基线。",
        "en": "Fetch real financial statements first to establish the Live financial baseline.",
    },
    "agent.live.bootstrap.news": {
        "zh": "检索真实公告/新闻，识别经营与监管事件。",
        "en": "Fetch real announcements/news to identify operating and regulatory events.",
    },
    "agent.live.bootstrap.quote": {
        "zh": "拉取实时行情，校验市场定价与估值指标。",
        "en": "Fetch live quote data to verify market pricing and valuation indicators.",
    },
    "agent.live.phase.bootstrap": {
        "zh": "建立 Live 基线 · 拉取财报 / 公告 / 行情",
        "en": "Establishing Live baseline · fetching financials / filings / quotes",
    },
    "agent.live.phase.flywheel_start": {
        "zh": "Deep Search 飞轮启动 · 反证 → 催化 → 校验",
        "en": "Deep Search flywheel · risk → catalyst → validation",
    },
    "agent.live.deep_search.risk": {
        "zh": "Deep Search 反证轮：围绕风险、监管、业绩下滑和估值压力扩展检索。",
        "en": "Deep Search counter-evidence loop: expand retrieval around risks, regulation, earnings downside, and valuation pressure.",
    },
    "agent.live.deep_search.catalyst": {
        "zh": "Deep Search 催化轮：检索增长驱动、订单、提价、渠道和资本开支线索。",
        "en": "Deep Search catalyst loop: retrieve growth drivers, orders, pricing, channels, and capex clues.",
    },
    "agent.live.deep_search.kb": {
        "zh": "Deep Search 校验轮：把问题、风险和催化放回知识库交叉验证。",
        "en": "Deep Search validation loop: cross-check the question, risks, and catalysts against the knowledge base.",
    },
    "agent.live.deep_search.risk_query": {
        "zh": "{company} {question} 风险 监管 下滑 估值 压力",
        "en": "{company} {question} risks regulation downside valuation pressure",
    },
    "agent.live.deep_search.catalyst_query": {
        "zh": "{company} {question} 增长 催化 订单 提价 渠道",
        "en": "{company} {question} growth catalyst orders pricing channels",
    },
    "agent.live.deep_search.kb_query": {
        "zh": "{company} {question} 反证 催化 风险 关键指标",
        "en": "{company} {question} counter-evidence catalysts risks key metrics",
    },
    "agent.live.json_retry": {
        "zh": "上一条回复无法解析为约定 JSON。请只返回一个合法 JSON 对象，不要 markdown，不要解释。",
        "en": "The previous reply was not parseable as the required JSON. Return one valid JSON object only, with no markdown or explanation.",
    },
    "agent.live.json_retry_strict": {
        "zh": "你下一条回复只能是一个 JSON 对象本身，前后不允许任何文字。",
        "en": "Your next reply must be a single JSON object only — no text before or after it.",
    },
    "agent.live.invalid_schema": {
        "zh": "模型未按约定 schema 返回结果（仅给出与研究无关的 JSON），已中止本次推理。请稍后重试或换一种问法。",
        "en": "The model did not return the required ReAct schema (it returned an unrelated JSON object). The run was aborted. Please retry or rephrase the question.",
    },
    "agent.live.salvage_prompt": {
        "zh": (
            "你是金融尽调分析师。下面是针对【{company}】关于「{question}」已收集到的证据片段（含来源 ID）。"
            "请基于这些证据用 3–6 段中文写出一份审慎、可追溯的研究结论；"
            "在关键判断后用 [source_id] 形式引用来源；不要编造未出现的事实；"
            "若证据不足以下结论，请明确说明并指出缺口。\n\n证据：\n{evidence}"
        ),
        "en": (
            "You are a financial due-diligence analyst. Below are evidence excerpts (with source IDs) "
            "collected for [{company}] regarding \"{question}\". "
            "Write a cautious, traceable research conclusion in 3–6 English paragraphs based ONLY on these excerpts. "
            "Cite sources inline using [source_id] after key claims. Do not fabricate facts not present in the excerpts. "
            "If the evidence is insufficient, state so explicitly and identify the gaps.\n\nEvidence:\n{evidence}"
        ),
    },
    "tools.report.title": {
        "zh": "演示科技有限公司 2023 年年度报告",
        "en": "Demo Technology Co., Ltd. — 2023 Annual Report",
    },
    "tools.kb.revenue.title": {
        "zh": "演示科技 2023 年报 · 收入",
        "en": "Demo Tech 2023 Annual Report · Revenue",
    },
    "tools.kb.revenue.text": {
        "zh": "营业总收入 10,234,567,890 元，其中主营业务收入 98 亿元。",
        "en": "Total revenue 10,234,567,890 CNY, including 9.8B CNY from core operations.",
    },
    "tools.kb.profit.title": {
        "zh": "演示科技 2023 年报 · 利润",
        "en": "Demo Tech 2023 Annual Report · Profit",
    },
    "tools.kb.profit.text": {
        "zh": "净利润 16.5 亿元，营业利润 21.34 亿元。",
        "en": "Net profit 1.65B CNY, operating profit 2.134B CNY.",
    },
    "tools.kb.rd.title": {
        "zh": "演示科技 2023 年报 · 研发",
        "en": "Demo Tech 2023 Annual Report · R&D",
    },
    "tools.kb.rd.text": {
        "zh": "研发费用 8.002 亿元，占营收约 7.8%。",
        "en": "R&D expense 800.2M CNY, ~7.8% of revenue.",
    },
    "tools.kb.note": {
        "zh": "检索范围含年报与 {count} 条新闻摘要",
        "en": "Search scope includes annual report and {count} news summaries",
    },
}


def normalize_locale(value: str | Locale | None) -> Locale:
    if isinstance(value, Locale):
        return value
    if not value:
        return Locale.ZH
    normalized = str(value).strip().lower()
    if normalized.startswith("en"):
        return Locale.EN
    return Locale.ZH


def t(key: str, locale: str | Locale | None = None, **kwargs: Any) -> str:
    loc = normalize_locale(locale)
    bucket = MESSAGES.get(key)
    if not bucket:
        return key
    text = bucket.get(loc.value, bucket.get("en", key))
    if kwargs:
        return text.format(**kwargs)
    return text
