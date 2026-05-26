# Financial Research Agent / TraceMind

TraceMind is not a black-box report generator. It turns financial research into an auditable workflow: every reasoning step, tool call, cited claim, risk signal, and decision card can be traced back to explicit `source_id`s. Reviewers can inspect the evidence protocol, rule audit, faithfulness checks, competing hypotheses, and entity graph directly in the UI.

> **Languages:** [中文](README.zh.md) · [English](README.md)

---

## Overview

Built for the **Financial Research Agent · Investment Research** track:

- Multi-step reasoning (ReAct)
- Auditable tool calls at every step
- Conclusions bound to `source_id` — no black-box judgments
- Evidence protocol with dual-axis source ratings
- Competing hypotheses and rule-based audit
- Faithfulness verification for every cited claim
- Lightweight entity graph for company / customer / regulatory events

## Delivery Status

| Item | Status |
|---|---|
| Live mode | MiroMind OpenAI-compatible API integrated; enabled by `MIROMIND_API_KEY` |
| Demo mode | Works without an API key using local samples and deterministic reasoning |
| Real market data | East Money A-share quote / financials / announcements through `data/company_registry.json` |
| Cached samples | Five real-company prebuilt reports available from the sidebar |
| Evidence protocol | Results include `protocol.audit`, `protocol.faithfulness`, `protocol.competing_hypotheses`, and `protocol.entities` |
| Runtime reliability | SQLite result cache, IP rate limit, claim feedback persistence, CDN fallback, and lazy vendors are implemented |

## Competition Highlights

### Reasoning And Evidence

| Capability | Description |
|---|---|
| ReAct reasoning | Thought → tool → observation is visible in the UI |
| Evidence chain overview | One tab links question, answer, steps, claims, sources, audit, and faithfulness |
| Evidence protocol | Source reliability + information credibility for every evidence item |
| Competing hypotheses | Main vs alternative thesis, each tied to source IDs |
| Rule audit | Checks evidence sufficiency, counter-evidence, source IDs, and confidence |
| Faithfulness | Verifies cited claims against source excerpts |
| Follow-up research | Answers follow-up questions using the previous report and evidence context |
| Financial ratios | Computes net margin, R&D ratio, debt-to-asset ratio, and base metrics |
| Risk radar | Scores regulatory, concentration, commercialization, and margin risks |
| Investment decision | Produces positive / watch / cautious rating, confidence, and monitoring indicators |
| Peer benchmark | Compares against cloud infrastructure, AI chip, and infra software peers |

### Product Experience

| Capability | Description |
|---|---|
| 4+1 tab architecture | Insights / Evidence / Reasoning / Knowledge Graph + History with sticky sub-navigation |
| Five real-company samples | Kweichow Moutai, CATL, NVIDIA, BYD, and China Merchants Bank; no API key required |
| Company comparison | Pick two cached reports and compare trust, financials, risk, grounding, and monitoring indicators side by side |
| Mini visualizations | Financial highlights, risk distribution, and source composition at a glance |
| SSE streaming | Agent steps stream in real time and can be cancelled with `AbortController` |
| Actionable error cards | Offline / timeout / auth / rate-limit / server errors with retry and fallback actions |
| Knowledge graph | 3D force-directed entity graph; heavy engine is lazy-loaded |
| Shareable link | pako-compressed URL hash; recipient can view the report without backend state |
| PDF export | A4 report with QR back-links for sources and watermark |
| Claim feedback loop | Per-citation thumbs up/down persisted in SQLite |

### Engineering Reliability

| Capability | Description |
|---|---|
| Result cache | SQLite + sha256 key for identical `(company, question, locale, mode)` requests |
| IP rate limit | Token bucket, default 20 requests/min/IP, structured 429 + `Retry-After` |
| CDN fallback | Local vendor first, public CDN fallback |
| Lazy vendors | KG / pako / qrcode load only when first used |
| localStorage schema | Versioned single-key schema with migration from legacy keys |
| Keyboard shortcuts | Cmd/Ctrl+K focus, Cmd/Ctrl+Enter run, Esc close/cancel, `g h` history, `?` help |
| Mobile support | Sidebar drawer, scrim, and horizontally scrollable tabs |
| Accessibility | ARIA tabs, aria-live regions, focus-visible rings, and improved contrast |
| Auto fallback | Returns a clearly marked demo result when the Live API is unavailable |
| A-share data | East Money quote / financials / announcements through `fetch_market_data` |

## Quick Start

```bash
cd financial-research-agent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Open `http://localhost:8080`.

One-command demo without API dependency:

```bash
chmod +x scripts/demo.sh
DEMO_MODE=on ./scripts/demo.sh
```

## Modes

| Mode | Condition | Description |
|---|---|---|
| Demo | `DEMO_MODE=on` or no key | Local sample reports/news with rule-based reasoning |
| Live | `MIROMIND_API_KEY` set and `DEMO_MODE=off` or `auto` | MiroMind OpenAI-compatible API, usually 1–3 minutes |

Force demo: `DEMO_MODE=on`

## Data Authenticity

TraceMind supports **Live research**, **real East Money market-data tools**, and **local cached samples**. They serve different evaluation needs:

| Entry | Source | Real-time | Purpose |
|---|---|---|---|
| Live research | MiroMind API + registered tools | Yes | Official evaluation path |
| `fetch_market_data` | East Money public endpoints | Yes | A-share quote / financials / announcements |
| Sidebar company samples | Prebuilt `web/cached/*.json` | No | Zero-setup reviewer experience |
| Default demo company | Local sample report / news / knowledge base | No | Offline fallback and product walkthrough |

> Cached samples use real-company names and public-record style financial figures, but the generated report body and some news framing are designed for product demonstration. They should not be treated as real-time investment advice. Use Live mode for the real API path.

## Environment Variables

```bash
MIROMIND_API_KEY=sk-...
MIROMIND_BASE_URL=https://api.miromind.ai/v1
MIROMIND_MODEL=mirothinker-1-7-deepresearch
DEMO_MODE=auto   # auto | on | off
```

Optional runtime controls:

```bash
TRACEMIND_RATE_LIMIT_PER_MIN=20
TRACEMIND_CACHE_TTL_SEC=86400
TRACEMIND_CACHE_MAX_ROWS=500
```

## Recommended Demo Path

1. Open the app and confirm the mode badge: `Live` or `Demo`.
2. Click a cached sample such as Kweichow Moutai or NVIDIA to show a complete report instantly.
3. Review the Insights tab: trust score, decision card, and mini visualizations.
4. Open Evidence and click per-claim ▲ / ▼ to demonstrate claim-level feedback.
5. Open Reasoning and expand the ReAct steps: thought → tool → observation.
6. Open Knowledge Graph to show entity / risk / source relationships.
7. Open Company Comparison and compare two cached companies side by side.
8. Click a follow-up prompt to show incremental multi-turn research.
9. Export a PDF or shareable link as the final deliverable.

## API

### Research

```bash
python main.py
curl -X POST http://localhost:8080/api/research \
  -H 'Content-Type: application/json' \
  -d '{"company":"Demo Technology Co., Ltd.","question":"What are the key risks?","locale":"en"}'
```

The response includes `protocol.audit`, `protocol.faithfulness`, `protocol.competing_hypotheses`, and `protocol.entities`. Identical requests can be served from `data/result_cache.sqlite` with `cache_hit: true`.

### Streaming Research

```bash
curl -N -X POST http://localhost:8080/api/research/stream \
  -H 'Content-Type: application/json' \
  -d '{"company":"Kweichow Moutai","question":"How are fundamentals and risks?","locale":"en"}'
```

The stream emits `started`, `step`, `final`, `warning`, and `error` events.

### Follow-up

```bash
curl -X POST http://localhost:8080/api/research/followup \
  -H 'Content-Type: application/json' \
  -d '{"followup_question":"How large is the channel-inventory risk?","base_result":<previous ResearchResult>,"locale":"en"}'
```

### Claim Feedback

```bash
curl -X POST http://localhost:8080/api/feedback/claim \
  -H 'Content-Type: application/json' \
  -d '{"company":"Kweichow Moutai","question":"...","locale":"en","mode":"demo","claim":"Revenue was RMB 147.7bn","verdict":"up"}'

curl 'http://localhost:8080/api/feedback/claim?company=Kweichow%20Moutai&question=...&locale=en&mode=demo'
```

### Health

```bash
curl http://localhost:8080/api/health
# { status, rate_limit, cache, feedback }
```

## Project Structure

```
financial-research-agent/
├── api.py                 # FastAPI endpoint + cache / rate limit / feedback
├── main.py                # Web entrypoint
├── agent/
│   ├── react_agent.py     # ReAct orchestration + follow-up
│   ├── protocol.py        # Evidence protocol
│   ├── auditor.py         # Rule-based audit
│   ├── faithfulness.py    # Claim grounding verification
│   └── workflow.py        # Financial research workflow
├── tools/
│   ├── __init__.py        # Report / news / knowledge tools
│   └── market_data.py     # East Money A-share data
├── runtime/
│   ├── cache.py           # SQLite result cache
│   ├── ratelimit.py       # Token-bucket IP rate limit
│   └── feedback.py        # Claim thumbs up/down persistence
├── web/                   # TraceMind Web UI
│   ├── cached/            # Five prebuilt real-company reports
│   └── vendor/            # Local vendor fallbacks
├── data/                  # Samples + company registry + runtime sqlite
└── scripts/
    ├── demo.sh            # Reviewer demo script
    └── build_cached_results.py
```

## Submission Notes

- Safe to publish this repo standalone
- Reviewers care about visible reasoning traces + citation-backed conclusions
- Add MiroMind API key in `.env` for live mode
- Recommended demo path: run Demo Technology first, then try a registry company such as Kweichow Moutai for market data

## Reviewer Checklist

- [x] Conclusions are traceable to sources, not free-form claims.
- [x] ReAct steps are visible: thought, tool input, observation, and sources.
- [x] Evidence has dual-axis ratings and rule audit.
- [x] Faithfulness checks every cited claim against excerpts.
- [x] The UI supports live streaming, cancellation, follow-up questions, comparison, sharing, and PDF export.
- [x] Runtime reliability includes caching, rate limiting, feedback persistence, lazy vendors, and CDN fallback.

## Sample Questions

- "What are Demo Technology's recent fundamentals and key risk factors?"
- "Is R&D spending sustainable? Any regulatory risks?"
