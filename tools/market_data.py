from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path
from typing import Any, Callable, Dict, List, Literal, Optional

import httpx

from agent.trace import SourceRef, SourceType

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
_TIMEOUT = httpx.Timeout(15.0, connect=10.0)
_HEADERS = {"User-Agent": "TraceMind-FinResearch/1.0"}
_BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
    ),
    "Referer": "https://www.eastmoney.com/",
}
_RETRY_COUNT = 2
_EM_SEARCH_TOKEN = "D43BF722C8E33BDC906FB84D85E326E8"

MarketAction = Literal["quote", "financials", "news"]


def _load_registry() -> Dict[str, Any]:
    """Optional manual overrides; not required for normal operation."""
    path = DATA_DIR / "company_registry.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _registry_lookup(company_name: str) -> Optional[str]:
    registry = _load_registry()
    name = company_name.strip().lower()
    for key, value in registry.items():
        candidates = [key.lower(), *[a.lower() for a in value.get("aliases", [])]]
        if any(c in name or name in c for c in candidates):
            code = value.get("stock_code")
            return str(code) if code else None
    return None


@lru_cache(maxsize=512)
def _eastmoney_search(query: str) -> List[Dict[str, Any]]:
    """Realtime company-name search via East Money suggest API.

    Returns the raw matches list (A-share, HK, US, LSE, etc.). Cached per
    query so repeated lookups in a single process are free.
    """
    query = (query or "").strip()
    if not query:
        return []
    url = "https://searchapi.eastmoney.com/api/suggest/get"
    params = {
        "input": query,
        "type": "14",
        "token": _EM_SEARCH_TOKEN,
        "count": "10",
    }
    try:
        with httpx.Client(timeout=_TIMEOUT, headers=_BROWSER_HEADERS, follow_redirects=True) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            payload = resp.json()
    except Exception:
        return []
    table = payload.get("QuotationCodeTable") or {}
    return list(table.get("Data") or [])


def resolve_stock_code(company_name: str) -> Optional[str]:
    """Resolve any company name (CN / EN) to a 6-digit A-share code.

    Strategy:
      1. Local registry overrides (kept for aliases and stable demo flows).
      2. East Money search API; pick the first A-share match.
      3. None when no A-share equivalent exists. Caller falls back to LLM
         general knowledge — see `_ensure_live_evidence`.
    """
    name = (company_name or "").strip()
    if not name:
        return None

    override = _registry_lookup(name)
    if override:
        return override

    for item in _eastmoney_search(name):
        if item.get("Classify") != "AStock":
            continue
        code = str(item.get("Code") or "").strip()
        if len(code) == 6 and code.isdigit():
            return code
    return None


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _with_retry(fn: Callable[[], Dict[str, Any]]) -> Dict[str, Any]:
    last_exc: Exception | None = None
    for attempt in range(_RETRY_COUNT + 1):
        try:
            return fn()
        except Exception as exc:  # noqa: BLE001
            last_exc = exc
            if attempt < _RETRY_COUNT:
                time.sleep(0.35 * (attempt + 1))
    if last_exc:
        raise last_exc
    return {"error": "request failed"}


def _eastmoney_financial_statements(stock_code: str, limit: int = 4) -> Dict[str, Any]:
    code_prefix = "SH" if stock_code.startswith("6") else "SZ"
    url = "https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/ZYZBAjaxNew"
    params = {"type": "0", "code": f"{code_prefix}{stock_code}"}
    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    records = (data.get("data") or [])[:limit]
    if not records:
        return {"error": f"No financial data found for {stock_code}"}

    return {
        "stock_code": stock_code,
        "data_source": "eastmoney",
        "report_count": len(records),
        "financial_statements": [
            {
                "report_date": r.get("REPORT_DATE", "")[:10],
                "company_name": r.get("SECURITY_NAME_ABBR", ""),
                "report_type": r.get("REPORT_TYPE"),
                "notice_date": str(r.get("NOTICE_DATE") or "")[:10],
                "total_revenue": r.get("TOTALOPERATEREVE"),
                "operating_revenue": r.get("TOTALOPERATEREVE"),
                "operating_cost": None,
                "operating_profit": None,
                "total_profit": None,
                "net_profit": r.get("PARENTNETPROFIT"),
                "basic_eps": r.get("EPSJB"),
                "roe": r.get("ROEJQ"),
                "total_liabilities": r.get("LIABILITY"),
            }
            for r in records
        ],
    }


def _eastmoney_stock_quote(stock_code: str) -> Dict[str, Any]:
    market = "1" if stock_code.startswith("6") else "0"
    url = "https://push2.eastmoney.com/api/qt/stock/get"
    params = {
        "secid": f"{market}.{stock_code}",
        "fields": "f43,f44,f45,f46,f47,f48,f50,f51,f52,f55,f57,f58,f60,f116,f117,f162,f167,f170",
        "ut": "fa5fd1943c7b386f172d6893dbbd1",
    }
    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    d = data.get("data", {})
    if not d:
        return {"error": f"No quote data for {stock_code}"}

    def _div100(v: Any) -> Optional[float]:
        if v is None or v == "-":
            return None
        return round(float(v) / 100, 2)

    return {
        "stock_code": d.get("f57", stock_code),
        "stock_name": d.get("f58", ""),
        "current_price": _div100(d.get("f43")),
        "open": _div100(d.get("f46")),
        "high": _div100(d.get("f44")),
        "low": _div100(d.get("f45")),
        "previous_close": _div100(d.get("f60")),
        "volume": d.get("f47"),
        "turnover": d.get("f48"),
        "pe_ratio": _div100(d.get("f162")),
        "pb_ratio": _div100(d.get("f167")),
        "market_cap": d.get("f116"),
        "change_percent": _div100(d.get("f170")),
        "data_source": "eastmoney",
    }


def _search_stock_news(stock_code: str, limit: int = 10) -> Dict[str, Any]:
    url = "https://np-anotice-stock.eastmoney.com/api/security/ann"
    params = {
        "sr": "-1",
        "page_size": str(min(limit, 20)),
        "page_index": "1",
        "ann_type": "A",
        "stock_list": stock_code,
        "f_node": "0",
        "s_node": "0",
    }
    with httpx.Client(timeout=_TIMEOUT, headers=_HEADERS, follow_redirects=True) as client:
        resp = client.get(url, params=params)
        resp.raise_for_status()
        data = resp.json()

    articles = data.get("data", {}).get("list", []) if isinstance(data.get("data"), dict) else []
    return {
        "stock_code": stock_code,
        "news_count": len(articles),
        "announcements": [
            {
                "title": a.get("title", ""),
                "date": a.get("notice_date", "")[:10],
                "source": a.get("columns", [{}])[0].get("column_name", "") if a.get("columns") else "",
                "url": (
                    f"https://data.eastmoney.com/notices/detail/{stock_code}/{a.get('art_code', '')}.html"
                    if a.get("art_code")
                    else ""
                ),
            }
            for a in articles[:limit]
        ],
        "data_source": "eastmoney",
    }


def fetch_market_data(
    stock_code: str = "",
    action: MarketAction = "quote",
    company_name: str = "",
    limit: int = 4,
    locale: str = "zh",
) -> Dict[str, Any]:
    del locale
    code = stock_code.strip() or (resolve_stock_code(company_name) or "")
    if not code:
        return {
            "error": "No stock_code provided and company not in registry.",
            "hint": "Pass stock_code (6 digits) or add company to data/company_registry.json",
        }
    if not code.isdigit() or len(code) != 6:
        return {"error": f"Invalid stock code '{stock_code}'. Must be 6 digits."}

    try:
        if action == "quote":
            result = _with_retry(lambda: _eastmoney_stock_quote(code))
        elif action == "financials":
            result = _with_retry(lambda: _eastmoney_financial_statements(code, limit=limit or 4))
        elif action == "news":
            result = _with_retry(lambda: _search_stock_news(code, limit=limit or 10))
        else:
            return {"error": f"Unknown action '{action}'. Use quote, financials, news."}

        if "error" in result:
            return result

        result["fetched_at"] = _now_iso()
        result["source_url"] = _source_url_for_action(code, action)
        sources = _sources_from_market_result(code, action, result)
        result["sources"] = [s.to_dict() for s in sources]
        return result
    except httpx.HTTPStatusError as exc:
        return {"error": f"API request failed: HTTP {exc.response.status_code}"}
    except Exception as exc:
        return {"error": f"Failed to fetch market data: {exc}"}


def _sources_from_market_result(
    stock_code: str,
    action: MarketAction,
    payload: Dict[str, Any],
) -> List[SourceRef]:
    sid = f"market:{stock_code}:{action}"
    if action == "quote":
        excerpt = (
            f"{payload.get('stock_name', '')} "
            f"price={payload.get('current_price')} "
            f"change={payload.get('change_percent')}% "
            f"PE={payload.get('pe_ratio')}"
        )
        title = f"A-share quote · {payload.get('stock_name', stock_code)}"
    elif action == "financials":
        stmts = payload.get("financial_statements") or []
        first = stmts[0] if stmts else {}
        excerpt = (
            f"report={first.get('report_date')} "
            f"revenue={first.get('total_revenue')} "
            f"net_profit={first.get('net_profit')}"
        )
        title = f"Income statement · {first.get('company_name', stock_code)}"
    else:
        anns = payload.get("announcements") or []
        first = anns[0] if anns else {}
        excerpt = f"{first.get('date', '')} {first.get('title', '')}"[:280]
        title = f"Announcements · {stock_code}"

    return [
        SourceRef(
            source_id=sid,
            source_type=SourceType.MARKET_DATA,
            title=title.strip(),
            excerpt=excerpt.strip(),
            url=_source_url_for_action(stock_code, action),
        )
    ]


def _source_url_for_action(stock_code: str, action: MarketAction) -> str:
    if action == "quote":
        return f"https://quote.eastmoney.com/{stock_code}.html"
    if action == "financials":
        return f"https://emweb.securities.eastmoney.com/PC_HSF10/FinanceAnalysis/Index?type=web&code={stock_code}"
    return f"https://data.eastmoney.com/notices/stock/{stock_code}.html"
