from __future__ import annotations

import json
from typing import Any, Dict

from agent.trace import SourceRef, SourceType
from i18n.locale import Locale, normalize_locale
from tools.market_data import fetch_market_data, resolve_stock_code


def fetch_financial_report(company_name: str, locale: str = Locale.ZH.value) -> Dict[str, Any]:
    loc = normalize_locale(locale)
    stock_code = resolve_stock_code(company_name)
    if not stock_code:
        return {
            "error": (
                f"No A-share listing resolved for '{company_name}'. "
                "Live financial report requires a 6-digit A-share code "
                "(HK / US / unlisted companies are not covered by this tool)."
            ),
        }

    market = fetch_market_data(
        stock_code=stock_code,
        action="financials",
        company_name=company_name,
        locale=loc.value,
    )
    if market.get("error") or not market.get("financial_statements"):
        return {
            "error": market.get("error") or "East Money returned no financial statements.",
            "stock_code": stock_code,
        }

    statements = market.get("financial_statements") or []
    latest = statements[0]
    content = json.dumps(
        {
            "data_source": market.get("data_source"),
            "fetched_at": market.get("fetched_at"),
            "stock_code": stock_code,
            "latest_statement": latest,
            "statement_count": len(statements),
        },
        ensure_ascii=False,
        indent=2,
    )
    source = SourceRef(
        source_id=f"report:{stock_code}:financials",
        source_type=SourceType.FINANCIAL_REPORT,
        title=f"{latest.get('company_name') or company_name} financial statements",
        excerpt=content[:900],
        url=market.get("source_url") or "https://datacenter.eastmoney.com/",
    )
    return {
        "company": company_name,
        "stock_code": stock_code,
        "report_year": str(latest.get("report_date", ""))[:4],
        "data_source": market.get("data_source"),
        "fetched_at": market.get("fetched_at"),
        "content": content,
        "highlights": {
            "revenue": str(latest.get("total_revenue") or ""),
            "net_profit": str(latest.get("net_profit") or ""),
            "total_assets": "",
            "total_liabilities": "",
            "rd_expense": "",
            "report_date": latest.get("report_date"),
            "basic_eps": latest.get("basic_eps"),
        },
        "sources": [source.to_dict()],
    }


def search_news(company_name: str, query: str = "", locale: str = Locale.ZH.value) -> Dict[str, Any]:
    loc = normalize_locale(locale)
    stock_code = resolve_stock_code(company_name)
    if not stock_code:
        return {
            "error": (
                f"No A-share listing resolved for '{company_name}'. "
                "Live announcements require a 6-digit A-share code."
            ),
        }

    market = fetch_market_data(
        stock_code=stock_code,
        action="news",
        company_name=company_name,
        limit=10,
        locale=loc.value,
    )
    announcements = market.get("announcements") or []
    if market.get("error") or not announcements:
        return {
            "error": market.get("error") or "East Money returned no announcements.",
            "stock_code": stock_code,
        }

    localized_articles = [
        {
            "id": f"news:{stock_code}:{idx + 1}",
            "title": item.get("title") or "",
            "summary": " ".join(
                part
                for part in [
                    item.get("date") or "",
                    item.get("source") or "",
                    item.get("title") or "",
                ]
                if part
            ),
            "company": company_name,
            "sentiment": "neutral",
            "url": item.get("url"),
            "data_source": market.get("data_source"),
            "fetched_at": market.get("fetched_at"),
        }
        for idx, item in enumerate(announcements)
    ]
    sources = [
        SourceRef(
            source_id=item["id"],
            source_type=SourceType.NEWS,
            title=item["title"],
            excerpt=item["summary"][:280],
            url=item.get("url"),
        ).to_dict()
        for item in localized_articles
    ]
    return {
        "company": company_name,
        "query": query,
        "stock_code": stock_code,
        "data_source": market.get("data_source"),
        "fetched_at": market.get("fetched_at"),
        "articles": localized_articles,
        "sources": sources,
    }


def knowledge_query(query: str, locale: str = Locale.ZH.value) -> Dict[str, Any]:
    """Deprecated local knowledge base.

    The original implementation served chunks from a bundled demo sample.
    In Live-only mode the agent relies on real tool outputs + LLM general
    knowledge, so this tool now returns an explicit guidance message instead
    of synthesised local content.
    """
    del locale
    return {
        "query": query,
        "chunks": [],
        "sources": [],
        "note": (
            "knowledge_query is disabled in Live-only mode. "
            "Use fetch_financial_report / search_news / fetch_market_data instead, "
            "or rely on the model's general knowledge."
        ),
    }


TOOL_REGISTRY = {
    "fetch_financial_report": fetch_financial_report,
    "search_news": search_news,
    "knowledge_query": knowledge_query,
    "fetch_market_data": fetch_market_data,
}

TOOL_SCHEMAS = {
    "fetch_financial_report": {"required": {"company_name"}},
    "search_news": {"required": {"company_name"}},
    "knowledge_query": {"required": {"query"}},
    "fetch_market_data": {"required_any": ({"stock_code"}, {"company_name"})},
}


def run_tool(name: str, tool_input: Dict[str, Any], *, locale: str = Locale.ZH.value) -> Dict[str, Any]:
    if name not in TOOL_REGISTRY:
        return {"error": f"Unknown tool: {name}"}
    if not isinstance(tool_input, dict):
        return {"error": "Tool input must be an object"}
    schema = TOOL_SCHEMAS.get(name, {})
    required = schema.get("required", set())
    missing = [key for key in required if not str(tool_input.get(key, "")).strip()]
    required_any = schema.get("required_any")
    if required_any and not any(
        all(str(tool_input.get(key, "")).strip() for key in option)
        for option in required_any
    ):
        missing.append(" or ".join(sorted(required_any[0] | required_any[-1])))
    if missing:
        return {"error": f"Invalid tool input for {name}: missing {', '.join(missing)}"}
    fn = TOOL_REGISTRY[name]
    payload = dict(tool_input)
    payload.setdefault("locale", locale)
    result = fn(**payload)
    if isinstance(result, dict):
        result.setdefault(
            "data_status",
            {
                "tool": name,
                "hit": not bool(result.get("error")),
                "source_count": len(result.get("sources") or []),
                "data_source": result.get("data_source") or "local",
                "cache_hit": bool(result.get("cache_hit")),
                "fetched_at": result.get("fetched_at"),
            },
        )
    return result
