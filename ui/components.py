from __future__ import annotations

import html
import json

import streamlit as st

from agent.trace import AgentStep, CitedClaim, ResearchResult, SourceType
from i18n.locale import Locale, t

# ── Source / sentiment maps ───────────────────────────────────────────────────

_SOURCE_ICONS = {
    SourceType.FINANCIAL_REPORT: "📄",
    SourceType.NEWS: "📰",
    SourceType.KNOWLEDGE: "📚",
}

_SENTIMENT_GLYPHS = {
    "positive": "↑",
    "negative": "↓",
    "neutral":  "·",
}


def _source_type_label(stype: SourceType, locale: Locale) -> str:
    return t(
        {
            SourceType.FINANCIAL_REPORT: "app.source_type.financial_report",
            SourceType.NEWS: "app.source_type.news",
            SourceType.KNOWLEDGE: "app.source_type.knowledge",
        }[stype],
        locale,
    )


def _sentiment_label(sentiment: str, locale: Locale) -> str:
    key_map = {
        "positive": "app.sentiment.positive",
        "negative": "app.sentiment.negative",
        "neutral":  "app.sentiment.neutral",
    }
    return t(key_map.get(sentiment, "app.sentiment.neutral"), locale)


# ── Top bar (replaces hero) ───────────────────────────────────────────────────

def render_topbar(locale: Locale) -> None:
    mode_class = "live"
    mode_label = t("app.mode.live", locale)
    st.markdown(
        f"""
        <div class="fra-topbar">
          <div class="fra-brand">
            <div class="fra-brand-mark">F</div>
            <div class="fra-brand-text">
              <div class="fra-brand-name">Financial Research Agent</div>
              <div class="fra-brand-tag">{html.escape(t("app.caption", locale))}</div>
            </div>
          </div>
          <div class="fra-status">
            <span class="fra-status-pill {mode_class}">
              <span class="dot"></span>{html.escape(mode_label)}
            </span>
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_page_title(locale: Locale) -> None:
    st.markdown(
        f"""
        <div class="fra-page-title">
          <h1>{html.escape(t("app.title", locale))}</h1>
          <p>{html.escape(t("app.caption", locale))}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ── Metrics ───────────────────────────────────────────────────────────────────

def render_metrics(locale: Locale, result: ResearchResult | None) -> None:
    steps = len(result.steps) if result else 0
    citations = len(result.citations) if result else 0
    sources = len(result.all_sources) if result else 0

    def _card(icon: str, label: str, value: int) -> str:
        cls = "has-data" if value > 0 else ""
        return f"""
        <div class="fra-metric {cls}">
          <div class="fra-metric-icon">{icon}</div>
          <div class="fra-metric-content">
            <div class="fra-metric-label">{html.escape(label)}</div>
            <div class="fra-metric-value">{value}</div>
          </div>
        </div>"""

    st.markdown(
        f"""
        <div class="fra-metrics">
          {_card("◇", t("app.metric.steps", locale), steps)}
          {_card("◈", t("app.metric.citations", locale), citations)}
          {_card("◉", t("app.metric.sources", locale), sources)}
        </div>
        """,
        unsafe_allow_html=True,
    )


# ── Empty state ───────────────────────────────────────────────────────────────

def render_empty_state(locale: Locale) -> None:
    st.markdown(
        f"""
        <div class="fra-empty">
          <div class="fra-empty-icon">⚡</div>
          <div class="fra-empty-title">{html.escape(t("app.empty.title", locale))}</div>
          <div class="fra-empty-body">{html.escape(t("app.empty.body", locale))}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ── Conclusion ────────────────────────────────────────────────────────────────

def render_conclusion(locale: Locale, text_value: str) -> None:
    label = t("app.tab.conclusion", locale)
    st.markdown(
        f"""
        <div class="fra-conclusion">
          <div class="fra-conclusion-label">◆ {html.escape(label)}</div>
          <div class="fra-conclusion-text">{html.escape(text_value)}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ── Citations ─────────────────────────────────────────────────────────────────

def render_citations(locale: Locale, citations: list[CitedClaim]) -> None:
    if not citations:
        return
    cards = ""
    for idx, cite in enumerate(citations, start=1):
        tags = "".join(
            f'<span class="fra-source-tag">{html.escape(sid)}</span>'
            for sid in cite.source_ids
        )
        cards += f"""
        <div class="fra-cite">
          <div class="fra-cite-claim">
            <span class="fra-cite-num">{idx}</span>
            <span class="fra-cite-text">{html.escape(cite.claim)}</span>
          </div>
          <div class="fra-source-tags">{tags}</div>
        </div>"""
    st.markdown(cards, unsafe_allow_html=True)


# ── Steps ─────────────────────────────────────────────────────────────────────

def _render_step_inline(step: AgentStep, locale: Locale) -> None:
    action_input_json = html.escape(json.dumps(step.action_input, ensure_ascii=False, indent=2))
    observation = html.escape(step.observation[:1800])

    sources_html = ""
    if step.sources:
        items = ""
        for src in step.sources:
            icon = _SOURCE_ICONS.get(src.source_type, "📄")
            items += f"""
            <div class="fra-inline-src">
              <div class="fra-inline-src-icon">{icon}</div>
              <div class="fra-inline-src-body">
                <div class="fra-inline-src-title">{html.escape(src.title)}</div>
                <div class="fra-inline-src-id">{html.escape(src.source_id)}</div>
                <div class="fra-inline-src-excerpt">{html.escape(src.excerpt[:220])}</div>
              </div>
            </div>"""
        sources_html = f"""
        <div class="fra-sub-block">
          <div class="fra-sub-label">◦ {html.escape(t("app.step.sources", locale))}</div>
          {items}
        </div>"""

    st.markdown(
        f"""
        <div class="fra-step-thought">
          <strong>{html.escape(t("app.step.thought", locale))}</strong>{html.escape(step.thought)}
        </div>
        <div class="fra-sub-block">
          <div class="fra-sub-label">◦ {html.escape(t("app.step.tool_input", locale))}</div>
          <pre><code>{action_input_json}</code></pre>
        </div>
        <div class="fra-sub-block">
          <div class="fra-sub-label">◦ {html.escape(t("app.step.observation", locale))}</div>
          <pre><code>{observation}</code></pre>
        </div>
        {sources_html}
        """,
        unsafe_allow_html=True,
    )


def render_steps(locale: Locale, steps: list[AgentStep]) -> None:
    if not steps:
        return
    for step in steps:
        label = f"Step {step.step_number}    {step.action}"
        with st.expander(label, expanded=(step.step_number <= 2)):
            _render_step_inline(step, locale)


# ── Source cards ──────────────────────────────────────────────────────────────

def _sentiment_for(source_id: str, result: ResearchResult) -> str | None:
    for step in result.steps:
        if step.action != "search_news":
            continue
        try:
            data = json.loads(step.observation)
        except (json.JSONDecodeError, ValueError):
            continue
        if not isinstance(data, list):
            continue
        for item in data:
            if isinstance(item, dict) and item.get("id") == source_id:
                return item.get("sentiment")
    return None


def render_source_cards(locale: Locale, result: ResearchResult) -> None:
    if not result.all_sources:
        return

    cards = ""
    for src in result.all_sources:
        icon = _SOURCE_ICONS.get(src.source_type, "📄")
        stype_label = _source_type_label(src.source_type, locale)
        stype_cls = src.source_type.value

        sentiment_html = ""
        if src.source_type == SourceType.NEWS:
            sentiment = _sentiment_for(src.source_id, result)
            if sentiment:
                glyph = _SENTIMENT_GLYPHS.get(sentiment, "·")
                label = _sentiment_label(sentiment, locale)
                sentiment_html = (
                    f'<span class="fra-src-sentiment {sentiment}">'
                    f'{glyph} {html.escape(label)}</span>'
                )

        url_html = ""
        if src.url:
            short = src.url[:55] + ("…" if len(src.url) > 55 else "")
            url_html = (
                f'<div class="fra-src-url">'
                f'<a href="{html.escape(src.url)}" target="_blank">↗ {html.escape(short)}</a>'
                f"</div>"
            )

        cards += f"""
        <div class="fra-src-card">
          <div class="fra-src-hdr">
            <span class="fra-src-type {stype_cls}">{icon} {html.escape(stype_label)}</span>
            {sentiment_html}
            <span class="fra-src-id">{html.escape(src.source_id)}</span>
          </div>
          <div class="fra-src-title">{html.escape(src.title)}</div>
          <div class="fra-src-excerpt">{html.escape(src.excerpt[:240])}</div>
          {url_html}
        </div>"""

    st.markdown(f'<div class="fra-src-grid">{cards}</div>', unsafe_allow_html=True)


# ── Sidebar note ──────────────────────────────────────────────────────────────

def render_sidebar_note(locale: Locale) -> None:
    bullets = t("app.sidebar.trace_body", locale).split("\n")
    items = "".join(
        f"<li>{html.escape(line.lstrip('- '))}</li>"
        for line in bullets if line.strip()
    )
    st.markdown(
        f"""
        <div class="fra-sidebar-note">
          <strong>{html.escape(t("app.sidebar.trace_title", locale))}</strong>
          <ul>{items}</ul>
        </div>
        """,
        unsafe_allow_html=True,
    )
