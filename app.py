from __future__ import annotations

import asyncio
import json

import streamlit as st

from agent.react_agent import ResearchAgent
from agent.trace import ResearchResult
from config import get_settings
from i18n.locale import Locale, normalize_locale, t
from ui.components import (
    render_citations,
    render_conclusion,
    render_empty_state,
    render_metrics,
    render_sidebar_note,
    render_source_cards,
    render_steps,
    render_topbar,
)
from ui.styles import inject_styles

st.set_page_config(
    page_title="Financial Research Agent",
    page_icon="◆",
    layout="wide",
    initial_sidebar_state="expanded",
)

inject_styles()

# ── Session state ─────────────────────────────────────────────────────────────
if "locale" not in st.session_state:
    st.session_state.locale = Locale.ZH.value
if "last_result" not in st.session_state:
    st.session_state.last_result = None

# ── Sidebar ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### Language")
    st.session_state.locale = st.radio(
        "locale",
        options=[Locale.ZH.value, Locale.EN.value],
        format_func=lambda v: "中文" if v == Locale.ZH.value else "English",
        index=0 if st.session_state.locale == Locale.ZH.value else 1,
        horizontal=True,
        label_visibility="collapsed",
    )

locale = normalize_locale(st.session_state.locale)
settings = get_settings()

with st.sidebar:
    st.markdown(f"### {t('app.sidebar.params', locale)}")
    company = st.text_input(
        t("app.sidebar.company", locale),
        value=t("defaults.company", locale),
        key="company_input",
    )
    question = st.text_area(
        t("app.sidebar.question", locale),
        value=t("defaults.question", locale),
        height=110,
        key="question_input",
    )

    col_run, col_clear = st.columns([3, 1])
    with col_run:
        run_btn = st.button(
            t("app.sidebar.run", locale),
            type="primary",
            use_container_width=True,
        )
    with col_clear:
        clear_btn = st.button(
            "✕",
            use_container_width=True,
            help=t("app.sidebar.clear", locale),
        )

    st.divider()
    render_sidebar_note(locale)

# ── Clear ─────────────────────────────────────────────────────────────────────
if clear_btn:
    st.session_state.last_result = None
    st.rerun()

# ── Top bar (brand + status) ──────────────────────────────────────────────────
render_topbar(locale, demo_mode=settings.use_demo_mode)

result: ResearchResult | None = st.session_state.last_result

# ── Run ───────────────────────────────────────────────────────────────────────
if run_btn:
    agent = ResearchAgent()
    with st.spinner(t("app.spinner", locale)):
        result = asyncio.run(agent.run(company, question, locale=locale))
        st.session_state.last_result = result

# ── Metrics ───────────────────────────────────────────────────────────────────
render_metrics(locale, result)

# ── Body ──────────────────────────────────────────────────────────────────────
if result:
    # Action row: download + (future) more actions
    col_spacer, col_dl = st.columns([5, 1.2])
    with col_dl:
        json_bytes = json.dumps(result.to_dict(), ensure_ascii=False, indent=2).encode("utf-8")
        st.download_button(
            label=f"↓ {t('app.download.label', locale)}",
            data=json_bytes,
            file_name=t("app.download.filename", locale),
            mime="application/json",
            use_container_width=True,
        )

    # Tabs
    tab_labels = [
        t("app.tab.conclusion", locale),
        t("app.tab.citations", locale),
        t("app.tab.trace", locale),
        t("app.tab.sources", locale),
    ]
    tab_conc, tab_cite, tab_trace, tab_src = st.tabs(tab_labels)

    with tab_conc:
        render_conclusion(locale, result.conclusion)
        with st.expander(t("app.raw_json", locale), expanded=False):
            st.json(result.to_dict())

    with tab_cite:
        render_citations(locale, result.citations)

    with tab_trace:
        render_steps(locale, result.steps)

    with tab_src:
        render_source_cards(locale, result)

else:
    render_empty_state(locale)
