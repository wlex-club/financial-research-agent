from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

from agent.trace import SourceRef, SourceType
from i18n.locale import Locale, normalize_locale, t
from tools.market_data import fetch_market_data, resolve_stock_code

DATA_DIR = Path(__file__).resolve().parents[1] / "data"


def _locale_value(item: Dict[str, Any], field: str, locale: Locale) -> str:
    if locale == Locale.EN:
        return str(item.get(f"{field}_en") or item.get(field, ""))
    return str(item.get(field, ""))


def _load_news() -> List[Dict[str, Any]]:
    path = DATA_DIR / "news" / "demo_tech_news.json"
    return json.loads(path.read_text(encoding="utf-8"))


def _load_report_text(company_key: str, locale: Locale) -> str:
    zh_keys = ("演示科技", "demo tech")
    use_en = locale == Locale.EN or "demo technology" in company_key.lower()
    filename = "demo_tech_2023_en.txt" if use_en else "demo_tech_2023.txt"
    for key in zh_keys:
        if key in company_key.lower():
            filename = "demo_tech_2023.txt" if locale == Locale.ZH else "demo_tech_2023_en.txt"
            break
    return (DATA_DIR / "sample_reports" / filename).read_text(encoding="utf-8")


def fetch_financial_report(company_name: str, locale: str = Locale.ZH.value) -> Dict[str, Any]:
    loc = normalize_locale(locale)
    stock_code = resolve_stock_code(company_name)
    if stock_code:
        market = fetch_market_data(
            stock_code=stock_code,
            action="financials",
            company_name=company_name,
            locale=loc.value,
        )
        if not market.get("error") and market.get("financial_statements"):
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

    text = _load_report_text(company_name, loc)
    source = SourceRef(
        source_id="report:demo-tech-2023",
        source_type=SourceType.FINANCIAL_REPORT,
        title=t("tools.report.title", loc),
        excerpt=text[:900],
    )
    return {
        "company": company_name,
        "report_year": 2023,
        "content": text,
        "highlights": {
            "revenue": "10,234,567,890",
            "net_profit": "1,650,000,000",
            "total_assets": "14,000,000,000",
            "total_liabilities": "6,000,000,000",
            "rd_expense": "800,200,300",
        },
        "sources": [source.to_dict()],
    }


def search_news(company_name: str, query: str = "", locale: str = Locale.ZH.value) -> Dict[str, Any]:
    loc = normalize_locale(locale)
    stock_code = resolve_stock_code(company_name)
    if stock_code:
        market = fetch_market_data(
            stock_code=stock_code,
            action="news",
            company_name=company_name,
            limit=10,
            locale=loc.value,
        )
        announcements = market.get("announcements") or []
        if not market.get("error") and announcements:
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

    articles = _load_news()
    query_lower = query.lower()
    filtered = [
        item
        for item in articles
        if company_name in item.get("company", "")
        or company_name in item.get("company_en", "")
        or not query
        or query_lower in item.get("title", "").lower()
        or query_lower in item.get("title_en", "").lower()
        or query_lower in item.get("summary", "").lower()
        or query_lower in item.get("summary_en", "").lower()
    ]
    localized_articles = [
        {
            **item,
            "title": _locale_value(item, "title", loc),
            "summary": _locale_value(item, "summary", loc),
            "company": _locale_value(item, "company", loc),
        }
        for item in filtered
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
        "articles": localized_articles,
        "sources": sources,
    }


def knowledge_query(query: str, locale: str = Locale.ZH.value) -> Dict[str, Any]:
    loc = normalize_locale(locale)
    report_text = _load_report_text("演示科技", loc)
    news_items = _load_news()
    corpus: List[Dict[str, Any]] = [
        {
            "chunk_id": "kb:report:revenue",
            "text": t("tools.kb.revenue.text", loc),
            "source_id": "report:demo-tech-2023",
            "title": t("tools.kb.revenue.title", loc),
        },
        {
            "chunk_id": "kb:report:profit",
            "text": t("tools.kb.profit.text", loc),
            "source_id": "report:demo-tech-2023",
            "title": t("tools.kb.profit.title", loc),
        },
        {
            "chunk_id": "kb:report:rd",
            "text": t("tools.kb.rd.text", loc),
            "source_id": "report:demo-tech-2023",
            "title": t("tools.kb.rd.title", loc),
        },
    ]
    for item in news_items:
        corpus.append(
            {
                "chunk_id": f"kb:{item['id']}",
                "text": _locale_value(item, "summary", loc),
                "source_id": item["id"],
                "title": _locale_value(item, "title", loc),
            }
        )

    query_lower = query.lower()
    hits = [
        chunk
        for chunk in corpus
        if query_lower in chunk["text"].lower()
        or query_lower in chunk["title"].lower()
        or any(token in chunk["text"] for token in query.split() if len(token) > 1)
    ]
    if not hits:
        hits = corpus[:2]

    sources = [
        SourceRef(
            source_id=chunk["source_id"],
            source_type=SourceType.KNOWLEDGE,
            title=chunk["title"],
            excerpt=chunk["text"],
        ).to_dict()
        for chunk in hits
    ]
    return {
        "query": query,
        "chunks": hits,
        "sources": sources,
        "note": t("tools.kb.note", loc, count=len(news_items)),
        "report_preview_chars": len(report_text),
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
