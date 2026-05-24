# Financial Research Agent / TraceMind · 研迹

> **Languages:** [中文](README.zh.md) · [English](README.md)

---

## 中文

**TraceMind · 研迹** — MiroMind 竞赛「Financial Research Agent · 投研决策」独立参赛 Demo。

TraceMind 的目标不是生成一段“看起来像研报”的黑箱答案，而是把金融研究拆成可审计的链路：每一步推理、每次工具调用、每条结论引用、每个风险判断都能回到明确的 `source_id`。评审可以直接查看证据、审计规则、忠实度检查、竞争假设和实体关系图。

### 当前交付状态

| 项目 | 状态 |
|------|------|
| Live 模式 | 唯一运行模式，已接入 MiroMind OpenAI-compatible API（必须配置 `MIROMIND_API_KEY`） |
| 真实行情 | 已接东财 A 股行情 / 财报 / 公告接口，通过 `data/company_registry.json` 映射公司代码 |
| 可审计协议 | `protocol.audit`、`protocol.faithfulness`、`protocol.competing_hypotheses`、`protocol.entities` 已随结果返回 |
| 运行时可靠性 | SQLite 结果缓存、IP 限流、claim 反馈持久化、CDN fallback、首屏懒加载均已完成 |

### 竞赛亮点

**推理与证据链**

| 能力 | 说明 |
|------|------|
| 多步 ReAct 推理 | 思考 → 工具 → 观察，全链路可见 |
| 证据协议 | 双轴评级（来源可靠性 / 信息可信度） |
| 竞争假设 | 主假设 + 备择假设，拒绝单一路径黑箱 |
| 规则审计 | 自动检查证据完整性、反证、置信度 |
| 忠实度验证 | 每条 citation 与 source 摘录交叉校验 |
| 多轮追问 | 基于已有报告增量回答后续问题，复用前序证据 |
| 财务比率 | 自动计算净利率、研发费用率、资产负债率等 |
| 风险雷达 | 监管披露、客户集中度、量产良率、利润率压力 |
| 投研决策卡 | 输出积极 / 观察 / 谨慎评级、置信度与跟踪指标 |
| 同行对比 | 与云基础设施、AI 芯片、软件基础设施样本横向比较 |

**用户体验（首屏 → 决策）**

| 能力 | 说明 |
|------|------|
| 4+1 Tab 信息架构 | 结论决策 / 证据全景 / 推理过程 / 知识图谱 + 历史记录，每个主 tab 内置粘性子导航 |
| 5 家真实公司样例 | 茅台 / 宁德 / 英伟达 / 比亚迪 / 招行——零 API Key 即可全功能体验 |
| 公司并列对比 | 选两家样例，关键指标 / 多空逻辑 / 跟踪指标左右并排 + 差异箭头 |
| 数据可视化 | 财务亮点 / 风险分布 / 来源构成 三张 mini-chart 立即可见 |
| SSE 实时流 | 推理步骤逐条流式渲染 + 可随时取消 |
| 错误体验卡片 | 离线 / 限流 / 超时 / 鉴权 等结构化错误 + Live 重试行动按钮 |
| 知识图谱 | 3D force-directed 实体关系图 · 按需懒加载 1.3MB 引擎 |
| 一键分享 | URL hash 内嵌完整报告（pako 压缩），收件方 0 后端即可查看 |
| PDF 导出 | A4 报告 + 每个来源带回链 QR 码（含水印） |
| Claim 反馈环 | 每条 citation 旁 thumbs ▲ / ▼，落地 SQLite 聚合显示 |

**工程与可靠性**

| 能力 | 说明 |
|------|------|
| 后端结果缓存 | SQLite + sha256 key，相同 (company, question, locale, mode) 直接命中 |
| IP 限流 | Token-bucket 20 req / min，结构化 429 + Retry-After |
| CDN fallback | 核心库优先本地，失败自动 fallback 公共 CDN |
| Lazy vendor | KG / pako / qrcode 按需加载，首屏 LCP 优化 |
| localStorage v2 | 单 key schema + 自动从旧 key 迁移 |
| 键盘快捷键 | ⌘K 聚焦 / ⌘↵ 运行 / Esc 关闭 / g h 历史 / ? 帮助 |
| 移动端抽屉 | sidebar fixed translate + scrim + tab 横滚渐隐遮罩 |
| WCAG AA | 全部 tab 完整 ARIA / 表单 role / aria-live / 对比度 4.5:1+ |
| Live 失败策略 | Live 数据不足或 API 失败时明确报错，不静默降级为样本结果 |
| 真实 A 股数据 | 东财 API 行情 / 财报 / 公告（registry 映射） |
| 实体关系 | 公司 / 客户 / 监管事件轻量图谱 |

### 快速开始

```bash
cd financial-research-agent
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # 填入 MIROMIND_API_KEY
python main.py
```

浏览器打开 **http://localhost:8080**

### 运行模式

TraceMind 现在只保留 **Live 模式**：必须配置 `MIROMIND_API_KEY`，所有研究请求都走 MiroMind API + 真实工具链。未配置或鉴权失败时会直接显示错误，不再切换到 Demo 或缓存样例。

### 数据真实性说明

TraceMind 的正式产品入口只支持 **Live 实时研究** 和 **东财真实行情工具**。数据真实性如下：

| 入口 | 数据来源 | 是否实时 | 用途 |
|------|----------|----------|------|
| Live 研究 | MiroMind API + 已注册工具 | 是 | 正式评测路径 |
| `fetch_market_data` | 东方财富公开接口 | 是 | A 股 quote / financials / announcements |

> 注意：Live 模式失败会明确提示失败原因，不会用样本结果冒充真实研究。

### 环境变量

```bash
MIROMIND_API_KEY=sk-...
MIROMIND_BASE_URL=https://api.miromind.ai/v1
MIROMIND_MODEL=mirothinker-1-7-deepresearch-mini
```

运行时可选参数：

```bash
TRACEMIND_RATE_LIMIT_PER_MIN=20
TRACEMIND_CACHE_TTL_SEC=86400
TRACEMIND_CACHE_MAX_ROWS=500
```

### 推荐演示路径

1. 打开首页，确认右上角为 `Live 模式`。
2. 使用默认「贵州茅台」或点击「真实行情」预设，直接发起 Live 研究。
3. 在「结论决策」看信任分、投资决策、财务/风险/来源 mini-chart。
4. 切到「证据全景」，点每条 citation 的 ▲ / ▼，展示 claim 反馈环。
5. 切到「推理过程」，展开每一步 ReAct：思考 → 工具 → 观察。
6. 切到「知识图谱」，展示公司 / 风险 / 来源之间的实体关系。
7. 点击「公司对比」，选择两家公司，展示侧-by-侧多指标比较。
8. 点击追问卡片，展示基于上一份报告的多轮增量回答。
9. 点击「分享链接」或「导出 PDF」，展示可交付报告。

### 评审看点 Checklist

- [x] 不是单段回答：所有结论都能追溯到 source。
- [x] 不是单一路径判断：有竞争假设和反证审计。
- [x] 不是只展示最终结论：ReAct 步骤、工具输入和观察完整可见。
- [x] 不是静态 demo：唯一入口是 Live MiroMind API、SSE 流、取消、追问。
- [x] 不是脆弱前端：CDN fallback、懒加载、错误恢复、结果缓存、限流都已处理。
- [x] 不是一次性输出：支持分享、PDF、JSON、历史记录、claim 反馈闭环。

### API

**研究（同步）**

```bash
curl -X POST http://localhost:8080/api/research \
  -H 'Content-Type: application/json' \
  -d '{"company":"贵州茅台","question":"主要风险是什么？","locale":"zh"}'
```

响应含 `protocol`：`audit`、`faithfulness`、`competing_hypotheses`、`entities`，相同请求会从 `data/result_cache.sqlite` 命中（标记 `cache_hit: true`）。

**研究（SSE 流式）**

```bash
curl -N -X POST http://localhost:8080/api/research/stream \
  -H 'Content-Type: application/json' \
  -d '{"company":"贵州茅台","question":"基本面如何","locale":"zh"}'
```

返回 `event: step/result/error`，前端用 `AbortController` 可中断。

**多轮追问**

```bash
curl -X POST http://localhost:8080/api/research/followup \
  -H 'Content-Type: application/json' \
  -d '{"followup_question":"渠道库存压力多大？","base_result":<上一次 ResearchResult>,"locale":"zh"}'
```

**Claim 反馈环**

```bash
# 投票
curl -X POST http://localhost:8080/api/feedback/claim \
  -H 'Content-Type: application/json' \
  -d '{"company":"贵州茅台","question":"...","locale":"zh","mode":"live","claim":"营收 1476 亿","verdict":"up"}'

# 聚合查询
curl 'http://localhost:8080/api/feedback/claim?company=贵州茅台&question=...&locale=zh&mode=live'
```

**健康检查（含运行时指标）**

```bash
curl http://localhost:8080/api/health
# { status, rate_limit: {buckets, limit, window_s},
#   cache: {rows, hits, ttl_s, max_rows}, feedback: {total_votes} }
```

**限流**：默认 20 req/min/IP，超出返回 429 + `Retry-After`。环境变量调整：`TRACEMIND_RATE_LIMIT_PER_MIN`、`TRACEMIND_CACHE_TTL_SEC`、`TRACEMIND_CACHE_MAX_ROWS`。

### 项目结构

```
financial-research-agent/
├── agent/
│   ├── react_agent.py      # ReAct 编排 + 多轮追问
│   ├── protocol.py         # 证据协议
│   ├── auditor.py          # 规则审计
│   ├── faithfulness.py     # 忠实度检查
│   ├── builder.py          # 协议构建
│   └── workflow.py         # 投研工作流
├── tools/
│   ├── __init__.py         # 财报 / 新闻 / 知识库
│   └── market_data.py      # 东财 A 股 API
├── runtime/
│   ├── cache.py            # SQLite 结果缓存（sha256 key + TTL + LRU）
│   ├── ratelimit.py        # Token-bucket IP 限流
│   └── feedback.py         # Claim thumbs ▲/▼ 持久化
├── web/                    # TraceMind Web UI
│   ├── cached/             # 旧版预生成报告资产（当前 Live-only UI 不展示）
│   └── vendor/             # CDN fallback 本地副本
├── data/                   # 样本 + company_registry + 运行时 sqlite
├── scripts/
│   ├── demo.sh             # 旧版演示脚本（当前主流程不使用）
│   └── build_cached_results.py  # 旧版 cached 报告生成脚本
└── api.py                  # FastAPI · 含限流 / 缓存 / 反馈
```

### 演示视频脚本（90 秒版）

| 时间 | 画面 | 旁白 |
|------|------|------|
| 0:00 – 0:08 | 首屏 + 5 家公司样例卡片 | "TraceMind 是可审计的金融研究 Agent — 零 API Key 直接体验 5 家真实公司报告。" |
| 0:08 – 0:18 | 点贵州茅台 → 结论决策 tab | "一次点击加载完整报告：信任分 80、接地率 50%、决策评级 + 跟踪指标全部带证据链。" |
| 0:18 – 0:30 | 财务/风险/来源 mini-chart + 切到证据全景 → 引用依据 | "三张可视化卡看穿核心面板，每条结论都有 source_id 双轴评级——非黑箱。" |
| 0:30 – 0:42 | 点 ▲ thumbs up → 数字立即 +1 | "评委对每条结论可投信誉票，后端 SQLite 实时聚合，下次打开仍可见。" |
| 0:42 – 0:55 | 切到推理过程 tab → 展开 Step 2 → 切到知识图谱 | "推理过程逐步展开思考-工具-观察，知识图谱按需懒加载，1.3MB 引擎不阻塞首屏。" |
| 0:55 – 1:08 | 点公司对比 → 茅台 vs 宁德 modal | "选两家样例左右并列：营收 / 利润 / 风险 / 接地率，差异方向箭头一目了然。" |
| 1:08 – 1:20 | 点追问卡片 → 实时增量回答 | "多轮追问复用前序证据链，不重启全流程，亮点反馈。" |
| 1:20 – 1:30 | ⌘K 聚焦 → 输入新公司 → ⌘↵ 运行 → Esc 取消 | "全键盘流畅操作；? 键查看所有快捷键；Esc 随时取消，AbortController 真断流。" |

### 示例问题

- 「贵州茅台当前估值与基本面是否匹配？」
- 「宁德时代海外份额和储能增长如何影响盈利？」
- 「比亚迪价格战下单车盈利底线在哪里？」

---

## English

See [README.en.md](README.en.md).
