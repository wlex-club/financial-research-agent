from __future__ import annotations

from i18n.locale import Locale

FINANCE_WORKFLOW_ZH = """
## 投研工作流（必须遵循）
1. **数据获取** — 财报基线 → 新闻舆情 → 知识交叉验证 →（可选）A 股行情/公告
2. **结构化提取** — 营收、利润、研发、负债等关键指标，标注单位与报告期
3. **Deep Search 飞轮** — 围绕原问题拆出「反证/风险」「催化/增长」「知识校验」三轮再检索
4. **交叉验证** — 对比多来源；数值冲突时说明采用哪一方及原因
5. **竞争假设** — 至少给出主假设 + 备择假设，并绑定 source_id
6. **风险清单** — 监管、客户集中度、估值、现金流等至少 3 项可核查风险
7. **结论输出** — 区分「事实」与「判断」，附 citations + evidence_items
"""

FINANCE_WORKFLOW_EN = """
## Research workflow (required)
1. **Data acquisition** — report baseline → news → knowledge cross-check → (optional) A-share quote/announcements
2. **Structured extraction** — revenue, profit, R&D, leverage with units and period
3. **Deep Search flywheel** — split the original question into counter-evidence/risk, catalyst/growth, and knowledge-validation retrieval loops
4. **Cross-validation** — reconcile multi-source figures; explain conflicts
5. **Competing hypotheses** — main + alternative, each with source_id
6. **Risk register** — at least 3 verifiable risks (regulatory, concentration, valuation, cash flow)
7. **Conclusion** — separate facts vs judgments; attach citations + evidence_items
"""


def get_workflow_block(locale: Locale) -> str:
    return FINANCE_WORKFLOW_ZH if locale == Locale.ZH else FINANCE_WORKFLOW_EN
