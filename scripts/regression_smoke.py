"""One-shot regression smoke test for the recent agent/parser/UI changes.

Not a pytest suite (kept self-contained so a human can `python` it and read
the pass/fail lines). Covers:
  1. parse_tool_call (relaxed schema + balanced braces)
  2. MiroMindClient surface (chat exists, acomplete does NOT)
  3. _safe_fallback_payload (no JSON leak through conclusion)
  4. _conclusion_is_meta_leak detector
  5. _iter_/_run_deep_search_flywheel parity
  6. i18n keys completeness for both locales
"""
from __future__ import annotations

import asyncio
import os
import sys
from typing import Callable, List, Tuple

# Allow running this script from anywhere — make the project root importable.
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

results: List[Tuple[str, bool, str]] = []


def case(label: str, ok: bool, detail: str = "") -> None:
    results.append((label, ok, detail))


def expect_eq(label: str, got, want) -> None:
    case(label, got == want, f"got={got!r} want={want!r}")


def expect_true(label: str, cond: bool, detail: str = "") -> None:
    case(label, bool(cond), detail)


def expect_raises(label: str, fn: Callable[[], None], exc_type) -> None:
    try:
        fn()
        case(label, False, f"expected {exc_type.__name__}, got no exception")
    except exc_type as exc:
        case(label, True, f"raised {type(exc).__name__}: {exc}")
    except Exception as exc:  # noqa: BLE001
        case(label, False, f"raised {type(exc).__name__}: {exc}")


# ── 1. parse_tool_call ───────────────────────────────────────────────────────
from llm.miromind_client import parse_tool_call, MiroMindClient

parse_cases = [
    ('{"valid": true}', None, "off-schema unrelated JSON"),
    ('{"action": "search_news", "action_input": {"q": "x"}}', {"action": "search_news", "action_input": {"q": "x"}}, "ReAct tool call"),
    ('{"finished": true, "conclusion": "foo", "citations": []}', {"finished": True, "conclusion": "foo", "citations": []}, "finished (no action)"),
    ('plain prose, no JSON at all', None, "pure prose"),
    ('text before {"action": "x"} text after', {"action": "x"}, "json embedded in prose"),
    ('```json\n{"action": "y"}\n```', {"action": "y"}, "fenced json"),
    ('{"action": "x", "action_input": {"k": "value with } brace"}}', {"action": "x", "action_input": {"k": "value with } brace"}}, "nested brace inside string"),
    ('{"random": "stuff", "other": 1}', None, "random JSON without schema keys"),
    ('{"thought": "I will think"}', {"thought": "I will think"}, "lone thought field accepted"),
]
for raw, expected, label in parse_cases:
    expect_eq(f"parse_tool_call · {label}", parse_tool_call(raw), expected)

# ── 2. MiroMindClient surface ────────────────────────────────────────────────
client = MiroMindClient()
expect_true("MiroMindClient.chat exists", hasattr(client, "chat"))
expect_true("MiroMindClient has no acomplete", not hasattr(client, "acomplete"))

import inspect
import agent.react_agent as ra
src = inspect.getsource(ra)
expect_true("react_agent.py contains no 'acomplete' reference", "acomplete" not in src)
expect_eq("react_agent.py self.client.chat( count", src.count("self.client.chat("), 4)

# ── 3. _safe_fallback_payload ────────────────────────────────────────────────
from agent.react_agent import ResearchAgent
from i18n.locale import Locale, t

agent = ResearchAgent()
p_json = agent._safe_fallback_payload('{"valid": true}', Locale.ZH)
expect_true("fallback hides raw JSON from conclusion", "valid" not in p_json["conclusion"])
expect_true("fallback finished=True", p_json["finished"] is True)

p_prose = agent._safe_fallback_payload("plain narrative answer", Locale.ZH)
expect_true("fallback passes prose through", "plain narrative answer" in p_prose["conclusion"])

p_arr = agent._safe_fallback_payload("[1,2,3]", Locale.EN)
expect_true("fallback hides raw JSON array (en)", "[" not in p_arr["conclusion"][:3])

# ── 4. _conclusion_is_meta_leak ──────────────────────────────────────────────
leak_cases = [
    ("已根据你给定的 ReAct schema 完成最终总结：1. 输出必须是且仅是一个 JSON 对象。2. JSON 必须以 { 开头、以 } 结尾。3. 顶层字段只能有两种方案之一：方案 A: action / action_input；方案 B: finished, conclusion, citations。", True, "screenshot bug (zh)"),
    ("贵州茅台 2024 年营收同比增长 18%，毛利率维持在 92% 高位。监管和反腐风险[news:600519:1]构成主要不确定性，但渠道库存健康[r:600519:financials]，估值合理。", False, "normal zh conclusion"),
    ("Kweichow Moutai posted 18% YoY revenue growth with stable 92% gross margin. Regulatory headwinds [news:600519:1] are the key risk while channel inventory remains healthy [r:600519:financials].", False, "normal en conclusion"),
    ("I will respond with a JSON object following the ReAct schema. The action field will indicate the next step.", True, "english meta-leak"),
    ("公司基本面稳健，但需关注监管政策。", False, "short normal"),
    ("营收增长。", False, "ultra-short"),
]
for text, expected, label in leak_cases:
    got = ResearchAgent._conclusion_is_meta_leak(text)
    case(f"meta-leak · {label}", got == expected, f"got={got} want={expected}")

# ── 5. _iter_ / _run_ flywheel parity (also exercises east-money) ────────────
try:
    src_eager = {}
    eager = agent._run_deep_search_flywheel("贵州茅台", "估值", Locale.ZH, src_eager, start_step=1)
    src_iter = {}
    it = list(agent._iter_deep_search_flywheel("贵州茅台", "估值", Locale.ZH, src_iter, start_step=1))
    expect_eq("flywheel eager step count", len(eager), 3)
    expect_eq("flywheel iter loop count", len(it), 3)
    expect_eq("flywheel loop names", [name for name, _ in it], ["risk", "catalyst", "kb"])
    expect_eq("flywheel eager step numbers", [s.step_number for s in eager], [1, 2, 3])
except Exception as exc:  # noqa: BLE001
    case("flywheel run (network may have failed)", False, f"{type(exc).__name__}: {exc}")

# ── 6. i18n completeness ─────────────────────────────────────────────────────
required_keys = [
    "agent.live.json_retry",
    "agent.live.json_retry_strict",
    "agent.live.invalid_schema",
    "agent.live.salvage_prompt",
    "agent.live.phase.bootstrap",
    "agent.live.phase.flywheel_start",
    "agent.live.deep_search.risk",
    "agent.live.deep_search.catalyst",
    "agent.live.deep_search.kb",
    "agent.live.max_steps",
]
for k in required_keys:
    zh = t(k, Locale.ZH)
    en = t(k, Locale.EN)
    case(f"i18n[{k}] zh present", bool(zh) and "{" not in zh[:1], f"zh={zh[:30]!r}")
    case(f"i18n[{k}] en present", bool(en) and "{" not in en[:1], f"en={en[:30]!r}")

# Verify strict prompt is short (the previous bug)
strict = t("agent.live.json_retry_strict", Locale.ZH)
expect_true(
    f"strict retry prompt is concise (<60 chars), now {len(strict)}",
    len(strict) < 60,
    detail=strict,
)

# ── _resolve_unparseable_payload paths ───────────────────────────────────────
async def check_resolve():
    no_evidence = await agent._resolve_unparseable_payload(
        '{"valid": true}', "X", "Y", [], Locale.ZH
    )
    case(
        "_resolve · no-evidence does NOT leak raw JSON",
        "valid" not in no_evidence["conclusion"],
        detail=no_evidence["conclusion"][:60],
    )
    case(
        "_resolve · no-evidence finished=True",
        no_evidence["finished"] is True,
    )


asyncio.run(check_resolve())

# ── Report ───────────────────────────────────────────────────────────────────
passed = sum(1 for _, ok, _ in results if ok)
failed = sum(1 for _, ok, _ in results if not ok)
for label, ok, detail in results:
    mark = "✓" if ok else "✗"
    line = f"  {mark} {label}"
    if not ok and detail:
        line += f"  ── {detail}"
    print(line)
print()
print(f"  PASS {passed}/{len(results)}    FAIL {failed}")
sys.exit(0 if failed == 0 else 1)
