---
title: "TraceMind · 研迹 · 产品视频底稿"
subtitle: "Anthropic-style 72s product film"
version: "v1.0"
date: "2026-05-24"
---

# TraceMind · 研迹 — 产品视频底稿

> 风格参照：Anthropic 官方产品视频（Claude / Artifacts 发布片）——印刷质感背景、克制 motion、真实产品截屏、低饱和暖色 + 深墨色、calm 旁白、强陈述句结尾。
> 目标时长：**72 秒**（弹性 60–75 秒）。
> 输出形态：1080p / 30fps，可同时导出 1:1（社媒）与 16:9（站点）。

---

## 1. 项目定位与视频目标

### 1.1 一句话定位

> TraceMind · 研迹 是一个**可审计**的金融研究 Agent：每一句话、每一次工具调用、每一条结论都绑定到具体的 `source_id`，主假设与反证并行，规则审计与忠实度校验逐条落地。

### 1.2 视频要传递的三层信息

| 层 | 信息 | 目标观感 |
|---|---|---|
| 表层 | TraceMind 能做投研 | "原来 Agent 已经能输出结构化决策卡" |
| 中层 | TraceMind 是可审计的 | "每条结论都能点进去看证据" |
| 内核 | TraceMind 拒绝黑箱 | "这是一条可以走回去的研究路径" |

### 1.3 不要做的事（反样式清单）

- 不堆 feature bullet
- 不用 stock 视频素材
- 不用 3D shader / 粒子轰炸
- 不用兴奋型 voice-over
- 不在镜头里展示 raw API key / 真实账户
- 不用闪烁、爆光、跳剪
- 不用 emoji 字幕

---

## 2. 60–75 秒总纲

```
00:00–00:10  HOOK         问题陈述：报告易写，结论难站
00:10–00:15  TITLE        TraceMind · 研迹 标题揭示
00:15–00:30  CORE 1       ReAct 推理可见 + Evidence 绑定
00:30–00:45  CORE 2       竞争假设 + 规则审计 + 忠实度
00:45–00:55  CORE 3       风险雷达 + 投研决策卡
00:55–01:05  CORE 4       知识图谱 + 多轮追问
01:05–01:12  TAGLINE      研究不再是黑箱
```

叙事弧线：**问题 → 命名 → 能力分层 → 收束陈述**。每段 5–10s，镜头总数 12 个。

---

## 3. 逐镜头脚本表

### S01 · HOOK 1

| 项 | 内容 |
|---|---|
| 时间 | `00:00 – 00:05` (frames 0–150) |
| 画面 | 暖白纸感背景上一份模糊的 PDF 投研报告，部分段落被柔和的灰条遮盖；右下角浮着一个细描的问号轮廓 |
| 屏幕字幕 | （无） |
| 旁白 | "金融研究的难点，不在生成一份报告——" |
| 动效 | 报告从 `opacity 0 / translateY 12px` 缓入 600ms；灰条由左向右扫过；问号在第 3s spring-in |
| Remotion 提示 | `<HookReport blur={6} redactedLines={[3,4,7]} />`，用 `interpolate(frame,[0,18],[0,1])` 控 opacity；`spring({frame, fps, config:{damping:18}})` 用于问号 |

### S02 · HOOK 2

| 项 | 内容 |
|---|---|
| 时间 | `00:05 – 00:10` |
| 画面 | 报告整体淡出，留下白纸；中央以 serif 字体出现一行字 |
| 屏幕字幕 | `而在让每一句话都站得住。` |
| 旁白 | "——而在让每一句话都站得住。" |
| 动效 | 文字逐字 fade-in（字符级 stagger 30ms）；底部出现极细 underline 滑入 400ms |
| Remotion 提示 | `<TypographicLine font="Tiempos" stagger={1} />`；用 `Array.from(text)` 按帧索引控制每字符 opacity |

### S03 · TITLE

| 项 | 内容 |
|---|---|
| 时间 | `00:10 – 00:15` |
| 画面 | 白纸背景上极简 logo mark（细线方框 + "T"）从左滑入，右侧出现产品名 |
| 屏幕字幕 | `TraceMind · 研迹` / 副标题 `Auditable Financial Research Agent` |
| 旁白 | "TraceMind · 研迹。" |
| 动效 | logo 从 `-24px` 滑入 + spring；副标题在 logo 落位后 200ms 出现 |
| Remotion 提示 | `<LogoMark />` + `<TitleBlock title subtitle delayFrames={6} />`；用 `useCurrentFrame()` 控制 sequential 入场 |

### S04 · ReAct 推理可见

| 项 | 内容 |
|---|---|
| 时间 | `00:15 – 00:23` |
| 画面 | 产品真实截屏：左侧步骤列 `Thought → Tool → Observation` 逐条流式出现；右侧空白等待 |
| 屏幕字幕 | 截屏内自然展示；外加左下角小标 `ReAct steps · streaming` |
| 旁白 | "把投研拆成可审计的链路。每一次思考、每一次取数——" |
| 动效 | 每条步骤从 `translateY 8px / opacity 0` spring-in，间隔 600ms；最后一条留出闪烁 caret |
| Remotion 提示 | `<ProductFrame screen="reasoning" />` 包裹 `<ReActStep />`；步骤数据来自 `data/react-steps.json` |

### S05 · Evidence 绑定

| 项 | 内容 |
|---|---|
| 时间 | `00:23 – 00:30` |
| 画面 | 报告正文，每个 claim 后面悬浮 source chip（如 `[S-03]` `[S-07]`），chip 与右侧来源面板用细线连接 |
| 屏幕字幕 | 右上小标 `Every claim · bound to a source` |
| 旁白 | "——每一条结论，都绑定到具体来源。" |
| 动效 | chip 由 scale 0.9 spring-in；连接线用 `strokeDashoffset` 从 100→0 绘制 800ms |
| Remotion 提示 | `<EvidenceBindingScene />` 内含 `<SourceChip id />` 与 `<LinkLine from to progress />`；progress 由 interpolate 帧驱动 |

### S06 · 竞争假设

| 项 | 内容 |
|---|---|
| 时间 | `00:30 – 00:38` |
| 画面 | 屏幕分成上下两栏：上栏 `Main thesis` 绑定 3 个 source；下栏 `Alternative` 绑定 2 个 source；两栏之间一条竖向分隔线 |
| 屏幕字幕 | `Main thesis` / `Alternative` / 底部 `competing_hypotheses` 协议标签 |
| 旁白 | "你能看到主假设，也能看到反证。" |
| 动效 | 上栏先入场（左滑），下栏延迟 400ms（右滑）；分隔线从中心向两端展开 |
| Remotion 提示 | `<HypothesesSplit main alternative />`；上下卡片用相反的 `translateX` 入场以暗示对照 |

### S07 · 规则审计

| 项 | 内容 |
|---|---|
| 时间 | `00:38 – 00:45` |
| 画面 | 一列审计规则名（`evidence_sufficiency` `counter_evidence` `source_ids` `confidence`），每条后面亮起 pass / warn 徽章 |
| 屏幕字幕 | 顶部 `protocol.audit` |
| 旁白 | "也能看到模型在哪里被规则审计拦住。" |
| 动效 | 徽章逐条点亮，warn 用暖橙色脉冲 1 次；其他用静态描边 |
| Remotion 提示 | `<AuditChecklist rules />` 子组件 `<AuditBadge status />`；pulse 用 `Math.sin(frame/8)` 控制 box-shadow 半径 |

### S08 · 忠实度

| 项 | 内容 |
|---|---|
| 时间 | `00:45 – 00:50` |
| 画面 | 左侧报告中的一句 claim，右侧并排展示对应 source 摘录，中间用波形/对齐线连接，命中部分高亮 |
| 屏幕字幕 | 顶部 `protocol.faithfulness · per-claim check` |
| 旁白 | "每条引用都会与原文比对，确认它没有走样。" |
| 动效 | 高亮 token 从左到右扫过 600ms；命中区淡入暖色背景 |
| Remotion 提示 | `<FaithfulnessDiff claim source matchedSpans />`；用 `interpolate` 控制扫描遮罩的 `clipPath` |

### S09 · 风险雷达 + 决策卡

| 项 | 内容 |
|---|---|
| 时间 | `00:50 – 00:58` |
| 画面 | 左：四维风险条（监管 / 客户集中度 / 量产 / 利润率）依次升起；右：决策卡 `Watch · Confidence 0.62`，附跟踪指标列表 |
| 屏幕字幕 | `Risk radar` / `Decision card` |
| 旁白 | "风险被分层，决策卡给出明确的评级、置信度和跟踪指标。" |
| 动效 | 风险条以 spring 从底部抬起；决策卡从右侧滑入 + 轻微 elevation shadow |
| Remotion 提示 | `<RiskRadar dims />` 与 `<DecisionCard rating confidence indicators />`；条形高度用 `interpolate(frame,[0,24],[0,value])` |

### S10 · 知识图谱

| 项 | 内容 |
|---|---|
| 时间 | `00:58 – 01:05` |
| 画面 | 3D force-directed 图（公司 / 客户 / 监管事件 / source）轻微旋转；鼠标移上某节点时弹出 tooltip |
| 屏幕字幕 | `Entity graph · companies · customers · regulators` |
| 旁白 | "知识图谱把公司、客户、监管事件连成一张可点击的网络。" |
| 动效 | 图谱整体 yaw 旋转 4°；cursor 移动到一个节点上 tooltip 浮现 |
| Remotion 提示 | 离线录制 KG 真实交互成 `.mp4`，作为 `<OffthreadVideo src />` 嵌入；上层覆盖 `<CursorPointer />` 与 `<Tooltip />` 控制时序 |

### S11 · 多轮追问

| 项 | 内容 |
|---|---|
| 时间 | `01:05 – 01:10` |
| 画面 | 顶部输入框输入 "那它的客户集中度风险呢？"，下面 SSE 步骤逐条出现，复用前一份报告的 source chip |
| 屏幕字幕 | `Follow-up · reuses prior evidence` |
| 旁白 | "追问基于已有证据增量推理，不必从零开始。" |
| 动效 | typing caret 在 input 中模拟输入 1.2s；SSE 步骤流式入场 |
| Remotion 提示 | `<TypewriterText text speedCps={20} />` 模拟输入；下方复用 `<ReActStep />` 但传 `variant="followup"` 切配色 |

### S12 · TAGLINE + 收束

| 项 | 内容 |
|---|---|
| 时间 | `01:10 – 01:15` |
| 画面 | 回到白纸背景；中央 serif 大字标语；下方小字 logo |
| 屏幕字幕 | 主：`研究不再是黑箱，而是一条你可以走回去的路径。`<br/>副：`TraceMind · 研迹` |
| 旁白 | "研究不再是黑箱，而是一条你可以走回去的路径。TraceMind · 研迹——让每一个判断都能被追溯。" |
| 动效 | 字符级 fade-in；末尾 underline 极慢绘制至画面末帧 |
| Remotion 提示 | 复用 `<TypographicLine />` 与 `<LogoMark variant="end" />`；最后 30 帧整体 fade-out 至 `#FAF7F2` |

---

## 4. 视觉风格规范

### 4.1 调色板

| Token | Hex | 用途 |
|---|---|---|
| `paper` | `#FAF7F2` | 主背景（亮场） |
| `ink` | `#1A1A1A` | 主文字 / logo mark |
| `ink-soft` | `#3A3A3A` | 次级正文 |
| `warm-gray` | `#6B6660` | 副标题 / 元信息 |
| `clay` | `#CC785C` | 主强调色（chip / underline / 决策正向） |
| `clay-soft` | `#E8C9BC` | 高亮底色 / 命中区背景 |
| `sand` | `#E8E2D6` | 分割线 / 卡片描边 |
| `dusk` | `#2B2A28` | 暗场背景（仅 S04 产品帧可选） |
| `signal-warn` | `#D08C3A` | audit warn |
| `signal-ok` | `#7A8C5A` | audit pass |

### 4.2 字体

| 用途 | 字族 | 备注 |
|---|---|---|
| 印刷质感大标题 / tagline | `Tiempos Headline` 或 `Source Serif 4` | 替代品 `Noto Serif SC` |
| 产品 UI 截屏内文字 | `Inter` / `SF Pro Text` | 与产品当前栈一致 |
| 中文正文 | `PingFang SC` / `思源黑体` | 字重 400 / 500 |
| 等宽 (协议名 / source_id) | `JetBrains Mono` 或 `IBM Plex Mono` | 字重 400 |

### 4.3 排版与节奏

- 全片只用 **两种字号阶**：标题 64–72px、正文 24–28px（@1080p）
- 行距 1.35 / 字距 -0.005em（serif）/ 0（sans）
- 转场以 **fade + 8–12px translate** 为主，禁止滑动 > 24px
- 所有 spring：`damping: 18, mass: 0.6, stiffness: 100`
- 单镜头内动效层数 ≤ 3

### 4.4 配乐与声效

| 元素 | 描述 |
|---|---|
| 底乐 | 钢琴 + 暖 pad，BPM ~70，无明显鼓点；推荐自制或 license 安静 ambient |
| SFX | chip 出现：极轻 tick（-24dB）；审计点亮：soft chime；其他不加 |
| 旁白 | 中文女声 / 男声均可，语速 ~4.2 字/秒，呼吸自然，避免广告腔 |
| 母带 | 整体 LUFS -16，旁白比底乐高 9 dB |

### 4.5 截屏处理

- 真实产品截屏统一裁切至 16:10 内框，外侧加 24px `paper` padding
- 不显示真实 API key、token、个人邮箱
- 公司样本固定使用：贵州茅台 / 宁德时代

---

## 5. Remotion 组件拆分建议

### 5.1 项目结构

```
tracemind-video/
├── remotion.config.ts
├── package.json
├── tsconfig.json
└── src/
    ├── Root.tsx
    ├── compositions/
    │   └── ProductFilm.tsx
    ├── scenes/
    │   ├── S01_Hook1.tsx ... S12_Outro.tsx
    ├── components/
    │   ├── LogoMark.tsx
    │   ├── TitleBlock.tsx
    │   ├── TypographicLine.tsx
    │   ├── TypewriterText.tsx
    │   ├── ProductFrame.tsx
    │   ├── ReActStep.tsx
    │   ├── SourceChip.tsx
    │   ├── LinkLine.tsx
    │   ├── HypothesisCard.tsx
    │   ├── AuditBadge.tsx
    │   ├── AuditChecklist.tsx
    │   ├── FaithfulnessDiff.tsx
    │   ├── RiskRadar.tsx
    │   ├── DecisionCard.tsx
    │   ├── CursorPointer.tsx
    │   ├── Tooltip.tsx
    │   └── HighlightBox.tsx
    ├── tokens/
    │   ├── colors.ts
    │   ├── type.ts
    │   └── motion.ts
    └── data/
        ├── react-steps.json
        ├── hypotheses.json
        ├── audit-rules.json
        ├── claim-source.json
        └── decision.json
```

### 5.2 Composition 配置

```tsx
<Composition
  id="ProductFilm"
  component={ProductFilm}
  durationInFrames={2160}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{ locale: "zh" }}
/>
```

### 5.3 性能与渲染建议

- 知识图谱不要在 Remotion 内实时渲染：录屏为 `.mp4`，用 `<OffthreadVideo />` 嵌入
- 截屏一律用 `.png`（清晰）+ Remotion 内做 padding / shadow
- 渲染命令：`npx remotion render ProductFilm out/tracemind.mp4 --concurrency=4`
- 同步导出 1:1 版本：复制 composition 改 width/height，复用 scene

---

## 6. 旁白全文（含时间码）

```
[00:00] 金融研究的难点，不在生成一份报告——
[00:05] ——而在让每一句话都站得住。
[00:10] TraceMind · 研迹。
[00:15] 把投研拆成可审计的链路。每一次思考、每一次取数——
[00:23] ——每一条结论，都绑定到具体来源。
[00:30] 你能看到主假设，也能看到反证。
[00:38] 也能看到模型在哪里被规则审计拦住。
[00:45] 每条引用都会与原文比对，确认它没有走样。
[00:50] 风险被分层，决策卡给出明确的评级、置信度和跟踪指标。
[00:58] 知识图谱把公司、客户、监管事件连成一张可点击的网络。
[01:05] 追问基于已有证据增量推理，不必从零开始。
[01:10] 研究不再是黑箱，而是一条你可以走回去的路径。
[01:13] TraceMind · 研迹——让每一个判断都能被追溯。
```

字数 ~248 字，平均 3.4 字/秒，与 12 段镜头一一对齐。

---

## 7. 制作与导出建议

| 阶段 | 建议 |
|---|---|
| 预可视化 | 先用 Figma 出 12 张静态 storyboard，确认构图与字幕，再进 Remotion |
| 资产准备 | 提前录制好 KG `.mp4`、各 Scene 截屏、logo SVG，统一放 `assets/` |
| 旁白先行 | 配音先录好并切成 12 个 wav，Remotion 内按时间码贴；用旁白节奏反推动效 |
| 渲染参数 | `--codec=h264 --crf=18 --pixel-format=yuv420p` |
| 字幕轨 | 同时导出 `.srt`（中英双语），供站点与社媒平台使用 |
| 版本管理 | `v0.1-storyboard` / `v0.5-rough-cut` / `v1.0-master` 三档 |

---

## 8. PDF 文档结构

```
封面
└─ TraceMind · 研迹 · 产品视频底稿 v1.0 / 日期 / 作者

目录（深度 2）

1. 项目定位与视频目标
2. 60–75 秒总纲
3. 逐镜头脚本表（S01–S12）
4. 视觉风格规范
5. Remotion 架构
6. 旁白全文
7. 制作与导出建议
附录 A — 设计 Token JSON
附录 B — 素材清单
附录 C — Pre-flight 检查清单
```

### 8.1 排版建议

- 页面：A4 纵向，外边距 22mm；脚本表用 A4 横向
- 正文：思源宋体 11pt / 行距 1.5
- 镜头表：每镜头一表 + 静态 storyboard 缩略图占位
- 章节首页加 `#E8E2D6` 细灰分割线

### 8.2 生成命令

```bash
pandoc docs/tracemind-video-script.md \
  -o docs/tracemind-video-script.pdf \
  --pdf-engine=xelatex \
  -V CJKmainfont="PingFang SC" \
  -V mainfont="Source Serif 4" \
  -V monofont="JetBrains Mono" \
  -V geometry:margin=22mm \
  --toc --toc-depth=2 \
  --highlight-style=tango
```

---

## 9. Pre-flight 检查清单

- [ ] 12 个 Scene 时间码加总 = 2160 帧（72s）
- [ ] 每条旁白起点与对应 Scene `from` 误差 ≤ 6 帧
- [ ] 截屏中不出现 `MIROMIND_API_KEY` 等敏感字段
- [ ] 公司样本仅使用 README 列出的 5 家之一
- [ ] 字幕 `.srt` 中英对齐，行长 ≤ 32 个汉字
- [ ] 1080p 与 1:1 两版导出，文件名包含版本号与日期
- [ ] 音频 LUFS = -16，旁白峰值 ≤ -3 dBFS
- [ ] 决策卡显示 `Watch / Confidence 0.62`，与脚本一致
- [ ] 审计徽章颜色严格使用 `signal-ok` / `signal-warn` token
- [ ] 收尾 logo 与开场 logo 使用同一 SVG 资产
