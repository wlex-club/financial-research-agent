/* Financial Research Agent — Frontend */

// ── Lazy vendor loader (3d-force-graph / pako / qrcode) ──────────────────────
// Heavy libs only fetched on first usage; failures fall back to CDN once.
const VENDOR_SPECS = {
  forceGraph: {
    globalName: "ForceGraph3D",
    local: "/assets/vendor/3d-force-graph.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/3d-force-graph",
  },
  pako: {
    globalName: "pako",
    local: "/assets/vendor/pako.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js",
  },
  qrcode: {
    globalName: "qrcode",
    local: "/assets/vendor/qrcode.min.js",
    cdn: "https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js",
  },
};

const VENDOR_PROMISES = {};

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = src;
    tag.async = false;
    tag.onload = () => resolve(src);
    tag.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(tag);
  });
}

function loadVendor(key) {
  const spec = VENDOR_SPECS[key];
  if (!spec) return Promise.reject(new Error(`unknown vendor ${key}`));
  if (window[spec.globalName]) return Promise.resolve(window[spec.globalName]);
  if (VENDOR_PROMISES[key]) return VENDOR_PROMISES[key];
  VENDOR_PROMISES[key] = injectScript(spec.local)
    .catch(() => injectScript(spec.cdn))
    .then(() => {
      if (!window[spec.globalName]) {
        throw new Error(`${spec.globalName} not defined after load`);
      }
      return window[spec.globalName];
    })
    .catch((err) => {
      delete VENDOR_PROMISES[key];
      throw err;
    });
  return VENDOR_PROMISES[key];
}

const I18N = {
  zh: {
    caption: "投研决策 · 证据协议 · 可审计",
    lang_label: "语言",
    theme_label: "主题色",
    theme_violet: "深海紫",
    theme_aurum: "曜石金",
    theme_light: "浅色",
    params: "研究参数",
    company: "目标公司",
    question: "研究问题",
    preset_market: "真实行情",
    cached_title: "真实公司预生成样例",
    cached_hint: "一键查看 · 无需 API · 非实时",
    cached_loading: "加载中…",
    cached_badge: "缓存",
    viz_financials_title: "财务亮点",
    viz_financials_sub: "来自年报",
    viz_risks_title: "风险信号分布",
    viz_risks_sub: "按严重程度",
    viz_sources_title: "证据来源构成",
    viz_sources_sub: "按来源类型",
    viz_no_data: "暂无数据",
    cancel_research: "取消",
    research_cancelled: "已取消研究",
    followup_pending_tag: "追问中",
    followup_answered_tag: "已回答",
    followup_error_tag: "失败",
    followup_pending_message: "Agent 正在基于已有证据池做增量分析…",
    followup_sources_label: "引用：",
    followup_open_full: "展开为主报告",
    followup_copy: "复制结论",
    followup_copied: "已复制到剪贴板",
    close_overlay: "关闭",
    compare_open: "公司对比",
    compare_open_hint: "选两家样例 · 左右并列",
    compare_title: "公司并列对比",
    compare_subtitle: "选择两家公司，并列查看信任分、关键财务与风险信号。",
    compare_left: "公司 A",
    compare_right: "公司 B",
    compare_pick: "请选择…",
    compare_loading: "加载中…",
    compare_metric_trust: "信任分",
    compare_metric_decision: "决策评级",
    compare_metric_revenue: "营收",
    compare_metric_net_profit: "归母净利润",
    compare_metric_rd: "研发投入",
    compare_metric_risks: "风险信号数",
    compare_metric_grounded: "接地率",
    compare_metric_sources: "来源数",
    compare_section_thesis: "多空逻辑",
    compare_section_monitor: "跟踪指标",
    compare_diff_higher: "A 更高",
    compare_diff_lower: "A 更低",
    compare_diff_equal: "持平",
    compare_close: "关闭",
    compare_pick_company: "请选择公司",
    compare_same_warning: "提示：选了同一家公司，请挑两家不同的样例。",
    error_action_retry: "重试",
    error_action_check_config: "检查 API 配置",
    error_offline_title: "网络已断开",
    error_offline_message: "暂时连接不到后端服务，请检查 Wi-Fi / VPN。",
    error_offline_hint: "也可直接在侧栏点开预置公司样例，本地即时查看完整报告。",
    error_timeout_title: "请求超时",
    error_timeout_message: "Agent 长时间未返回结果（>3 分钟），可能是 LLM 响应过慢。",
    error_auth_title: "API 鉴权失败",
    error_auth_message: "MiroMind API key 未配置或已失效，无法调用真实模型。",
    error_auth_hint: "Live 模式需要有效的 MiroMind API key。",
    error_rate_title: "请求过于频繁",
    error_rate_message: "上游服务限流，请稍等片刻后再试。",
    error_unavailable_title: "服务暂时不可用",
    error_unavailable_message: "后端或上游 LLM 服务繁忙，请稍后重试。",
    error_bad_request_title: "请求参数有误",
    error_bad_request_message: "请检查公司名与问题是否填写完整。",
    error_server_title: "服务器错误",
    error_server_message: "后端返回了意外错误，请检查 Live API 配置后重试。",
    metric_revenue: "营收",
    metric_net_profit: "净利润",
    metric_rd_expense: "研发投入",
    metric_total_assets: "总资产",
    metric_total_liabilities: "总负债",
    severity_high: "高",
    severity_medium: "中",
    severity_low: "低",
    source_type_financial_report: "财报",
    source_type_news: "新闻",
    source_type_knowledge: "知识库",
    source_type_market_data: "行情",
    run: "开始尽调",
    clear: "清除结果",
    trace_title: "可追溯设计",
    trace_1: "每步展示思考 → 工具 → 观察",
    trace_2: "每条结论绑定 source_id + 双轴评级",
    trace_3: "竞争假设 · 规则审计 · 实体关系",
    title: "TraceMind · 研迹",
    subtitle: "可审计的金融研究 Agent · 每个结论可追溯到原始文档 · 0 幻觉",
    export: "导出 JSON",
    export_report: "导出报告",
    export_pdf: "导出 PDF",
    share: "分享链接",
    share_copied: "链接已复制到剪贴板",
    share_copied_sub: "扔到群里或邮件中，对方打开即可看到完整报告（无需服务器）",
    share_too_large: "结果过大，请使用 JSON 导出",
    share_decode_failed: "分享链接解析失败",
    share_load_fail: "分享组件加载失败，请检查网络",
    kg_loading: "知识图谱组件加载中…",
    kg_load_fail: "知识图谱组件加载失败，请检查网络后刷新",
    kg_fallback_title: "2D 证据图谱 fallback",
    kg_fallback_body: "3D 引擎不可用，已切换为轻量 2D/列表视图，实体、关系和来源仍可审计。",
    share_downloaded: "分享链接过长，已下载本地 JSON",
    feedback_up: "标记结论可信",
    feedback_down: "标记结论存疑",
    feedback_sending: "提交中…",
    feedback_thanks: "感谢反馈",
    feedback_failed: "提交失败，请稍后再试",
    trace_mode_title: "追溯模式",
    trace_mode_body: "点击任意 source_id，可从结论跳到来源索引，再反查支持的 claim 与出现过的 ReAct step。",
    trace_supported_claims: "支持结论",
    trace_used_steps: "出现步骤",
    data_mode_live: "Live 实时数据",
    data_mode_cache_hit: "Live 缓存命中",
    data_mode_fallback: "Live 失败",
    data_mode_hybrid: "Hybrid 真实来源",
    data_generated_at: "生成时间",
    data_mode_label: "数据模式",
    data_source_types: "数据源类型",
    data_source_mix: "来源结构",
    data_source_official: "权威/行情",
    data_source_news: "公告/新闻",
    data_source_reference: "知识库",
    tool_hit: "命中",
    tool_miss: "未命中",
    tool_cache_hit: "缓存命中",
    shortcut_panel_title: "键盘快捷键",
    shortcut_panel_sub: "提升尽调效率 · 按 ? 随时查看",
    shortcut_focus: "聚焦目标公司输入框",
    shortcut_run: "开始尽调",
    shortcut_close: "关闭弹层 / 取消进行中的研究",
    shortcut_go_history: "切换到 历史记录",
    shortcut_go_insights: "切换到 结论决策",
    shortcut_help: "显示本快捷键面板",
    pdf_cover_title: "TraceMind 研究报告",
    pdf_cover_sub: "可审计金融研究 Agent · 每个结论可追溯到原始文档",
    pdf_generated_at: "生成时间",
    pdf_qr_caption: "扫码追溯",
    pdf_share_qr_caption: "扫码打开完整在线报告",
    pdf_print_btn: "打印 / 另存为 PDF",
    pdf_close_btn: "关闭预览",
    metric_steps: "推理步骤",
    metric_citations: "引用依据",
    metric_sources: "来源数量",
    metric_audit: "审计得分",
    metric_confidence: "置信度",
    empty_title: "填写参数，点击开始尽调",
    empty_body: "Agent 将展示完整推理链路与引用来源",
    error_api_unavailable: "MiroMind API 暂不可用（503）。请检查 API Key、网络或稍后重试。",
    error_generic: "请求失败",
    loading_1: "获取财报数据",
    loading_2: "检索新闻舆情",
    loading_3: "交叉验证指标",
    loading_4: "生成研究结论",
    thinking_title: "Agent 正在思考",
    thinking_sub: "规划研究路径 · 调用工具 · 校验证据",
    thinking_hint: "每一步都会写入可回放的推理轨迹",
    thinking_planning: "规划研究问题",
    thinking_searching: "检索证据来源",
    thinking_calling: "调用工具",
    thinking_observing: "观察工具返回",
    thinking_auditing: "审计与接地校验",
    thinking_concluding: "凝结研究结论",
    thinking_finalizing: "生成最终判断",
    followup_title: "继续追问",
    followup_subtitle: "基于本次研究自动推荐的相关问题",
    followup_risk: "深入分析「{name}」风险及缓解措施",
    followup_peer: "对比 {peer} 在同一问题上的表现",
    followup_metric: "{company} 的 {name} 近三年趋势如何",
    followup_scenario: "若行业景气度下行 30%，估值缓冲多少",
    followup_followup: "针对监管/客户集中度，公司有何长期对冲策略",
    tab_conclusion: "研究结论",
    tab_results_list: "研究结果",
    tab_evidence_chain: "证据链总览",
    tab_decision: "决策/对比",
    tab_hypotheses: "竞争假设",
    tab_audit: "证据审计",
    tab_entities: "知识图谱",
    tab_history: "历史记录",
    tab_citations: "引用依据",
    tab_trace: "推理链路",
    tab_sources: "来源索引",
    tab_insights: "结论决策",
    tab_evidence: "证据全景",
    tab_reasoning: "推理过程",
    tab_graph: "知识图谱",
    sub_conclusion: "研究结论",
    sub_decision: "投资决策",
    sub_sandtable: "数字沙盘",
    sub_results_list: "关键发现",
    sub_hypotheses: "竞争假设",
    sub_evidence_chain: "证据链总览",
    sub_citations: "引用依据",
    sub_sources: "来源索引",
    sub_audit: "证据审计",
    thought: "思考",
    tool_input: "工具输入",
    observation: "观察结果",
    sources_in_step: "本步引用来源",
    conclusion_label: "研究结论",
    default_company: "贵州茅台",
    default_question: "当前估值与基本面是否匹配？主要风险是什么？",
    market_company: "贵州茅台",
    market_question: "当前估值与基本面是否匹配？主要风险是什么？",
    mode_live: "Live 模式",
    audit_pass: "审计通过",
    audit_fail: "需改进",
    faithfulness: "忠实度",
    faithfulness_pass: "来源支撑充分",
    faithfulness_fail: "存在无来源支撑判断",
    grounded: "已溯源",
    ungrounded: "未溯源",
    chain_question: "研究问题",
    chain_answer: "最终判断",
    chain_trace: "推理闭环",
    chain_claims: "关键判断",
    chain_sources: "证据来源",
    chain_quality: "质量闸门",
    chain_financials: "财务比率",
    chain_risks: "风险雷达",
    chain_step: "步骤",
    chain_source_rating: "来源评级",
    warning_prefix: "已自动降级",
    result_list_title: "调研结果列表",
    sandtable_title: "多智能体数字沙盘推演",
    sandtable_subtitle: "让不同角色围绕同一证据池进行攻防推演，形成可解释决策。",
    sandtable_round_1: "第 1 轮 · 基线校准",
    sandtable_round_2: "第 2 轮 · 攻防推演",
    sandtable_round_3: "第 3 轮 · 决策收敛",
    sandtable_final_decision: "沙盘结论",
    sandtable_action_buy: "建议积极配置",
    sandtable_action_watch: "建议观察/分批",
    sandtable_action_cautious: "建议谨慎回避",
    sandtable_agent_cfo: "财务官 Agent",
    sandtable_agent_strategy: "战略 Agent",
    sandtable_agent_risk: "风控 Agent",
    sandtable_agent_market: "市场 Agent",
    sandtable_agent_allocator: "组合经理 Agent",
    sandtable_role_cfo: "验证收入、利润、杠杆和现金质量",
    sandtable_role_strategy: "评估增长催化、产品/渠道与竞争位置",
    sandtable_role_risk: "寻找反证、监管、估值和下行压力",
    sandtable_role_market: "用行情和估值反馈校验市场预期",
    sandtable_role_allocator: "汇总多方意见并给出仓位动作",
    sandtable_bias_bull: "偏多",
    sandtable_bias_watch: "中性观察",
    sandtable_bias_bear: "偏谨慎",
    sandtable_metric_score: "推演置信",
    result_type_decision: "投研评级",
    result_type_claim: "关键判断",
    result_type_risk: "风险信号",
    result_type_metric: "财务指标",
    result_status_grounded: "已验证",
    result_status_watch: "需跟踪",
    kg_title: "3D 知识图谱",
    kg_hint: "节点可视化展示公司、事件、客户与来源之间的关系",
    kg_entity: "实体",
    kg_source: "来源",
    kg_search: "搜索实体/来源",
    kg_all_types: "全部类型",
    kg_stats_entities: "实体",
    kg_stats_relations: "关系",
    kg_stats_sources: "来源锚点",
    kg_stats_communities: "社区",
    kg_selected: "节点 X-Ray",
    kg_neighbors: "相邻节点",
    kg_evidence: "证据锚点",
    kg_strength: "关系强度",
    kg_select_hint: "点击图谱节点查看详情",
    kg_drag_hint: "拖拽节点 · 滚轮缩放 · 双击聚焦",
    kg_reset: "复位",
    kg_fit: "适配视图",
    kg_path_mode: "路径分析",
    kg_path_hint: "依次点击起点与终点节点",
    kg_path_source: "起点",
    kg_path_target: "终点",
    kg_path_found: "找到路径",
    kg_path_none: "未找到路径",
    kg_clear_path: "清除路径",
    kg_degree: "连接度",
    kg_community: "所属社区",
    kg_pagerank: "重要度",
    kg_view_2d: "2D 力图",
    kg_view_3d: "3D 立体",
    kg_neighbor_list: "邻居列表",
    kg_hover_hint: "悬停节点查看连接子图",
    history_title: "历史检索记录",
    history_empty: "暂无历史记录。完成一次尽调后会自动保存。",
    history_open: "查看结果",
    history_time: "检索时间",
    history_delete: "删除",
    history_delete_aria: "删除该条历史记录",
    history_delete_confirm: "确认删除这条历史记录吗？此操作不可撤销。",
    hero_trust_label: "信任评分",
    hero_trust_caption: "审计 · 接地 · 风险综合",
    hero_grounded: "接地率",
    hero_grounded_sub: "判断已溯源",
    hero_sources: "证据源",
    hero_sources_sub: "官方/新闻/行情",
    hero_risks: "风险信号",
    hero_risks_sub: "高/中/低",
    hero_verdict_high: "高可信 · 可作 IC 上会底稿",
    hero_verdict_mid: "中等可信 · 建议人工复核重点结论",
    hero_verdict_low: "需复核 · 部分结论缺乏证据支撑",
    hero_zero_hallucination: "0 处幻觉",
    hero_n_review: "处需复核",
    hero_compare_btn: "对比基线 LLM",
    hero_compare_close: "返回",
    hero_decision_label: "投研决策",
    hero_decision_rationale: "决策依据",
    hero_decision_monitor: "跟踪指标",
    baseline_title: "TraceMind vs 普通 LLM",
    baseline_subtitle: "同样的问题，无证据接地的 LLM 输出 vs 我们的可审计输出",
    baseline_naive_title: "普通 LLM (无证据接地)",
    baseline_naive_warning: "⚠️ 内容由模型直接生成，未与任何外部源对账，可能含幻觉",
    baseline_naive_attrs: ["无 source_id 绑定", "无置信度自评", "无审计/接地检测", "无可回放推理轨迹"],
    baseline_tracemind_title: "TraceMind (可审计输出)",
    baseline_tracemind_attrs: ["每条判断带 source_id", "双轴 source/info 评级", "审计 + 接地通过率", "完整推理链路可回放"],
    source_tier_first_party: "一手·权威",
    source_tier_official: "官方·行情",
    source_tier_reference: "参考·知识库",
    source_tier_secondary: "二手·媒体",
    source_reliability_label: "可信度",
    financial_metric: {
      revenue: "营业收入",
      net_profit: "净利润",
      rd_expense: "研发费用",
      total_assets: "总资产",
      total_liabilities: "总负债",
      net_margin: "净利率",
      rd_expense_ratio: "研发费用率",
      debt_to_asset_ratio: "资产负债率",
    },
    risk_signal: {
      regulatory_disclosure: "监管披露风险",
      customer_concentration: "客户集中度风险",
      commercialization_yield: "量产/良率风险",
      margin_pressure: "利润率压力",
    },
    risk_severity: { low: "低", medium: "中", high: "高" },
    decision_rating: { positive: "积极", watch: "观察", cautious: "谨慎" },
    decision_title: "投研决策卡",
    decision_rationale: "判断理由",
    decision_monitoring: "跟踪指标",
    benchmark_title: "同行对比",
    benchmark_revenue: "收入(亿元)",
    benchmark_margin: "净利率",
    benchmark_rd: "研发率",
    benchmark_debt: "资产负债率",
    confidence: { low: "低", medium: "中", high: "高" },
    relation: { supporting: "支持", contradicting: "反证", neutral: "中性" },
    hypothesis_main: "主假设",
    hypothesis_alt: "备择假设",
    no_data: "—",
    source_type: {
      financial_report: "财报",
      news: "新闻",
      knowledge: "知识库",
      market_data: "行情",
    },
    sentiment: {
      positive: "↑ 利好",
      negative: "↓ 风险",
      neutral: "· 中性",
    },
  },
  en: {
    caption: "Investment Research · Auditable Evidence",
    lang_label: "Language",
    theme_label: "Theme",
    theme_violet: "Abyss Violet",
    theme_aurum: "Obsidian Gold",
    theme_light: "Light",
    params: "Research Parameters",
    company: "Target Company",
    question: "Research Question",
    preset_market: "Market Data",
    cached_title: "Pre-generated real-company samples",
    cached_hint: "One-click · No API key · Not realtime",
    cached_loading: "Loading…",
    cached_badge: "Cached",
    viz_financials_title: "Financial highlights",
    viz_financials_sub: "From annual report",
    viz_risks_title: "Risk signals",
    viz_risks_sub: "By severity",
    viz_sources_title: "Evidence sources",
    viz_sources_sub: "By source type",
    viz_no_data: "No data",
    cancel_research: "Cancel",
    research_cancelled: "Research cancelled",
    followup_pending_tag: "Asking",
    followup_answered_tag: "Answered",
    followup_error_tag: "Failed",
    followup_pending_message: "Agent is doing incremental analysis over the existing evidence pool…",
    followup_sources_label: "Cites:",
    followup_open_full: "Open as main report",
    followup_copy: "Copy answer",
    followup_copied: "Copied to clipboard",
    close_overlay: "Close",
    compare_open: "Compare companies",
    compare_open_hint: "Pick two samples · side-by-side",
    compare_title: "Side-by-side comparison",
    compare_subtitle: "Pick two cached companies to compare trust, key financials and risk signals.",
    compare_left: "Company A",
    compare_right: "Company B",
    compare_pick: "Select…",
    compare_loading: "Loading…",
    compare_metric_trust: "Trust score",
    compare_metric_decision: "Decision",
    compare_metric_revenue: "Revenue",
    compare_metric_net_profit: "Net profit",
    compare_metric_rd: "R&D spend",
    compare_metric_risks: "Risk signals",
    compare_metric_grounded: "Grounded %",
    compare_metric_sources: "Sources",
    compare_section_thesis: "Bull / bear thesis",
    compare_section_monitor: "Monitoring KPIs",
    compare_diff_higher: "A higher",
    compare_diff_lower: "A lower",
    compare_diff_equal: "Even",
    compare_close: "Close",
    compare_pick_company: "Pick a company",
    compare_same_warning: "Heads up: same company on both sides — pick two different samples.",
    error_action_retry: "Retry",
    error_action_check_config: "Check API config",
    error_offline_title: "You appear offline",
    error_offline_message: "Cannot reach the backend right now. Check Wi-Fi / VPN.",
    error_offline_hint: "Live mode needs the backend and network connection.",
    error_timeout_title: "Request timed out",
    error_timeout_message: "Agent did not respond within 3 minutes — the LLM may be slow.",
    error_auth_title: "API authentication failed",
    error_auth_message: "MiroMind API key missing or invalid; live model calls are blocked.",
    error_auth_hint: "Live mode requires a valid MiroMind API key.",
    error_rate_title: "Rate-limited",
    error_rate_message: "Upstream service throttling. Wait a moment and try again.",
    error_unavailable_title: "Service temporarily unavailable",
    error_unavailable_message: "Backend or upstream LLM busy — retry shortly.",
    error_bad_request_title: "Invalid request",
    error_bad_request_message: "Please make sure both company and question are filled in.",
    error_server_title: "Server error",
    error_server_message: "Backend returned an unexpected error. Check Live API configuration and retry.",
    metric_revenue: "Revenue",
    metric_net_profit: "Net profit",
    metric_rd_expense: "R&D",
    metric_total_assets: "Total assets",
    metric_total_liabilities: "Total liabilities",
    severity_high: "High",
    severity_medium: "Medium",
    severity_low: "Low",
    source_type_financial_report: "Filing",
    source_type_news: "News",
    source_type_knowledge: "Knowledge",
    source_type_market_data: "Market",
    run: "Run Due Diligence",
    clear: "Clear Results",
    trace_title: "Traceability Design",
    trace_1: "Each step: thought → tool → observation",
    trace_2: "Every claim bound to source_id + dual-axis rating",
    trace_3: "Competing hypotheses · Rule audit · Entity graph",
    title: "TraceMind",
    subtitle: "Auditable financial research agent · Every claim traces back to source · Zero hallucination",
    export: "Export JSON",
    export_report: "Export Report",
    export_pdf: "Export PDF",
    share: "Share link",
    share_copied: "Shareable link copied to clipboard",
    share_copied_sub: "Paste it into chat or email — recipients open it as a fully self-contained report",
    share_too_large: "Result too large to encode in URL — please use JSON export",
    share_decode_failed: "Failed to decode shared link",
    share_load_fail: "Share components failed to load — check your network",
    kg_loading: "Loading knowledge graph engine…",
    kg_load_fail: "Knowledge graph engine failed to load — check network and refresh",
    kg_fallback_title: "2D evidence graph fallback",
    kg_fallback_body: "3D engine is unavailable, so a lightweight 2D/list view keeps entities, relations, and sources auditable.",
    share_downloaded: "Share link too long; downloaded local JSON instead",
    feedback_up: "Mark claim as trustworthy",
    feedback_down: "Mark claim as questionable",
    feedback_sending: "Submitting…",
    feedback_thanks: "Thanks for the signal",
    feedback_failed: "Submit failed — try again",
    trace_mode_title: "Trace mode",
    trace_mode_body: "Click any source_id to jump from claims to the source index, then back to supported claims and ReAct steps.",
    trace_supported_claims: "Supports claims",
    trace_used_steps: "Used in steps",
    data_mode_live: "Live realtime data",
    data_mode_cache_hit: "Live cache hit",
    data_mode_fallback: "Live failed",
    data_mode_hybrid: "Hybrid real sources",
    data_generated_at: "Generated",
    data_mode_label: "Data mode",
    data_source_types: "Source types",
    data_source_mix: "Source mix",
    data_source_official: "Official/market",
    data_source_news: "Announcements/news",
    data_source_reference: "Knowledge",
    tool_hit: "Hit",
    tool_miss: "Miss",
    tool_cache_hit: "Cache hit",
    shortcut_panel_title: "Keyboard shortcuts",
    shortcut_panel_sub: "Press ? any time to reopen",
    shortcut_focus: "Focus the company input",
    shortcut_run: "Start research",
    shortcut_close: "Close overlay / cancel running research",
    shortcut_go_history: "Jump to History tab",
    shortcut_go_insights: "Jump to Insights tab",
    shortcut_help: "Show this shortcut panel",
    pdf_cover_title: "TraceMind Research Report",
    pdf_cover_sub: "Auditable financial research agent · Every claim traces back to source",
    pdf_generated_at: "Generated",
    pdf_qr_caption: "Scan to trace",
    pdf_share_qr_caption: "Scan to open the full online report",
    pdf_print_btn: "Print / Save as PDF",
    pdf_close_btn: "Close preview",
    metric_steps: "Reasoning Steps",
    metric_citations: "Citations",
    metric_sources: "Sources",
    metric_audit: "Audit Score",
    metric_confidence: "Confidence",
    empty_title: "Fill in parameters and click Run",
    empty_body: "The agent will show the full reasoning trace and cited sources",
    error_api_unavailable: "MiroMind API unavailable (503). Check API key, network, or retry later.",
    error_generic: "Request failed",
    loading_1: "Fetching financial report",
    loading_2: "Searching news & sentiment",
    loading_3: "Cross-checking key metrics",
    loading_4: "Generating conclusion",
    thinking_title: "Agent is thinking",
    thinking_sub: "Planning · invoking tools · validating evidence",
    thinking_hint: "Every step is written to a replayable reasoning trace",
    thinking_planning: "Planning the research path",
    thinking_searching: "Retrieving evidence sources",
    thinking_calling: "Invoking tool",
    thinking_observing: "Observing tool output",
    thinking_auditing: "Auditing & grounding check",
    thinking_concluding: "Synthesizing conclusion",
    thinking_finalizing: "Finalizing verdict",
    followup_title: "Continue the inquiry",
    followup_subtitle: "Auto-suggested follow-up questions based on this research",
    followup_risk: "Drill into the «{name}» risk and mitigation plan",
    followup_peer: "How does {peer} perform on the same question",
    followup_metric: "How has {company}'s {name} trended over the past 3 years",
    followup_scenario: "If sector sentiment drops 30%, how much valuation cushion remains",
    followup_followup: "What long-term hedges does the company hold against regulatory/concentration risk",
    tab_conclusion: "Conclusion",
    tab_results_list: "Research Results",
    tab_evidence_chain: "Evidence Chain",
    tab_decision: "Decision / Benchmark",
    tab_hypotheses: "Hypotheses",
    tab_audit: "Audit",
    tab_entities: "Knowledge Graph",
    tab_history: "History",
    tab_citations: "Citations",
    tab_trace: "Reasoning Trace",
    tab_sources: "Sources",
    tab_insights: "Insights",
    tab_evidence: "Evidence",
    tab_reasoning: "Reasoning",
    tab_graph: "Knowledge Graph",
    sub_conclusion: "Conclusion",
    sub_decision: "Decision",
    sub_sandtable: "Digital Sandbox",
    sub_results_list: "Key Findings",
    sub_hypotheses: "Hypotheses",
    sub_evidence_chain: "Evidence Chain",
    sub_citations: "Citations",
    sub_sources: "Sources",
    sub_audit: "Audit",
    thought: "Thought",
    tool_input: "Tool Input",
    observation: "Observation",
    sources_in_step: "Sources in This Step",
    conclusion_label: "Research Conclusion",
    default_company: "Kweichow Moutai",
    default_question: "Do valuation and fundamentals match? What are the key risks?",
    market_company: "Kweichow Moutai",
    market_question: "Do valuation and fundamentals match? What are the key risks?",
    mode_live: "Live Mode",
    audit_pass: "Audit Passed",
    audit_fail: "Needs Review",
    faithfulness: "Faithfulness",
    faithfulness_pass: "Claims well grounded",
    faithfulness_fail: "Ungrounded claims detected",
    grounded: "Grounded",
    ungrounded: "Ungrounded",
    chain_question: "Research Question",
    chain_answer: "Final Judgment",
    chain_trace: "Reasoning Loop",
    chain_claims: "Key Claims",
    chain_sources: "Evidence Sources",
    chain_quality: "Quality Gates",
    chain_financials: "Financial Ratios",
    chain_risks: "Risk Radar",
    chain_step: "Step",
    chain_source_rating: "Source Rating",
    warning_prefix: "Auto fallback",
    result_list_title: "Research Result List",
    sandtable_title: "Multi-Agent Digital Sandbox",
    sandtable_subtitle: "Let multiple roles debate the same evidence pool and converge to an explainable decision.",
    sandtable_round_1: "Round 1 · Baseline Calibration",
    sandtable_round_2: "Round 2 · Debate Simulation",
    sandtable_round_3: "Round 3 · Decision Convergence",
    sandtable_final_decision: "Sandbox Conclusion",
    sandtable_action_buy: "Actively allocate",
    sandtable_action_watch: "Watch / stage in",
    sandtable_action_cautious: "Stay cautious",
    sandtable_agent_cfo: "CFO Agent",
    sandtable_agent_strategy: "Strategy Agent",
    sandtable_agent_risk: "Risk Agent",
    sandtable_agent_market: "Market Agent",
    sandtable_agent_allocator: "Portfolio Agent",
    sandtable_role_cfo: "Validate revenue, profit, leverage, and cash quality",
    sandtable_role_strategy: "Assess growth catalysts, product/channel position, and competition",
    sandtable_role_risk: "Search counter-evidence, regulation, valuation and downside pressure",
    sandtable_role_market: "Use quote and valuation feedback to verify market expectations",
    sandtable_role_allocator: "Aggregate the debate and decide the position action",
    sandtable_bias_bull: "Bullish",
    sandtable_bias_watch: "Neutral watch",
    sandtable_bias_bear: "Cautious",
    sandtable_metric_score: "Simulation Confidence",
    result_type_decision: "Decision Rating",
    result_type_claim: "Key Claim",
    result_type_risk: "Risk Signal",
    result_type_metric: "Financial Metric",
    result_status_grounded: "Verified",
    result_status_watch: "Watch",
    kg_title: "3D Knowledge Graph",
    kg_hint: "Visualizes relationships among company, events, customers, and sources",
    kg_entity: "Entity",
    kg_source: "Source",
    kg_search: "Search entities / sources",
    kg_all_types: "All Types",
    kg_stats_entities: "Entities",
    kg_stats_relations: "Relations",
    kg_stats_sources: "Source Anchors",
    kg_stats_communities: "Communities",
    kg_selected: "Node X-Ray",
    kg_neighbors: "Neighbors",
    kg_evidence: "Evidence Anchors",
    kg_strength: "Relation Strength",
    kg_select_hint: "Click a graph node for details",
    kg_drag_hint: "Drag nodes · Wheel to zoom · Double click to focus",
    kg_reset: "Reset",
    kg_fit: "Fit View",
    kg_path_mode: "Path Analysis",
    kg_path_hint: "Click source then target node",
    kg_path_source: "Source",
    kg_path_target: "Target",
    kg_path_found: "Path Found",
    kg_path_none: "No Path",
    kg_clear_path: "Clear Path",
    kg_degree: "Degree",
    kg_community: "Community",
    kg_pagerank: "Importance",
    kg_view_2d: "2D Force",
    kg_view_3d: "3D Orbit",
    kg_neighbor_list: "Neighbors",
    kg_hover_hint: "Hover a node to highlight its subgraph",
    history_title: "Search History",
    history_empty: "No history yet. A record is saved after each research run.",
    history_open: "Open Result",
    history_time: "Search Time",
    history_delete: "Delete",
    history_delete_aria: "Delete this history record",
    history_delete_confirm: "Delete this history record? This cannot be undone.",
    hero_trust_label: "Trust Score",
    hero_trust_caption: "Audit · Grounding · Risk composite",
    hero_grounded: "Grounded",
    hero_grounded_sub: "claims traced to source",
    hero_sources: "Evidence",
    hero_sources_sub: "Official / News / Market",
    hero_risks: "Risk Signals",
    hero_risks_sub: "High / Med / Low",
    hero_verdict_high: "High trust · ready for IC memo",
    hero_verdict_mid: "Medium trust · human review recommended for key claims",
    hero_verdict_low: "Needs review · some claims lack evidence support",
    hero_zero_hallucination: "0 hallucinations",
    hero_n_review: "to review",
    hero_compare_btn: "Compare vs baseline LLM",
    hero_compare_close: "Back",
    hero_decision_label: "Investment Decision",
    hero_decision_rationale: "Rationale",
    hero_decision_monitor: "Monitor",
    baseline_title: "TraceMind vs Vanilla LLM",
    baseline_subtitle: "Same question. Naive LLM (no grounding) vs our auditable output",
    baseline_naive_title: "Vanilla LLM (no grounding)",
    baseline_naive_warning: "⚠️ Generated directly by the model with no external source reconciliation — may contain hallucinations",
    baseline_naive_attrs: ["No source_id binding", "No self-rated confidence", "No audit / grounding check", "No replayable reasoning trace"],
    baseline_tracemind_title: "TraceMind (auditable)",
    baseline_tracemind_attrs: ["Every claim bound to a source_id", "Dual-axis source / info rating", "Audit + grounding pass rate", "Full replayable reasoning chain"],
    source_tier_first_party: "First-party",
    source_tier_official: "Official",
    source_tier_reference: "Reference",
    source_tier_secondary: "Secondary",
    source_reliability_label: "Reliability",
    financial_metric: {
      revenue: "Revenue",
      net_profit: "Net Profit",
      rd_expense: "R&D Expense",
      total_assets: "Total Assets",
      total_liabilities: "Total Liabilities",
      net_margin: "Net Margin",
      rd_expense_ratio: "R&D Ratio",
      debt_to_asset_ratio: "Debt-to-Asset",
    },
    risk_signal: {
      regulatory_disclosure: "Regulatory Disclosure",
      customer_concentration: "Customer Concentration",
      commercialization_yield: "Commercialization / Yield",
      margin_pressure: "Margin Pressure",
    },
    risk_severity: { low: "Low", medium: "Medium", high: "High" },
    decision_rating: { positive: "Positive", watch: "Watch", cautious: "Cautious" },
    decision_title: "Investment Decision",
    decision_rationale: "Rationale",
    decision_monitoring: "Monitoring Indicators",
    benchmark_title: "Peer Benchmark",
    benchmark_revenue: "Revenue (B CNY)",
    benchmark_margin: "Net Margin",
    benchmark_rd: "R&D Ratio",
    benchmark_debt: "Debt-to-Asset",
    confidence: { low: "Low", medium: "Medium", high: "High" },
    relation: { supporting: "Supporting", contradicting: "Contradicting", neutral: "Neutral" },
    hypothesis_main: "Main",
    hypothesis_alt: "Alternative",
    no_data: "—",
    source_type: {
      financial_report: "Annual Report",
      news: "News",
      knowledge: "Knowledge",
      market_data: "Market Data",
    },
    sentiment: {
      positive: "↑ Positive",
      negative: "↓ Risk",
      neutral: "· Neutral",
    },
  },
};

const SOURCE_ICONS = {
  financial_report: "📄",
  news: "📰",
  knowledge: "📚",
  market_data: "📈",
};

const KG_ENTITY_TYPE_COLORS = {
  company: "#3b82f6",
  organization: "#3b82f6",
  person: "#8b5cf6",
  product: "#10b981",
  metric: "#ec4899",
  location: "#14b8a6",
  regulation: "#ef4444",
  technology: "#6366f1",
  event: "#f43f5e",
  source: "#e2b96f",
};

const KG_COMMUNITY_PALETTE = [
  "#7c5cff", "#22c5e5", "#f59e0b", "#10b981", "#ef4444",
  "#ec4899", "#0ea5e9", "#84cc16", "#a855f7", "#f97316",
];

const SOURCE_RELIABILITY_SCORE = { A: 100, B: 80, C: 60, D: 40, E: 20, F: 0 };
const INFO_CREDIBILITY_SCORE = { 1: 100, 2: 80, 3: 60, 4: 40, 5: 20, 6: 0 };

let locale = "en";
let lastResult = null;
let loadingTimer = null;
const HISTORY_LIMIT = 10;

// ── Persistent storage (schema v2 with one-time migration from legacy keys) ──
// Layout under `tracemind-storage` key:
//   { v: 2, updated_at: ISO, theme, locale, history: [...] }
// Migration sources (left untouched for backwards compat across tabs):
//   tracemind-theme            (string)
//   tracemind-research-history (JSON array)
const STORAGE_KEY = "tracemind-storage";
const STORAGE_VERSION = 2;
const LEGACY_THEME_KEY = "tracemind-theme";
const LEGACY_HISTORY_KEY = "tracemind-research-history";

const Storage = {
  _cache: null,
  _read() {
    if (this._cache) return this._cache;
    let parsed = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed !== "object" || parsed.v !== STORAGE_VERSION) {
      parsed = this._migrate(parsed);
    }
    this._cache = parsed;
    return parsed;
  },
  _migrate(prior) {
    const next = {
      v: STORAGE_VERSION,
      updated_at: new Date().toISOString(),
      theme: "violet",
      locale: "en",
      history: [],
    };
    if (prior && typeof prior === "object") {
      if (prior.theme) next.theme = prior.theme;
      if (prior.locale) next.locale = prior.locale;
      if (Array.isArray(prior.history)) next.history = prior.history;
    }
    try {
      const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
      if (legacyTheme && (!prior || !prior.theme)) next.theme = legacyTheme;
    } catch { /* noop */ }
    try {
      const legacyHist = localStorage.getItem(LEGACY_HISTORY_KEY);
      if (legacyHist && (!prior || !Array.isArray(prior.history) || !prior.history.length)) {
        const parsed = JSON.parse(legacyHist);
        if (Array.isArray(parsed)) next.history = parsed;
      }
    } catch { /* noop */ }
    next.history = (next.history || []).slice(0, HISTORY_LIMIT);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* quota — keep in-memory only */ }
    return next;
  },
  _persist() {
    if (!this._cache) return;
    this._cache.updated_at = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
    } catch (err) {
      if (this._cache.history?.length > 1) {
        this._cache.history = this._cache.history.slice(0, Math.ceil(this._cache.history.length / 2));
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache)); } catch { /* noop */ }
      }
    }
  },
  getTheme() { return this._read().theme || "violet"; },
  setTheme(v) {
    const s = this._read();
    s.theme = v;
    this._persist();
    try { localStorage.setItem(LEGACY_THEME_KEY, v); } catch { /* noop */ }
  },
  getLocale() { return this._read().locale || "zh"; },
  setLocale(v) {
    const s = this._read();
    s.locale = v;
    this._persist();
  },
  getHistory() {
    const list = this._read().history;
    return Array.isArray(list) ? list : [];
  },
  saveHistory(list) {
    const s = this._read();
    s.history = (Array.isArray(list) ? list : []).slice(0, HISTORY_LIMIT);
    this._persist();
    try { localStorage.setItem(LEGACY_HISTORY_KEY, JSON.stringify(s.history)); } catch { /* noop */ }
  },
  reset() {
    this._cache = null;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  },
};

let theme = Storage.getTheme();

// ── DOM refs ──────────────────────────────────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  company: $("#company"),
  question: $("#question"),
  runBtn: $("#run-btn"),
  clearBtn: $("#clear-btn"),
  reportBtn: $("#report-btn"),
  exportBtn: $("#export-btn"),
  pdfBtn: $("#pdf-btn"),
  shareBtn: $("#share-btn"),
  cancelBtn: $("#cancel-btn"),
  compareOpenBtn: $("#compare-open-btn"),
  pageTitle: $(".page-title"),
  modeBadge: $("#mode-badge"),
  modeText: $("#mode-text"),
  emptyState: $("#empty-state"),
  errorBanner: $("#error-banner"),
  loadingState: $("#loading-state"),
  results: $("#results"),
  metricSteps: $("#metric-steps .metric-val"),
  metricCitations: $("#metric-citations .metric-val"),
  metricSources: $("#metric-sources .metric-val"),
  metricAudit: $("#metric-audit .metric-val"),
  metricConfidence: $("#metric-confidence .metric-val"),
};

// ── i18n ──────────────────────────────────────────────────────────────────────
function t(key) {
  const parts = key.split(".");
  let val = I18N[locale];
  for (const p of parts) val = val?.[p];
  return val ?? key;
}

function applyI18n() {
  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val) el.textContent = val;
  });
  els.company.placeholder = t("default_company");
  els.question.placeholder = t("default_question");
  if (!els.company.value || els.company.dataset.auto === "1") {
    els.company.value = t("default_company");
    els.company.dataset.auto = "1";
  }
  if (!els.question.value || els.question.dataset.auto === "1") {
    els.question.value = t("default_question");
    els.question.dataset.auto = "1";
  }
  renderPageTitle();
}

function renderPageTitle() {
  if (els.pageTitle) {
    if (locale === "en") {
      els.pageTitle.innerHTML = `<span class="title-latin">TraceMind</span>`;
    } else {
      els.pageTitle.innerHTML = `<span class="title-cjk">研迹</span>`;
    }
  }
  const brandEl = document.getElementById("brand-name");
  if (brandEl) {
    brandEl.textContent = locale === "en" ? "TraceMind" : "研迹";
  }
}

// ── Config ────────────────────────────────────────────────────────────────────
async function loadConfig() {
  try {
    const res = await fetch("/api/config");
    const cfg = await res.json();
    els.modeBadge.className = "badge badge-live";
    els.modeText.textContent = cfg.mode === "live" ? t("mode_live") : t("mode_live");
  } catch {
    /* ignore */
  }
}

// ── Loading animation ─────────────────────────────────────────────────────────
function showError(input, tone = "error") {
  if (!els.errorBanner) return;
  const spec = typeof input === "string" ? { title: input, tone } : { tone, ...input };
  renderErrorCard(spec);
  els.errorBanner.classList.remove("hidden");
}

function clearError() {
  if (!els.errorBanner) return;
  els.errorBanner.innerHTML = "";
  delete els.errorBanner.dataset.tone;
  els.errorBanner.classList.add("hidden");
}

const ERROR_ICONS = {
  error: "⚠",
  warning: "⚠",
  info: "ℹ",
  offline: "⌀",
  timeout: "⏱",
  auth: "🔒",
  rate_limit: "⏳",
};

function renderErrorCard(spec) {
  const { tone = "error", icon, title, message, hint, actions = [] } = spec;
  const iconChar = icon || ERROR_ICONS[tone] || "⚠";
  els.errorBanner.dataset.tone = tone;
  const actionsHtml = actions.length
    ? `<div class="error-card-actions">
         ${actions
           .map(
             (a, idx) =>
               `<button type="button" class="error-card-btn ${a.primary ? "primary" : "secondary"}" data-error-action="${esc(a.id)}">${esc(a.label)}${a.icon ? ` <span aria-hidden="true">${esc(a.icon)}</span>` : ""}</button>`,
           )
           .join("")}
       </div>`
    : "";
  els.errorBanner.innerHTML = `
    <div class="error-card-body">
      <span class="error-card-icon" aria-hidden="true">${esc(iconChar)}</span>
      <div class="error-card-content">
        <div class="error-card-title">${esc(title || "")}</div>
        ${message ? `<div class="error-card-msg">${esc(message)}</div>` : ""}
        ${hint ? `<div class="error-card-hint">${esc(hint)}</div>` : ""}
        ${actionsHtml}
      </div>
      <button type="button" class="error-card-close" data-error-action="dismiss" aria-label="${esc(t("close_overlay"))}">✕</button>
    </div>`;

  els.errorBanner.querySelectorAll("[data-error-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.errorAction;
      handleErrorAction(action);
    });
  });
}

function handleErrorAction(action) {
  if (action === "dismiss") {
    clearError();
    return;
  }
  if (action === "retry") {
    clearError();
    runResearch();
    return;
  }
  if (action === "reload") {
    window.location.reload();
    return;
  }
  clearError();
}

function classifyFetchError(err, detail) {
  const text = (detail || err?.message || "").toString();
  const lower = text.toLowerCase();
  if (err?.name === "AbortError" || lower.includes("cancelled")) {
    return { type: "cancelled" };
  }
  if (!navigator.onLine || lower.includes("failed to fetch") || lower.includes("network")) {
    return { type: "offline" };
  }
  if (lower.includes("timeout") || err?.name === "TimeoutError") {
    return { type: "timeout" };
  }
  const statusMatch = text.match(/\b(4\d{2}|5\d{2})\b/);
  const status = statusMatch ? Number(statusMatch[1]) : null;
  if (status === 401 || status === 403) return { type: "auth", status, raw: text };
  if (status === 429) return { type: "rate_limit", status, raw: text };
  if (status === 502 || status === 503 || status === 504) {
    return { type: "api_unavailable", status, raw: text };
  }
  if (status === 400 || status === 422) return { type: "bad_request", status, raw: text };
  if (status && status >= 500) return { type: "server_error", status, raw: text };
  if (lower.includes("api key") || lower.includes("unauthorized")) {
    return { type: "auth", raw: text };
  }
  return { type: "generic", raw: text };
}

function formatFetchError(err, detail) {
  const cls = classifyFetchError(err, detail);
  const retryAction = {
    id: "retry",
    label: t("error_action_retry"),
    icon: "↻",
    primary: true,
  };
  switch (cls.type) {
    case "offline":
      return {
        tone: "warning",
        icon: "⌀",
        title: t("error_offline_title"),
        message: t("error_offline_message"),
        hint: t("error_offline_hint"),
        actions: [retryAction],
      };
    case "timeout":
      return {
        tone: "warning",
        icon: "⏱",
        title: t("error_timeout_title"),
        message: t("error_timeout_message"),
        actions: [retryAction],
      };
    case "auth":
      return {
        tone: "error",
        icon: "🔒",
        title: t("error_auth_title"),
        message: t("error_auth_message"),
        hint: t("error_auth_hint"),
        actions: [retryAction],
      };
    case "rate_limit":
      return {
        tone: "warning",
        icon: "⏳",
        title: t("error_rate_title"),
        message: t("error_rate_message"),
        actions: [retryAction],
      };
    case "api_unavailable":
      return {
        tone: "warning",
        title: t("error_unavailable_title"),
        message: t("error_unavailable_message"),
        actions: [retryAction],
      };
    case "bad_request":
      return {
        tone: "error",
        title: t("error_bad_request_title"),
        message: cls.raw || t("error_bad_request_message"),
        actions: [retryAction],
      };
    case "server_error":
      return {
        tone: "error",
        title: t("error_server_title"),
        message: cls.raw || t("error_server_message"),
        actions: [retryAction],
      };
    case "cancelled":
      return {
        tone: "info",
        title: t("research_cancelled"),
      };
    default:
      return {
        tone: "error",
        title: t("error_generic"),
        message: cls.raw,
        actions: [retryAction],
      };
  }
}

function appendThinkingLine(html, kind = "info") {
  const console = document.getElementById("thinking-console");
  if (!console) return null;
  const line = document.createElement("div");
  line.className = `thinking-line ${kind}`;
  line.innerHTML = html;
  console.appendChild(line);
  requestAnimationFrame(() => line.classList.add("in"));
  console.scrollTop = console.scrollHeight;
  while (console.children.length > 14) console.removeChild(console.firstChild);
  return line;
}

function setThinkingStatus(text) {
  const status = document.getElementById("thinking-status");
  if (status) status.textContent = text;
}

function setThinkingProgress(current, total) {
  const numEl = document.getElementById("thinking-step-num");
  const totalEl = document.getElementById("thinking-step-total");
  const fillEl = document.getElementById("thinking-bar-fill");
  if (numEl) numEl.textContent = current;
  if (totalEl) totalEl.textContent = total || "—";
  if (fillEl && total) fillEl.style.width = `${Math.min(100, (current / total) * 100)}%`;
}

function clearThinkingConsole() {
  const console = document.getElementById("thinking-console");
  if (console) console.innerHTML = "";
}

const THINKING_PLACEHOLDER_KEYS = [
  "thinking_planning",
  "thinking_searching",
  "thinking_calling",
  "thinking_observing",
  "thinking_auditing",
  "thinking_concluding",
];

function startLoading() {
  clearError();
  els.emptyState.classList.add("hidden");
  els.results.classList.add("hidden");
  els.loadingState.classList.remove("hidden");

  clearThinkingConsole();
  setThinkingProgress(0, null);
  setThinkingStatus(t("thinking_sub"));

  let idx = 0;
  const tick = () => {
    const key = THINKING_PLACEHOLDER_KEYS[idx % THINKING_PLACEHOLDER_KEYS.length];
    appendThinkingLine(`<span class="tl-dot"></span><span class="tl-text">${esc(t(key))}…</span>`, "pending");
    setThinkingStatus(t(key));
    idx++;
  };
  tick();
  loadingTimer = setInterval(tick, 850);
}

function stopLoading() {
  clearInterval(loadingTimer);
  els.loadingState.classList.add("hidden");
  clearThinkingConsole();
}

async function replayReasoning(result) {
  const steps = (result?.steps || []).filter((step) => step?.action || step?.thought);
  if (!steps.length) return;

  clearInterval(loadingTimer);
  clearThinkingConsole();
  setThinkingStatus(t("thinking_observing"));

  const total = steps.length + 2;
  const perStep = Math.max(280, Math.min(560, 2200 / total));

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    setThinkingProgress(i + 1, total);
    setThinkingStatus(`${t("thinking_calling")} · ${step.action || ""}`);
    const thought = (step.thought || "").slice(0, 110);
    const sources = (step.sources || []).slice(0, 3).map((s) => s.source_id).join(" · ");
    appendThinkingLine(
      `<span class="tl-step">#${String(step.step_number ?? i + 1).padStart(2, "0")}</span>
       <span class="tl-act">${esc(step.action || "tool")}</span>
       <span class="tl-text">${esc(thought)}</span>
       ${sources ? `<span class="tl-meta">${esc(sources)}</span>` : ""}`,
      "step",
    );
    await new Promise((r) => setTimeout(r, perStep));
  }

  setThinkingProgress(steps.length + 1, total);
  setThinkingStatus(t("thinking_auditing"));
  appendThinkingLine(`<span class="tl-dot ok"></span><span class="tl-text">${esc(t("thinking_auditing"))}</span>`, "audit");
  await new Promise((r) => setTimeout(r, 380));

  setThinkingProgress(total, total);
  setThinkingStatus(t("thinking_finalizing"));
  appendThinkingLine(`<span class="tl-dot ok"></span><span class="tl-text">${esc(t("thinking_finalizing"))}</span>`, "done");
  await new Promise((r) => setTimeout(r, 320));
}

// ── Metrics ───────────────────────────────────────────────────────────────────
function updateMetrics(result) {
  const steps = result?.steps?.length ?? 0;
  const citations = result?.citations?.length ?? 0;
  const sources = result?.all_sources?.length ?? 0;
  const auditScore = result?.protocol?.audit?.score;
  const confidence = result?.protocol?.confidence;

  els.metricSteps.textContent = steps || "—";
  els.metricCitations.textContent = citations || "—";
  els.metricSources.textContent = sources || "—";
  els.metricAudit.textContent = auditScore != null ? `${Math.round(auditScore * 100)}%` : "—";
  els.metricConfidence.textContent = confidence ? (t(`confidence.${confidence}`) ?? confidence) : "—";

  ["metric-steps", "metric-citations", "metric-sources", "metric-audit", "metric-confidence"].forEach((id, i) => {
    const el = document.getElementById(id);
    const val = [steps, citations, sources, auditScore, confidence][i];
    el.classList.toggle("has-data", val != null && val !== "" && val !== 0);
  });
}

// ── Hero Deck (Trust Score + Decision) ────────────────────────────────────────
const SOURCE_TIER_MAP = {
  financial_report: { key: "first_party", label_key: "source_tier_first_party", stars: 5, color: "#22c55e" },
  market_data: { key: "official", label_key: "source_tier_official", stars: 5, color: "#3b82f6" },
  knowledge: { key: "reference", label_key: "source_tier_reference", stars: 4, color: "#a78bfa" },
  news: { key: "secondary", label_key: "source_tier_secondary", stars: 3, color: "#f59e0b" },
};

function getSourceTier(sourceType) {
  return SOURCE_TIER_MAP[sourceType] || { key: "other", label_key: "source_tier_reference", stars: 3, color: "#9ca3af" };
}

function computeTrustScore(result) {
  const protocol = result?.protocol || {};
  const audit = protocol.audit || {};
  const faith = protocol.faithfulness || {};
  const risks = protocol.risk_signals || [];
  const sources = result?.all_sources || [];
  const auditScore = typeof audit.score === "number" ? audit.score : 0;
  const faithScore = typeof faith.score === "number" ? faith.score : 0;
  const groundedRatio = faith.total_claims ? (faith.grounded_claims || 0) / faith.total_claims : faithScore;
  const highRisks = risks.filter((r) => r.severity === "high").length;
  const mediumRisks = risks.filter((r) => r.severity === "medium").length;
  const officialSources = sources.filter((s) => ["financial_report", "market_data"].includes(s.source_type)).length;
  const sourceBreadth = Math.min(1, sources.length / 6);
  const officialRatio = sources.length ? officialSources / sources.length : 0;
  const sourceScore = Math.min(1, sourceBreadth * 0.55 + officialRatio * 0.45);
  const riskPenalty = Math.min(0.18, highRisks * 0.06 + mediumRisks * 0.025);
  const composite = (auditScore * 0.34 + faithScore * 0.28 + groundedRatio * 0.22 + sourceScore * 0.16) - riskPenalty;
  const score = Math.max(0, Math.min(1, composite));
  return Math.round(score * 100);
}

function getDataModeInfo(result) {
  const mode = result?.mode || "live";
  const cacheHit = Boolean(result?.cache_hit);
  const hasLiveSources = (result?.all_sources || []).some((s) =>
    ["financial_report", "market_data", "news"].includes(s.source_type)
      && !String(s.source_id || "").includes("demo-tech"),
  );
  if (cacheHit) return { key: "cache_hit", label: t("data_mode_cache_hit"), tone: "cache" };
  if (String(mode).includes("fallback")) return { key: "fallback", label: t("data_mode_fallback"), tone: "warn" };
  if (mode === "live" || hasLiveSources) return { key: "live", label: t("data_mode_live"), tone: "live" };
  return { key: "live", label: t("data_mode_live"), tone: "live" };
}

function getResultGeneratedAt(result) {
  const value = result?.generated_at || result?.created_at || new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US");
}

function classifyTrust(score) {
  if (score >= 85) return { level: "high", color: "#22c55e", verdictKey: "hero_verdict_high" };
  if (score >= 70) return { level: "mid", color: "#f59e0b", verdictKey: "hero_verdict_mid" };
  return { level: "low", color: "#ef4444", verdictKey: "hero_verdict_low" };
}

function renderHeroDeck(result) {
  const deck = document.getElementById("hero-deck");
  if (!deck) return;
  if (!result) {
    deck.innerHTML = "";
    deck.classList.add("hidden");
    return;
  }

  const protocol = result.protocol || {};
  const faith = protocol.faithfulness || {};
  const audit = protocol.audit || {};
  const risks = protocol.risk_signals || [];
  const decision = protocol.investment_decision;
  const sources = result.all_sources || [];

  const trustScore = computeTrustScore(result);
  const verdict = classifyTrust(trustScore);
  const dataMode = getDataModeInfo(result);
  const generatedAt = getResultGeneratedAt(result);

  const totalClaims = faith.total_claims || (result.citations?.length ?? 0);
  const groundedClaims = faith.grounded_claims || 0;
  const groundedPct = totalClaims ? Math.round((groundedClaims / totalClaims) * 100) : 0;
  const ungroundedCount = Math.max(0, totalClaims - groundedClaims);

  const tierCounts = sources.reduce((acc, s) => {
    const tier = getSourceTier(s.source_type).key;
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const officialCount = (tierCounts.first_party || 0) + (tierCounts.official || 0);
  const newsCount = tierCounts.secondary || 0;
  const refCount = tierCounts.reference || 0;

  const riskCounts = risks.reduce((acc, r) => {
    acc[r.severity] = (acc[r.severity] || 0) + 1;
    return acc;
  }, {});

  const hallucinationBadge = ungroundedCount === 0 && totalClaims > 0
    ? `<span class="hero-badge ok">${esc(t("hero_zero_hallucination"))}</span>`
    : ungroundedCount > 0
      ? `<span class="hero-badge warn">${ungroundedCount} ${esc(t("hero_n_review"))}</span>`
      : "";

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - trustScore / 100);

  const trustCard = `
    <div class="hero-card trust ${verdict.level}">
      <div class="hero-card-head">
        <div class="hero-eyebrow">${esc(t("hero_trust_label"))}</div>
        <div class="hero-card-caption">${esc(t("hero_trust_caption"))}</div>
      </div>
      <div class="hero-trust-main">
        <div class="trust-gauge">
          <svg viewBox="0 0 120 120" class="trust-gauge-svg">
            <circle cx="60" cy="60" r="${radius}" class="trust-gauge-track" />
            <circle cx="60" cy="60" r="${radius}" class="trust-gauge-fill"
              style="stroke:${verdict.color}; stroke-dasharray:${circumference.toFixed(2)}; stroke-dashoffset:${dashOffset.toFixed(2)};"
              transform="rotate(-90 60 60)" />
            <text x="60" y="58" text-anchor="middle" class="trust-gauge-score" style="fill:${verdict.color}">${trustScore}</text>
            <text x="60" y="78" text-anchor="middle" class="trust-gauge-out-of">/ 100</text>
          </svg>
        </div>
        <div class="hero-kpi-grid">
          <div class="hero-kpi">
            <div class="hero-kpi-val">${groundedPct}%</div>
            <div class="hero-kpi-lbl">${esc(t("hero_grounded"))}</div>
            <div class="hero-kpi-sub">${groundedClaims}/${totalClaims} ${esc(t("hero_grounded_sub"))}</div>
          </div>
          <div class="hero-kpi">
            <div class="hero-kpi-val">${sources.length}</div>
            <div class="hero-kpi-lbl">${esc(t("hero_sources"))}</div>
            <div class="hero-kpi-sub">${officialCount} / ${newsCount} / ${refCount}</div>
          </div>
          <div class="hero-kpi">
            <div class="hero-kpi-val">${risks.length}</div>
            <div class="hero-kpi-lbl">${esc(t("hero_risks"))}</div>
            <div class="hero-kpi-sub">${riskCounts.high || 0} / ${riskCounts.medium || 0} / ${riskCounts.low || 0}</div>
          </div>
        </div>
      </div>
      <div class="hero-card-foot">
        <div class="hero-verdict">${esc(t(verdict.verdictKey))}</div>
        <div class="hero-foot-actions">
          ${hallucinationBadge}
          <button type="button" class="hero-ghost-btn" data-action="open-baseline">${esc(t("hero_compare_btn"))} →</button>
        </div>
      </div>
    </div>`;

  const dataModeCard = `
    <div class="hero-data-mode ${dataMode.tone}">
      <span class="hero-data-pill">${esc(dataMode.label)}</span>
      <span>${esc(t("data_generated_at"))}: ${esc(generatedAt)}</span>
      <span>${esc(t("data_source_mix"))}: ${officialCount} ${esc(t("data_source_official"))} · ${newsCount} ${esc(t("data_source_news"))} · ${refCount} ${esc(t("data_source_reference"))}</span>
    </div>`;

  const decisionCard = decision
    ? renderDecisionHero(decision)
    : `<div class="hero-card decision empty"><div class="hero-eyebrow">${esc(t("hero_decision_label"))}</div><div class="hero-empty">${esc(t("no_data"))}</div></div>`;

  deck.innerHTML = `${dataModeCard}${trustCard}${decisionCard}`;
  deck.classList.remove("hidden");

  deck.querySelector('[data-action="open-baseline"]')?.addEventListener("click", () => {
    openBaselineCompare(result);
  });
}

// ── Mini data-viz strip (financials / risks / sources) ──────────────────────
const SEVERITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };
const SOURCE_TYPE_COLORS = {
  financial_report: "#22c55e",
  market_data: "#7c8cff",
  knowledge: "#a78bfa",
  news: "#f59e0b",
};

function renderVizStrip(result) {
  const strip = $("#viz-strip");
  if (!strip) return;
  if (!result) {
    strip.innerHTML = "";
    strip.classList.add("hidden");
    return;
  }
  const protocol = result.protocol || {};
  const cards = [
    buildFinancialCard(protocol.financial_metrics || []),
    buildRiskCard(protocol.risk_signals || []),
    buildSourcesCard(result.all_sources || []),
  ].filter(Boolean);

  if (!cards.length) {
    strip.innerHTML = "";
    strip.classList.add("hidden");
    return;
  }
  strip.innerHTML = cards.join("");
  strip.classList.remove("hidden");
}

function vizCard({ title, sub, body, accent }) {
  return `
    <div class="viz-card" style="--viz-accent:${accent || "var(--accent)"}">
      <div class="viz-card-head">
        <span class="viz-card-title">${esc(title)}</span>
        <span class="viz-card-sub">${esc(sub)}</span>
      </div>
      <div class="viz-card-body">${body}</div>
    </div>`;
}

function vizNoData() {
  return `<div class="viz-empty">${esc(t("viz_no_data"))}</div>`;
}

function buildFinancialCard(metrics) {
  const KEYS = ["revenue", "net_profit", "rd_expense"];
  const filtered = KEYS
    .map((k) => metrics.find((m) => m.metric_id === k))
    .filter((m) => m && Number.isFinite(Number(m.value)));
  if (!filtered.length) {
    return vizCard({
      title: t("viz_financials_title"),
      sub: t("viz_financials_sub"),
      body: vizNoData(),
      accent: "#22c55e",
    });
  }
  const maxVal = Math.max(...filtered.map((m) => Number(m.value)));
  const rows = filtered
    .map((m) => {
      const val = Number(m.value);
      const pct = maxVal > 0 ? Math.max(4, (val / maxVal) * 100) : 0;
      const label = t(`metric_${m.metric_id}`) || m.metric_id;
      const formatted = formatBigNumber(val, m.unit);
      return `
        <div class="viz-fin-row">
          <div class="viz-fin-label">${esc(label)}</div>
          <div class="viz-fin-bar-wrap">
            <div class="viz-fin-bar" style="width:${pct.toFixed(1)}%"></div>
          </div>
          <div class="viz-fin-val">${esc(formatted)}</div>
        </div>`;
    })
    .join("");
  return vizCard({
    title: t("viz_financials_title"),
    sub: t("viz_financials_sub"),
    body: `<div class="viz-fin-list">${rows}</div>`,
    accent: "#22c55e",
  });
}

function formatBigNumber(value, unit) {
  const abs = Math.abs(value);
  let scaled;
  let suffix;
  if (abs >= 1e12) {
    scaled = value / 1e12;
    suffix = locale === "zh" ? " 万亿" : "T";
  } else if (abs >= 1e9) {
    scaled = value / 1e9;
    suffix = locale === "zh" ? " 十亿" : "B";
  } else if (abs >= 1e8 && locale === "zh") {
    scaled = value / 1e8;
    suffix = " 亿";
  } else if (abs >= 1e6) {
    scaled = value / 1e6;
    suffix = locale === "zh" ? " 百万" : "M";
  } else {
    scaled = value;
    suffix = "";
  }
  const decimals = Math.abs(scaled) >= 100 ? 0 : 1;
  const unitLabel = unit && unit !== "CNY" && unit !== "USD" ? ` ${unit}` : "";
  return `${scaled.toFixed(decimals)}${suffix}${unitLabel}`;
}

function buildRiskCard(risks) {
  if (!risks.length) {
    return vizCard({
      title: t("viz_risks_title"),
      sub: t("viz_risks_sub"),
      body: `<div class="viz-risk-zero">
        <div class="viz-risk-zero-mark">✓</div>
        <div class="viz-risk-zero-text">${esc(locale === "zh" ? "未检出风险信号" : "No risk signals detected")}</div>
      </div>`,
      accent: "#22c55e",
    });
  }
  const counts = { high: 0, medium: 0, low: 0 };
  risks.forEach((r) => {
    const sev = (r.severity || "medium").toLowerCase();
    if (counts[sev] != null) counts[sev]++;
    else counts.medium++;
  });
  const total = counts.high + counts.medium + counts.low;
  const order = ["high", "medium", "low"];
  const segments = order
    .map((sev) => {
      const count = counts[sev];
      if (!count) return null;
      const pct = (count / total) * 100;
      return { sev, count, pct };
    })
    .filter(Boolean);

  const stack = segments
    .map((s) => `<div class="viz-risk-seg ${s.sev}" style="flex:${s.pct}" title="${esc(t(`severity_${s.sev}`))}: ${s.count}"></div>`)
    .join("");

  const legend = order
    .map((sev) => `
      <div class="viz-risk-legend-item ${sev}">
        <span class="viz-risk-dot" style="background:${SEVERITY_COLORS[sev]}"></span>
        <span class="viz-risk-legend-label">${esc(t(`severity_${sev}`))}</span>
        <span class="viz-risk-legend-count">${counts[sev]}</span>
      </div>`)
    .join("");

  const accent = counts.high > 0 ? "#ef4444" : counts.medium > 0 ? "#f59e0b" : "#22c55e";
  return vizCard({
    title: t("viz_risks_title"),
    sub: t("viz_risks_sub"),
    body: `
      <div class="viz-risk-total">
        <span class="viz-risk-total-num">${total}</span>
        <span class="viz-risk-total-lbl">${esc(locale === "zh" ? "信号" : "signals")}</span>
      </div>
      <div class="viz-risk-stack">${stack}</div>
      <div class="viz-risk-legend">${legend}</div>`,
    accent,
  });
}

function buildSourcesCard(sources) {
  if (!sources.length) {
    return vizCard({
      title: t("viz_sources_title"),
      sub: t("viz_sources_sub"),
      body: vizNoData(),
      accent: "#7c8cff",
    });
  }
  const counts = {};
  sources.forEach((s) => {
    const type = s.source_type || "knowledge";
    counts[type] = (counts[type] || 0) + 1;
  });
  const total = sources.length;
  const order = ["financial_report", "market_data", "news", "knowledge"];
  const segments = order
    .filter((type) => counts[type])
    .map((type) => ({
      type,
      count: counts[type],
      pct: counts[type] / total,
      color: SOURCE_TYPE_COLORS[type],
      label: t(`source_type_${type}`) || type,
    }));

  const size = 100;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 38;
  const inner = 24;
  let acc = -Math.PI / 2;
  const arcs = segments
    .map((s) => {
      if (s.pct >= 0.9999) {
        return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${s.color}" />`;
      }
      const start = acc;
      const end = acc + s.pct * 2 * Math.PI;
      acc = end;
      const x1 = cx + radius * Math.cos(start);
      const y1 = cy + radius * Math.sin(start);
      const x2 = cx + radius * Math.cos(end);
      const y2 = cy + radius * Math.sin(end);
      const xi1 = cx + inner * Math.cos(end);
      const yi1 = cy + inner * Math.sin(end);
      const xi2 = cx + inner * Math.cos(start);
      const yi2 = cy + inner * Math.sin(start);
      const large = s.pct > 0.5 ? 1 : 0;
      return `<path d="M${x1.toFixed(2)},${y1.toFixed(2)} A${radius},${radius} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} L${xi1.toFixed(2)},${yi1.toFixed(2)} A${inner},${inner} 0 ${large} 0 ${xi2.toFixed(2)},${yi2.toFixed(2)} Z" fill="${s.color}" />`;
    })
    .join("");

  const legend = segments
    .map((s) => `
      <div class="viz-src-legend-item">
        <span class="viz-src-dot" style="background:${s.color}"></span>
        <span class="viz-src-label">${esc(s.label)}</span>
        <span class="viz-src-count">${s.count}</span>
      </div>`)
    .join("");

  return vizCard({
    title: t("viz_sources_title"),
    sub: t("viz_sources_sub"),
    body: `
      <div class="viz-src-row">
        <div class="viz-src-donut">
          <svg viewBox="0 0 ${size} ${size}" class="viz-src-donut-svg">
            ${arcs}
            <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="viz-src-donut-num">${total}</text>
            <text x="${cx}" y="${cy + 11}" text-anchor="middle" class="viz-src-donut-lbl">${esc(locale === "zh" ? "来源" : "sources")}</text>
          </svg>
        </div>
        <div class="viz-src-legend">${legend}</div>
      </div>`,
    accent: "#7c8cff",
  });
}

function renderDecisionHero(decision) {
  const rating = decision.rating || "watch";
  const ratingLabel = t(`decision_rating.${rating}`) ?? rating;
  const ratingIcon = rating === "positive" ? "▲" : rating === "cautious" ? "▼" : "●";
  const confidenceLabel = decision.confidence ? (t(`confidence.${decision.confidence}`) ?? decision.confidence) : "—";
  const confidencePct = decision.confidence === "high" ? 90 : decision.confidence === "medium" ? 65 : 40;
  const rationale = (decision.rationale || "").slice(0, 220);
  const monitor = (decision.monitoring_indicators || []).slice(0, 4);
  const sourceIds = decision.source_ids || [];

  return `
    <div class="hero-card decision ${rating}">
      <div class="hero-card-head">
        <div class="hero-eyebrow">${esc(t("hero_decision_label"))}</div>
        <div class="decision-confidence">
          <span class="confidence-label">${esc(confidenceLabel)}</span>
          <span class="confidence-bar"><span class="confidence-bar-fill" style="width:${confidencePct}%"></span></span>
        </div>
      </div>
      <div class="hero-decision-main">
        <div class="hero-rating-badge ${rating}">
          <span class="rating-icon">${ratingIcon}</span>
          <span class="rating-text">${esc(ratingLabel)}</span>
        </div>
        <div class="hero-decision-body">
          <div class="hero-decision-rationale">${esc(rationale)}</div>
          ${monitor.length ? `<div class="hero-decision-monitor">
            <span class="hero-monitor-label">${esc(t("hero_decision_monitor"))}:</span>
            ${monitor.map((m) => `<span class="hero-monitor-chip">${esc(m)}</span>`).join("")}
          </div>` : ""}
        </div>
      </div>
      <div class="hero-card-foot">
        <div class="hero-decision-sources">
          ${sourceIds.slice(0, 5).map((id) => `<span class="tag">${esc(id)}</span>`).join("")}
        </div>
      </div>
    </div>`;
}

// ── Baseline LLM Comparison ───────────────────────────────────────────────────
function openBaselineCompare(result) {
  let overlay = document.getElementById("baseline-overlay");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "baseline-overlay";
  overlay.className = "baseline-overlay";
  overlay.innerHTML = renderBaselineCompare(result);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('[data-action="close-baseline"]')?.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", function onKey(e) {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", onKey);
    }
  });
}

function buildNaiveLLMAnswer(result) {
  const company = result.company || t("company");
  const question = result.question || "";
  const protocol = result.protocol || {};
  const decision = protocol.investment_decision;
  const isZh = locale === "zh";

  const ratingText = decision?.rating === "positive"
    ? (isZh ? "整体偏向乐观" : "broadly optimistic")
    : decision?.rating === "cautious"
      ? (isZh ? "整体偏向谨慎" : "broadly cautious")
      : (isZh ? "建议观望" : "wait-and-see");

  return isZh
    ? `针对"${company}"以及问题「${question}」，结合公开市场印象，公司近年表现较为稳健，营收规模与盈利能力处于行业前列，核心业务护城河比较扎实。从估值角度看当前价格基本反映了市场预期。建议关注未来几个季度的业绩兑现情况以及行业景气度变化。综合来看，本次判断${ratingText}，可适度配置但需注意潜在波动风险。`
    : `Regarding "${company}" and the question "${question}", based on general market impression, the company has shown stable performance in recent years with industry-leading revenue and profitability, and a solid core business moat. Current valuation broadly reflects market expectations. Investors should monitor quarterly earnings delivery and sector cyclicality. Overall, the view is ${ratingText}; moderate allocation is acceptable but watch for potential volatility risks.`;
}

function renderBaselineCompare(result) {
  const naive = buildNaiveLLMAnswer(result);
  const tracemindText = result.conclusion || "";
  const protocol = result.protocol || {};
  const faith = protocol.faithfulness || {};
  const audit = protocol.audit || {};
  const totalClaims = faith.total_claims || (result.citations?.length ?? 0);
  const groundedClaims = faith.grounded_claims || 0;
  const groundedPct = totalClaims ? Math.round((groundedClaims / totalClaims) * 100) : 0;
  const auditPct = typeof audit.score === "number" ? Math.round(audit.score * 100) : 0;
  const naiveAttrs = t("baseline_naive_attrs") || [];
  const tmAttrs = t("baseline_tracemind_attrs") || [];

  const citationChips = (result.citations || [])
    .slice(0, 8)
    .map((c, i) => `<span class="tm-chip">${i + 1}. ${esc((c.claim || "").slice(0, 28))}${(c.claim || "").length > 28 ? "…" : ""} <span class="tm-chip-src">${(c.source_ids || []).slice(0, 2).join(", ")}</span></span>`)
    .join("");

  return `
    <div class="baseline-modal">
      <div class="baseline-head">
        <div>
          <div class="baseline-title">${esc(t("baseline_title"))}</div>
          <div class="baseline-sub">${esc(t("baseline_subtitle"))}</div>
        </div>
        <button type="button" class="hero-ghost-btn" data-action="close-baseline">✕ ${esc(t("hero_compare_close"))}</button>
      </div>
      <div class="baseline-question">
        <span class="baseline-q-label">${esc(t("chain_question"))}:</span>
        <span class="baseline-q-text">${esc(result.question || "")}</span>
      </div>
      <div class="baseline-grid">
        <div class="baseline-col naive">
          <div class="baseline-col-head">
            <span class="baseline-col-tag warn">⚠ Vanilla</span>
            <span class="baseline-col-title">${esc(t("baseline_naive_title"))}</span>
          </div>
          <div class="baseline-warning">${esc(t("baseline_naive_warning"))}</div>
          <div class="baseline-text muted">${esc(naive)}</div>
          <div class="baseline-attrs">
            ${naiveAttrs.map((a) => `<div class="baseline-attr bad">✕ ${esc(a)}</div>`).join("")}
          </div>
        </div>
        <div class="baseline-col tracemind">
          <div class="baseline-col-head">
            <span class="baseline-col-tag ok">✓ TraceMind</span>
            <span class="baseline-col-title">${esc(t("baseline_tracemind_title"))}</span>
          </div>
          <div class="baseline-metrics">
            <div><strong>${groundedPct}%</strong><span>${esc(t("hero_grounded"))}</span></div>
            <div><strong>${auditPct}%</strong><span>${esc(t("metric_audit"))}</span></div>
            <div><strong>${result.all_sources?.length || 0}</strong><span>${esc(t("metric_sources"))}</span></div>
          </div>
          <div class="baseline-text">${esc(tracemindText.slice(0, 800))}${tracemindText.length > 800 ? "…" : ""}</div>
          ${citationChips ? `<div class="baseline-citations"><div class="baseline-citations-label">${esc(t("chain_claims"))} (top ${Math.min(8, (result.citations || []).length)})</div><div class="tm-chips">${citationChips}</div></div>` : ""}
          <div class="baseline-attrs">
            ${tmAttrs.map((a) => `<div class="baseline-attr ok">✓ ${esc(a)}</div>`).join("")}
          </div>
        </div>
      </div>
    </div>`;
}

// ── Render panels ─────────────────────────────────────────────────────────────
function renderConclusion(result) {
  const panel = $("#panel-conclusion");
  const text = result.conclusion || "";
  const words = text.replace(/\s+/g, "").length;
  const isLong = text.length > 1200;
  const protocol = result.protocol || {};
  const audit = protocol.audit || {};
  const faith = protocol.faithfulness || {};
  const claimDetails = faith.claim_details || [];
  const confidence = protocol.confidence;
  const citations = result.citations || [];

  const claimsBar = citations.length
    ? `
      <div class="conclusion-claims">
        <div class="conclusion-claims-head">
          <span class="conclusion-claims-title">${esc(locale === "zh" ? "逐条接地核查" : "Per-claim grounding check")}</span>
          <span class="conclusion-claims-meta">${faith.grounded_claims || 0}/${faith.total_claims || citations.length} ${esc(t("grounded"))}</span>
        </div>
        <div class="conclusion-claims-list">
          ${citations
            .map((cite, i) => {
              const detail = claimDetails.find((item) => item.claim === cite.claim);
              const grounded = detail ? detail.grounded : true;
              const reason = detail?.reason || "";
              return `
                <div class="conclusion-claim ${grounded ? "ok" : "bad"}">
                  <span class="conclusion-claim-badge">${grounded ? "✓" : "✗"}</span>
                  <span class="conclusion-claim-num">${String(i + 1).padStart(2, "0")}</span>
                  <span class="conclusion-claim-text">${esc(formatDisplayText(cite.claim))}</span>
                  <span class="conclusion-claim-sources">${(cite.source_ids || []).slice(0, 4).map((id) => `<span class="tag">${esc(id)}</span>`).join("")}</span>
                  ${reason ? `<span class="conclusion-claim-reason">${esc(reason)}</span>` : ""}
                </div>`;
            })
            .join("")}
        </div>
      </div>`
    : "";

  panel.innerHTML = `
    <div class="conclusion-wrap">
      <div class="conclusion-card">
        <div class="conclusion-header">
          <div class="conclusion-label">${esc(t("conclusion_label"))}</div>
          <div class="conclusion-meta">
            <span class="meta-chip" title="${esc(result.company || "")}">${esc(companyDisplayName(result))}</span>
            ${confidence ? `<span class="meta-chip conf-${confidence}">${esc(t(`confidence.${confidence}`))}</span>` : ""}
            ${audit.passed != null ? `<span class="meta-chip ${audit.passed ? "audit-pass" : "audit-fail"}">${esc(audit.passed ? t("audit_pass") : t("audit_fail"))}</span>` : ""}
            <span class="meta-chip muted">${words} ${locale === "zh" ? "字" : "chars"}</span>
          </div>
        </div>
        <div class="conclusion-body${isLong ? " collapsed" : ""}" id="conclusion-body">
          <div class="prose">${renderMarkdown(text)}</div>
        </div>
        ${isLong ? `<button class="expand-btn" id="expand-conclusion" type="button">${locale === "zh" ? "展开全文" : "Show full report"}</button>` : ""}
        ${claimsBar}
      </div>
    </div>`;

  const expandBtn = $("#expand-conclusion");
  const body = $("#conclusion-body");
  if (expandBtn && body) {
    expandBtn.addEventListener("click", () => {
      const collapsed = body.classList.toggle("collapsed");
      expandBtn.textContent = collapsed
        ? (locale === "zh" ? "展开全文" : "Show full report")
        : (locale === "zh" ? "收起" : "Collapse");
    });
  }
}

function renderResultsList(result) {
  const panel = $("#panel-results-list");
  const protocol = result.protocol || {};
  const decision = protocol.investment_decision;
  const faith = protocol.faithfulness || {};
  const risks = protocol.risk_signals || [];
  const metrics = protocol.financial_metrics || [];
  const claimDetails = faith.claim_details || [];

  const items = [];
  if (decision) {
    items.push({
      type: t("result_type_decision"),
      title: t(`decision_rating.${decision.rating}`) ?? decision.rating,
      body: decision.rationale,
      status: t(`confidence.${decision.confidence}`) ?? decision.confidence,
      tags: decision.source_ids || [],
      tone: decision.rating === "positive" ? "positive" : decision.rating === "watch" ? "watch" : "negative",
    });
  }

  (result.citations || []).forEach((citation) => {
    const detail = claimDetails.find((item) => item.claim === citation.claim);
    items.push({
      type: t("result_type_claim"),
      title: citation.claim,
      body: detail?.reason || "",
      status: detail?.grounded ? t("result_status_grounded") : t("ungrounded"),
      tags: citation.source_ids,
      tone: detail?.grounded ? "positive" : "negative",
    });
  });

  risks.forEach((risk) => {
    items.push({
      type: t("result_type_risk"),
      title: t(`risk_signal.${risk.risk_id}`) ?? risk.risk_id,
      body: `${t(`risk_severity.${risk.severity}`) ?? risk.severity} · ${Math.round((risk.score || 0) * 100)}%`,
      status: t("result_status_watch"),
      tags: risk.source_ids || [],
      tone: risk.severity === "high" ? "negative" : "watch",
    });
  });

  metrics
    .filter((metric) => ["net_margin", "rd_expense_ratio", "debt_to_asset_ratio"].includes(metric.metric_id))
    .forEach((metric) => {
      items.push({
        type: t("result_type_metric"),
        title: t(`financial_metric.${metric.metric_id}`) ?? metric.metric_id,
        body: metric.unit === "percent" ? `${metric.value}%` : formatCompactNumber(metric.value, metric.unit),
        status: metric.formula || metric.source_id,
        tags: [metric.source_id],
        tone: "neutral",
      });
    });

  if (!items.length) {
    panel.innerHTML = `<p class="muted-text">${esc(t("no_data"))}</p>`;
    return;
  }

  panel.innerHTML = `
    <div class="result-list-wrap">
      <div class="chain-section-label">${esc(t("result_list_title"))}</div>
      <div class="result-list">${items
        .map(
          (item, i) => `
        <article class="result-item ${item.tone}">
          <div class="result-index">${String(i + 1).padStart(2, "0")}</div>
          <div class="result-main">
            <div class="result-head">
              <span class="result-type">${esc(item.type)}</span>
              <span class="result-status">${esc(item.status || "")}</span>
            </div>
            <div class="result-title">${esc(item.title)}</div>
            ${item.body ? `<div class="result-body">${esc(item.body)}</div>` : ""}
            <div class="chain-tags">${(item.tags || []).map((id) => `<span class="tag">${esc(id)}</span>`).join("")}</div>
          </div>
        </article>`,
        )
        .join("")}</div>
    </div>`;
}

function renderEvidenceChain(result) {
  const panel = $("#panel-evidence-chain");
  const protocol = result.protocol || {};
  const audit = protocol.audit || {};
  const faith = protocol.faithfulness || {};
  const evidence = protocol.evidence_items || [];
  const metrics = protocol.financial_metrics || [];
  const risks = protocol.risk_signals || [];
  const sourceById = Object.fromEntries((result.all_sources || []).map((src) => [src.source_id, src]));

  if (!result.steps?.length && !evidence.length) {
    panel.innerHTML = `<p class="muted-text">${esc(t("no_data"))}</p>`;
    return;
  }

  const stepHtml = (result.steps || [])
    .map(
      (step) => `
    <div class="chain-step-card">
      <div class="chain-step-kicker">${esc(t("chain_step"))} ${step.step_number}</div>
      <div class="chain-step-title">${esc(step.action)}</div>
      <div class="chain-step-body">${esc(step.thought)}</div>
      <div class="chain-step-sources">${(step.sources || [])
        .map((src) => `<span class="tag">${esc(src.source_id)}</span>`)
        .join("")}</div>
    </div>`,
    )
    .join("");

  const claimHtml = (result.citations || [])
    .map((cite, i) => {
      const detail = (faith.claim_details || []).find((item) => item.claim === cite.claim);
      const status = detail?.grounded ? t("grounded") : t("ungrounded");
      const statusClass = detail?.grounded ? "ok" : "bad";
      return `
    <div class="chain-claim">
      <div class="chain-claim-num">${i + 1}</div>
      <div>
        <div class="chain-claim-text">${esc(formatDisplayText(cite.claim))}</div>
        <div class="chain-tags">${cite.source_ids.map((id) => `<span class="tag">${esc(id)}</span>`).join("")}</div>
      </div>
      <span class="chain-status ${statusClass}">${esc(status)}</span>
    </div>`;
    })
    .join("");

  const sourceIds = [...new Set(evidence.map((item) => item.source_id))];
  const sourceHtml = sourceIds
    .map((id) => {
      const item = evidence.find((e) => e.source_id === id) || {};
      const source = sourceById[id] || {};
      const typeLabel = source.source_type ? t(`source_type.${source.source_type}`) : "";
      return `
    <div class="chain-source">
      <div class="chain-source-top">
        <span class="tag">${esc(id)}</span>
        ${typeLabel ? `<span class="chain-source-type">${esc(typeLabel)}</span>` : ""}
        <span class="chain-rating">${esc(t("chain_source_rating"))}: ${esc(item.source_reliability || "—")}/${esc(item.info_credibility || "—")}</span>
      </div>
      <div class="chain-source-title">${esc(source.title || "")}</div>
      <div class="chain-source-excerpt">${esc((source.excerpt || item.excerpt || "").slice(0, 220))}</div>
    </div>`;
    })
    .join("");

  const metricHtml = metrics
    .map((metric) => {
      const label = t(`financial_metric.${metric.metric_id}`) ?? metric.metric_id;
      const value = metric.unit === "percent" ? `${metric.value}%` : formatCompactNumber(metric.value, metric.unit);
      return `
    <div class="chain-metric">
      <div class="chain-metric-label">${esc(label)}</div>
      <div class="chain-metric-value">${esc(value)}</div>
      ${metric.formula ? `<div class="chain-metric-formula">${esc(metric.formula)}</div>` : ""}
      <span class="tag">${esc(metric.source_id)}</span>
    </div>`;
    })
    .join("");

  const riskHtml = risks
    .map((risk) => {
      const label = t(`risk_signal.${risk.risk_id}`) ?? risk.risk_id;
      const severity = t(`risk_severity.${risk.severity}`) ?? risk.severity;
      return `
    <div class="risk-row">
      <div class="risk-top">
        <span class="risk-name">${esc(label)}</span>
        <span class="risk-severity ${risk.severity}">${esc(severity)}</span>
        <span class="risk-score">${Math.round((risk.score || 0) * 100)}%</span>
      </div>
      <div class="risk-bar"><span style="width:${Math.round((risk.score || 0) * 100)}%"></span></div>
      <div class="chain-tags">${(risk.source_ids || []).map((id) => `<span class="tag">${esc(id)}</span>`).join("")}</div>
    </div>`;
    })
    .join("");

  panel.innerHTML = `
    <div class="chain-layout">
      ${
        result.warning
          ? `<div class="chain-warning">${esc(t("warning_prefix"))}: ${esc(result.warning)}</div>`
          : ""
      }
      <section class="chain-hero">
        <div class="chain-section-label">${esc(t("chain_question"))}</div>
        <div class="chain-question">${esc(result.question || "")}</div>
        <div class="chain-section-label">${esc(t("chain_answer"))}</div>
        <div class="chain-answer">${renderMarkdown(result.conclusion || "")}</div>
      </section>

      <section class="chain-quality">
        <div class="chain-quality-card ${audit.passed ? "pass" : "fail"}">
          <div class="chain-quality-num">${audit.score != null ? Math.round(audit.score * 100) : "—"}%</div>
          <div>${esc(t("tab_audit"))}</div>
        </div>
        <div class="chain-quality-card ${faith.passed ? "pass" : "fail"}">
          <div class="chain-quality-num">${faith.score != null ? Math.round(faith.score * 100) : "—"}%</div>
          <div>${esc(t("faithfulness"))}</div>
        </div>
        <div class="chain-quality-card">
          <div class="chain-quality-num">${esc(t(`confidence.${protocol.confidence}`) ?? "—")}</div>
          <div>${esc(t("metric_confidence"))}</div>
        </div>
      </section>

      <section>
        <div class="chain-section-label">${esc(t("chain_trace"))}</div>
        <div class="chain-step-grid">${stepHtml}</div>
      </section>

      <section>
        <div class="chain-section-label">${esc(t("chain_financials"))}</div>
        <div class="chain-metric-grid">${metricHtml || `<p class="muted-text">${esc(t("no_data"))}</p>`}</div>
      </section>

      <section>
        <div class="chain-section-label">${esc(t("chain_risks"))}</div>
        <div class="risk-list">${riskHtml || `<p class="muted-text">${esc(t("no_data"))}</p>`}</div>
      </section>

      <section>
        <div class="chain-section-label">${esc(t("chain_claims"))}</div>
        <div class="chain-claims">${claimHtml || `<p class="muted-text">${esc(t("no_data"))}</p>`}</div>
      </section>

      <section>
        <div class="chain-section-label">${esc(t("chain_sources"))}</div>
        <div class="chain-sources">${sourceHtml || `<p class="muted-text">${esc(t("no_data"))}</p>`}</div>
      </section>
    </div>`;
}

function renderDecision(result) {
  const panel = $("#panel-decision");
  const protocol = result.protocol || {};
  const decision = protocol.investment_decision;
  const benchmarks = protocol.industry_benchmarks || [];

  if (!decision && !benchmarks.length) {
    panel.innerHTML = `<p class="muted-text">${esc(t("no_data"))}</p>`;
    return;
  }

  const decisionHtml = decision
    ? `
    <section class="decision-card ${decision.rating}">
      <div class="decision-top">
        <div>
          <div class="chain-section-label">${esc(t("decision_title"))}</div>
          <div class="decision-rating">${esc(t(`decision_rating.${decision.rating}`) ?? decision.rating)}</div>
        </div>
        <span class="meta-chip conf-${decision.confidence}">${esc(t(`confidence.${decision.confidence}`) ?? decision.confidence)}</span>
      </div>
      <div class="decision-rationale">
        <div class="decision-label">${esc(t("decision_rationale"))}</div>
        ${esc(decision.rationale)}
      </div>
      <div class="decision-label">${esc(t("decision_monitoring"))}</div>
      <div class="monitor-list">${(decision.monitoring_indicators || []).map((item) => `<span>${esc(item)}</span>`).join("")}</div>
      <div class="chain-tags">${(decision.source_ids || []).map((id) => `<span class="tag">${esc(id)}</span>`).join("")}</div>
    </section>`
    : "";

  const benchmarkRows = benchmarks
    .map(
      (item) => `
    <tr class="${item.company_id === "target" ? "target" : ""}">
      <td>${esc(item.name)}</td>
      <td>${esc(item.revenue_billion)}</td>
      <td>${esc(item.net_margin)}%</td>
      <td>${esc(item.rd_ratio)}%</td>
      <td>${esc(item.debt_to_asset_ratio)}%</td>
      <td>${esc(item.note || "")}</td>
    </tr>`,
    )
    .join("");

  panel.innerHTML = `
    <div class="decision-layout">
      ${decisionHtml}
      <section class="benchmark-card">
        <div class="chain-section-label">${esc(t("benchmark_title"))}</div>
        <div class="benchmark-scroll">
          <table class="benchmark-table">
            <thead>
              <tr>
                <th>${esc(t("company"))}</th>
                <th>${esc(t("benchmark_revenue"))}</th>
                <th>${esc(t("benchmark_margin"))}</th>
                <th>${esc(t("benchmark_rd"))}</th>
                <th>${esc(t("benchmark_debt"))}</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>${benchmarkRows}</tbody>
          </table>
        </div>
      </section>
    </div>`;
}

function renderSandtable(result) {
  const panel = $("#panel-sandtable");
  if (!panel) return;
  const simulation = buildSandtableSimulation(result);
  const actionClass = simulation.action === "buy" ? "positive" : simulation.action === "cautious" ? "negative" : "watch";
  const companyFull = result.company || "";
  const companyLabel = compactSandboxLabel(companyFull, 22);
  const actionLabelShort = clampDisplayText(simulation.actionLabel, 28);

  panel.innerHTML = `
    <section class="sandtable-card ${actionClass}">
      <div class="sandtable-head">
        <div>
          <div class="chain-section-label">${esc(t("sandtable_title"))}</div>
          <div class="sandtable-sub">${esc(t("sandtable_subtitle"))}</div>
        </div>
        <div class="sandtable-score">
          <strong>${simulation.confidence}</strong>
          <span>${esc(t("sandtable_metric_score"))}</span>
        </div>
      </div>
      <div class="sandtable-stage">
        <div class="sandtable-center" title="${esc(companyFull)}">
          <div class="sandtable-company">${esc(companyLabel)}</div>
          <div class="sandtable-action">${esc(actionLabelShort)}</div>
        </div>
        ${simulation.agents.map((agent, idx) => `
          <article class="sand-agent agent-${idx + 1} ${agent.bias}" title="${esc([agent.name, agent.role, agent.stance].filter(Boolean).join(" · "))}">
            <div class="sand-agent-avatar">${esc(agent.avatar)}</div>
            <div class="sand-agent-name">${esc(agent.name)}</div>
            <div class="sand-agent-role">${esc(agent.role)}</div>
            <div class="sand-agent-stance">${esc(formatDisplayText(agent.stance))}</div>
          </article>
        `).join("")}
        ${simulation.edges.map((edge) => `<span class="sand-edge ${edge}"></span>`).join("")}
      </div>
      <div class="sandtable-rounds">
        ${simulation.rounds.map((round) => `
          <article class="sand-round">
            <div class="sand-round-title">${esc(round.title)}</div>
            <div class="sand-round-body">${esc(formatDisplayText(round.body))}</div>
            ${round.events?.length ? `
              <div class="sand-events">
                ${round.events.map((event) => `
                  <div class="sand-event">
                    <span>${esc(event.agentName)}</span>
                    <strong>${esc(event.title)}</strong>
                    <em>${esc(formatDisplayText(event.content))}</em>
                  </div>
                `).join("")}
              </div>` : ""}
            <div class="chain-tags">${round.sourceIds.map((id) => `<span class="tag">${esc(id)}</span>`).join("")}</div>
          </article>
        `).join("")}
      </div>
      <div class="sandtable-final">
        <div class="chain-section-label">${esc(t("sandtable_final_decision"))}</div>
        <div class="sandtable-final-text">${esc(formatDisplayText(simulation.conclusion))}</div>
        <div class="sandtable-next">${simulation.nextActions.map((item) => `<span>${esc(item)}</span>`).join("")}</div>
      </div>
    </section>`;
}

function buildSandtableSimulation(result) {
  const protocol = result.protocol || {};
  const backendSimulation = protocol.sandtable_simulation;
  if (backendSimulation) {
    const agentNameById = new Map((backendSimulation.agents || []).map((agent) => [agent.agent_id, agent.name]));
    return {
      action: backendSimulation.action || "watch",
      actionLabel: backendSimulation.action_label || t("sandtable_action_watch"),
      confidence: `${backendSimulation.confidence_score ?? 70}%`,
      agents: (backendSimulation.agents || []).map((agent, idx) => ({
        avatar: sandtableAvatar(agent.agent_id, idx),
        name: clampDisplayText(agent.name, 32),
        role: clampDisplayText(agent.role || agent.objective || "", 86),
        bias: agent.bias || "watch",
        stance: clampDisplayText(agent.stance || agent.objective || "", 96),
        sourceIds: agent.source_ids || [],
      })),
      edges: ["e1", "e2", "e3", "e4", "e5", "e6"],
      rounds: (backendSimulation.rounds || []).map((round) => ({
        title: clampDisplayText(round.title, 64),
        body: clampDisplayText(round.summary || "", 180),
        sourceIds: round.source_ids || [],
        events: (round.events || []).map((event) => ({
          agentName: clampDisplayText(agentNameById.get(event.agent_id) || event.agent_id || "", 32),
          title: clampDisplayText(event.title || event.action_type || "", 64),
          content: clampDisplayText(event.content || "", 120),
          impactScore: event.impact_score,
        })),
      })),
      conclusion: clampDisplayText(backendSimulation.conclusion || "", 260),
      nextActions: (backendSimulation.next_actions || []).map((item) => clampDisplayText(item, 64)),
    };
  }
  const decision = protocol.investment_decision || {};
  const metrics = protocol.financial_metrics || [];
  const risks = protocol.risk_signals || [];
  const hypotheses = protocol.competing_hypotheses || [];
  const citations = result.citations || [];
  const metricById = new Map(metrics.map((m) => [m.metric_id, m]));
  const netMargin = Number(metricById.get("net_margin")?.value ?? 0);
  const rdRatio = Number(metricById.get("rd_expense_ratio")?.value ?? 0);
  const debtRatio = Number(metricById.get("debt_to_asset_ratio")?.value ?? 0);
  const highRisks = risks.filter((r) => r.severity === "high");
  const riskScore = risks.reduce((sum, r) => sum + Number(r.score || 0), 0) / Math.max(1, risks.length);
  const rating = decision.rating || (highRisks.length ? "cautious" : "watch");
  const action = rating === "positive" ? "buy" : rating === "cautious" ? "cautious" : "watch";
  const actionLabel = action === "buy" ? t("sandtable_action_buy") : action === "cautious" ? t("sandtable_action_cautious") : t("sandtable_action_watch");
  const confidence = `${Math.max(55, Math.min(96, Math.round((protocol.confidence === "high" ? 88 : protocol.confidence === "low" ? 62 : 74) - riskScore * 8 + Math.min(8, citations.length * 2))))}%`;
  const mainSourceIds = [...new Set([
    ...(decision.source_ids || []),
    ...citations.flatMap((c) => c.source_ids || []),
    ...risks.flatMap((r) => r.source_ids || []),
  ].filter(Boolean))].slice(0, 6);

  const cfoBias = netMargin >= 15 && debtRatio <= 65 ? "bull" : debtRatio >= 75 ? "bear" : "watch";
  const strategyBias = rdRatio >= 5 || hypotheses.length >= 2 ? "bull" : "watch";
  const riskBias = highRisks.length ? "bear" : risks.length ? "watch" : "bull";
  const marketBias = decision.rating === "positive" ? "bull" : decision.rating === "cautious" ? "bear" : "watch";
  const allocatorBias = action === "buy" ? "bull" : action === "cautious" ? "bear" : "watch";

  const stanceText = (bias) => bias === "bull" ? t("sandtable_bias_bull") : bias === "bear" ? t("sandtable_bias_bear") : t("sandtable_bias_watch");
  const agents = [
    { avatar: "财", name: t("sandtable_agent_cfo"), role: t("sandtable_role_cfo"), bias: cfoBias, stance: `${stanceText(cfoBias)} · ${locale === "zh" ? `净利率 ${netMargin || "—"}% / 负债率 ${debtRatio || "—"}%` : `margin ${netMargin || "—"}% / leverage ${debtRatio || "—"}%`} ` },
    { avatar: "略", name: t("sandtable_agent_strategy"), role: t("sandtable_role_strategy"), bias: strategyBias, stance: clampDisplayText(`${stanceText(strategyBias)} · ${hypotheses[0]?.statement || (locale === "zh" ? "主假设待验证" : "main hypothesis pending")}`, 96) },
    { avatar: "险", name: t("sandtable_agent_risk"), role: t("sandtable_role_risk"), bias: riskBias, stance: `${stanceText(riskBias)} · ${highRisks[0] ? (t(`risk_signal.${highRisks[0].risk_id}`) ?? highRisks[0].risk_id) : (locale === "zh" ? "暂无高危信号" : "no high-severity signal")}` },
    { avatar: "市", name: t("sandtable_agent_market"), role: t("sandtable_role_market"), bias: marketBias, stance: clampDisplayText(`${stanceText(marketBias)} · ${decision.rationale || (locale === "zh" ? "等待估值反馈" : "waiting for valuation feedback")}`, 96) },
    { avatar: "组", name: t("sandtable_agent_allocator"), role: t("sandtable_role_allocator"), bias: allocatorBias, stance: `${stanceText(allocatorBias)} · ${actionLabel}` },
  ];

  const rounds = [
    {
      title: t("sandtable_round_1"),
      body: locale === "zh"
        ? `财务官先用财报和行情校准基线：净利率 ${netMargin || "—"}%，研发投入率 ${rdRatio || "—"}%，资产负债率 ${debtRatio || "—"}%。`
        : `CFO calibrates the baseline with financials and market data: margin ${netMargin || "—"}%, R&D ratio ${rdRatio || "—"}%, debt ratio ${debtRatio || "—"}%.`,
      sourceIds: mainSourceIds.slice(0, 3),
    },
    {
      title: t("sandtable_round_2"),
      body: locale === "zh"
        ? `战略与风控进行攻防：主假设关注增长兑现，备择假设聚焦 ${risks[0] ? (t(`risk_signal.${risks[0].risk_id}`) ?? risks[0].risk_id) : "估值和经营波动"}。`
        : `Strategy and Risk debate: the main hypothesis tests growth delivery, while the alternative focuses on ${risks[0]?.risk_id || "valuation and operating volatility"}.`,
      sourceIds: mainSourceIds.slice(1, 5),
    },
    {
      title: t("sandtable_round_3"),
      body: locale === "zh"
        ? `组合经理收敛为「${actionLabel}」：若后续监控项恶化则降级，否则维持当前沙盘结论。`
        : `Portfolio agent converges to "${actionLabel}": downgrade if monitoring indicators deteriorate, otherwise keep this sandbox conclusion.`,
      sourceIds: mainSourceIds.slice(0, 6),
    },
  ];

  const companyShort = companyDisplayName(result, 28) || (locale === "zh" ? "目标公司" : "the target");
  const conclusion = locale === "zh"
    ? `沙盘共识：${companyShort} 当前更适合「${actionLabel}」。支持点来自财务基线与主假设，约束项来自风险 Agent 的反证扫描；最终动作必须绑定后续监控指标，不做无条件判断。`
    : `Sandbox consensus: ${companyShort} is best handled as "${actionLabel}". Support comes from the financial baseline and main hypothesis, while constraints come from the Risk agent's counter-evidence scan; the action remains conditional on monitoring signals.`;
  const nextActions = (decision.monitoring_indicators || []).slice(0, 4);

  return {
    action,
    actionLabel,
    confidence,
    agents,
    edges: ["e1", "e2", "e3", "e4", "e5", "e6"],
    rounds,
    conclusion,
    nextActions: nextActions.length ? nextActions : (locale === "zh" ? ["跟踪公告", "复核估值", "观察盈利兑现"] : ["track announcements", "re-check valuation", "watch earnings delivery"]),
  };
}

function sandtableAvatar(agentId, index) {
  const map = {
    financial_modeler: locale === "zh" ? "财" : "F",
    industry_researcher: locale === "zh" ? "研" : "R",
    risk_officer: locale === "zh" ? "险" : "K",
    market_sentiment: locale === "zh" ? "市" : "M",
    portfolio_manager: locale === "zh" ? "组" : "P",
  };
  return map[agentId] || String(index + 1);
}

function renderHypotheses(result) {
  const panel = $("#panel-hypotheses");
  const items = result.protocol?.competing_hypotheses || [];
  if (!items.length) {
    panel.innerHTML = `<p class="muted-text">${esc(t("no_data"))}</p>`;
    return;
  }
  panel.innerHTML = `<div class="hyp-list">${items
    .map((h, i) => {
      const label = i === 0 ? t("hypothesis_main") : t("hypothesis_alt");
      const conf = h.confidence ? t(`confidence.${h.confidence}`) : "";
      const tags = (h.supporting_source_ids || [])
        .map((id) => `<span class="tag">${esc(id)}</span>`)
        .join("");
      return `
      <div class="hyp-card">
        <div class="hyp-header">
          <span class="hyp-label">${esc(label)}</span>
          <span class="hyp-id">${esc(h.hypothesis_id || `h-${i + 1}`)}</span>
          ${conf ? `<span class="meta-chip conf-${h.confidence}">${esc(conf)}</span>` : ""}
        </div>
        <div class="hyp-statement">${esc(h.statement)}</div>
        ${tags ? `<div class="hyp-tags">${tags}</div>` : ""}
      </div>`;
    })
    .join("")}</div>`;
}

function renderAudit(result) {
  const panel = $("#panel-audit");
  const audit = result.protocol?.audit;
  const evidence = result.protocol?.evidence_items || [];
  if (!audit) {
    panel.innerHTML = `<p class="muted-text">${esc(t("no_data"))}</p>`;
    return;
  }

  const issuesHtml = (audit.issues || [])
    .map(
      (issue) => `
    <div class="audit-issue ${issue.severity}">
      <span class="audit-sev">${esc(issue.severity)}</span>
      <span>${esc(issue.message)}</span>
      <code class="audit-code">${esc(issue.code)}</code>
    </div>`,
    )
    .join("");

  const evidenceHtml = evidence
    .map(
      (e) => `
    <div class="evidence-row">
      <div class="evidence-top">
        <span class="tag">${esc(e.source_id)}</span>
        <span class="evidence-rel ${e.relation}">${esc(t(`relation.${e.relation}`) ?? e.relation)}</span>
        <span class="evidence-rating">${esc(e.source_reliability)}/${esc(e.info_credibility)}</span>
      </div>
      ${e.claim ? `<div class="evidence-claim">${esc(formatDisplayText(e.claim))}</div>` : ""}
      <div class="evidence-excerpt">${esc(e.excerpt || "")}</div>
    </div>`,
    )
    .join("");

  const faith = result.protocol?.faithfulness;

  const faithHtml = faith
    ? `
    <div class="faith-block ${faith.passed ? "pass" : "fail"}">
      <div class="faith-header">
        <span class="audit-evidence-title">${esc(t("faithfulness"))}</span>
        <span class="meta-chip ${faith.passed ? "audit-pass" : "audit-fail"}">
          ${Math.round((faith.score || 0) * 100)}% · ${esc(faith.passed ? t("faithfulness_pass") : t("faithfulness_fail"))}
        </span>
      </div>
      <div class="faith-sub">${faith.grounded_claims}/${faith.total_claims} ${locale === "zh" ? "条判断已溯源" : "claims grounded"}</div>
      ${(faith.claim_details || [])
        .map(
          (c) => `
        <div class="faith-claim ${c.grounded ? "ok" : "bad"}">
          <span class="faith-status">${esc(c.grounded ? t("grounded") : t("ungrounded"))}</span>
          <span>${esc(formatDisplayText(c.claim))}</span>
          <span class="faith-reason">${esc(c.reason)}</span>
        </div>`,
        )
        .join("")}
    </div>`
    : "";

  panel.innerHTML = `
    <div class="audit-summary ${audit.passed ? "pass" : "fail"}">
      <div class="audit-score">${Math.round((audit.score || 0) * 100)}%</div>
      <div>
        <div class="audit-title">${esc(audit.passed ? t("audit_pass") : t("audit_fail"))}</div>
        <div class="audit-sub">${evidence.length} evidence items · ${(audit.issues || []).length} issues</div>
      </div>
    </div>
    ${faithHtml}
    ${issuesHtml ? `<div class="audit-issues">${issuesHtml}</div>` : ""}
    <div class="audit-evidence-title">${locale === "zh" ? "证据双轴评级" : "Dual-axis Evidence"}</div>
    <div class="evidence-list">${evidenceHtml || `<p class="muted-text">${esc(t("no_data"))}</p>`}</div>`;
}

function renderEntities(result) {
  const panel = $("#panel-entities");
  const protocolEntities = result.protocol?.entities || [];
  const fallbackSources = result.all_sources || [];
  const entities = protocolEntities.length
    ? protocolEntities
    : fallbackSources.length
      ? [{
          entity_id: "target",
          name: companyDisplayName(result, 24) || t("company"),
          entity_type: "company",
          source_ids: fallbackSources.map((source) => source.source_id),
        }]
      : [];
  const relations = result.protocol?.relations || [];
  if (!entities.length) {
    panel.innerHTML = `<p class="muted-text">${esc(t("no_data"))}</p>`;
    return;
  }

  const graphHtml = renderKnowledgeGraphScene(result, entities, relations);
  const entityHtml = entities
    .map(
      (e) => `
    <div class="entity-node">
      <div class="entity-name">${esc(e.name)}</div>
      <div class="entity-meta">
        <span class="tag">${esc(e.entity_type)}</span>
        <span class="entity-id">${esc(e.entity_id)}</span>
      </div>
    </div>`,
    )
    .join("");

  const relationHtml = relations
    .map(
      (r) => `
    <div class="relation-row">
      <span class="relation-from">${esc(r.from_entity_id)}</span>
      <span class="relation-arrow">→</span>
      <span class="relation-type">${esc(r.relation_type)}</span>
      <span class="relation-arrow">→</span>
      <span class="relation-to">${esc(r.to_entity_id)}</span>
      ${r.label ? `<span class="relation-label">${esc(r.label)}</span>` : ""}
      <span class="tag">${esc(r.source_id)}</span>
    </div>`,
    )
    .join("");

  const rawDataLabel = locale === "zh" ? "原始实体与关系数据" : "Raw entities & relations";
  const relationsTitle = locale === "zh" ? "关系边" : "Relations";
  panel.innerHTML = `
    ${graphHtml}
    <details class="kg-raw-data">
      <summary>${esc(rawDataLabel)}</summary>
      <div class="entity-grid">${entityHtml}</div>
      ${
        relations.length
          ? `<div class="relations-block"><div class="relations-title">${esc(relationsTitle)}</div>${relationHtml}</div>`
          : ""
      }
    </details>`;
  bindKnowledgeGraphControls(panel);
}

function renderHistory() {
  const panel = $("#panel-history");
  const history = loadResearchHistory();
  if (!panel) return;
  if (!history.length) {
    panel.innerHTML = `<p class="muted-text">${esc(t("history_empty"))}</p>`;
    return;
  }

  panel.innerHTML = `
    <section class="history-card">
      <div class="chain-section-label">${esc(t("history_title"))}</div>
      <div class="history-list">${history
        .map(
          (item) => `
        <article class="history-item" data-history-id="${esc(item.id)}">
          <div class="history-main">
            <div class="history-company" title="${esc(item.company || "")}">${esc(compactSandboxLabel(item.company || t("company"), 48))}</div>
            <div class="history-question" title="${esc(item.question || "")}">${esc(clampDisplayText(item.question || "", 140))}</div>
            <div class="history-meta">
              <span>${esc(t("history_time"))}: ${esc(formatHistoryTime(item.created_at))}</span>
              <span>${esc(t("metric_sources"))}: ${esc(item.source_count)}</span>
              <span>${esc(t("metric_confidence"))}: ${esc(t(`confidence.${item.confidence}`) ?? item.confidence ?? "—")}</span>
            </div>
          </div>
          <div class="history-actions">
            <button class="history-open" type="button">${esc(t("history_open"))}</button>
            <button class="history-delete" type="button" data-action="delete" aria-label="${esc(t("history_delete_aria"))}" title="${esc(t("history_delete_aria"))}">${esc(t("history_delete"))}</button>
          </div>
        </article>`,
        )
        .join("")}</div>
    </section>`;

  panel.querySelectorAll(".history-item").forEach((itemEl) => {
    itemEl.querySelector(".history-open")?.addEventListener("click", () => {
      const item = history.find((entry) => entry.id === itemEl.dataset.historyId);
      if (!item?.result) return;
      renderResults(item.result, { persist: false });
      activateTab("insights");
    });
    itemEl.querySelector(".history-delete")?.addEventListener("click", (event) => {
      event.stopPropagation();
      const id = itemEl.dataset.historyId;
      if (!id) return;
      if (!window.confirm(t("history_delete_confirm"))) return;
      const removed = deleteResearchHistory(id);
      if (!removed) return;
      itemEl.classList.add("history-item-removing");
      window.setTimeout(() => renderHistory(), 180);
    });
  });
}

const KG_STATE = { graph: null, fg: null, selectedId: null, pathMode: false, pathSource: null, pathTarget: null, abortController: null };

function buildKnowledgeGraphData(result, entities, relations) {
  const evidenceBySource = new Map((result.protocol?.evidence_items || []).map((item) => [item.source_id, item]));
  const sourceCandidates = (result.all_sources || []).filter((source) =>
    ["news", "financial_report", "market_data", "knowledge"].includes(source.source_type),
  );
  const sourceNodes = sourceCandidates.slice(0, 12).map((source) => ({
    id: source.source_id,
    name: source.title || source.source_id,
    type: "source",
    kind: "source",
    sourceType: source.source_type,
    sourceIds: [source.source_id],
    excerpt: source.excerpt,
  }));

  const entityNodes = entities.map((entity) => ({
    id: entity.entity_id,
    name: entity.name,
    type: entity.entity_type || "entity",
    kind: "entity",
    sourceIds: entity.source_ids || [],
  }));

  const nodeMap = new Map();
  [...entityNodes, ...sourceNodes].forEach((node) => {
    if (!nodeMap.has(node.id)) nodeMap.set(node.id, node);
  });

  const edges = [];
  relations.forEach((relation, i) => {
    if (!nodeMap.has(relation.from_entity_id) || !nodeMap.has(relation.to_entity_id)) return;
    edges.push({
      id: `r-${i}`,
      source: relation.from_entity_id,
      target: relation.to_entity_id,
      relationType: relation.relation_type || "related",
      sourceId: relation.source_id,
      label: relation.label,
      kind: "relation",
      strength: getRelationStrength({ source_id: relation.source_id }, evidenceBySource),
    });
  });

  sourceNodes.forEach((source) => {
    const matchedEntities = entityNodes.filter((entity) => (entity.sourceIds || []).includes(source.id));
    const targets = matchedEntities.length ? matchedEntities : entityNodes.slice(0, 1);
    targets.forEach((entity, i) => {
      edges.push({
        id: `s-${source.id}-${entity.id}-${i}`,
        source: source.id,
        target: entity.id,
        relationType: "supports",
        sourceId: source.id,
        kind: "evidence",
        strength: getRelationStrength({ source_id: source.id }, evidenceBySource),
      });
    });
  });

  const nodes = Array.from(nodeMap.values());
  const adjacency = new Map(nodes.map((node) => [node.id, new Set()]));
  const incidentEdges = new Map(nodes.map((node) => [node.id, []]));
  edges.forEach((edge) => {
    adjacency.get(edge.source)?.add(edge.target);
    adjacency.get(edge.target)?.add(edge.source);
    incidentEdges.get(edge.source)?.push(edge);
    incidentEdges.get(edge.target)?.push(edge);
  });

  nodes.forEach((node) => {
    node.degree = adjacency.get(node.id)?.size || 0;
    node.color = node.kind === "source" ? "#e2b96f" : getGraphNodeColor(node.type, node.id);
  });

  const communities = computeConnectedComponents(nodes, adjacency);
  nodes.forEach((node) => {
    const communityIndex = communities.get(node.id) ?? 0;
    node.community = communityIndex;
    node.communityColor = KG_COMMUNITY_PALETTE[communityIndex % KG_COMMUNITY_PALETTE.length];
  });

  const maxDegree = nodes.reduce((max, node) => Math.max(max, node.degree), 1);
  nodes.forEach((node) => {
    const ratio = node.degree / maxDegree;
    node.radius = 14 + ratio * 18 + (node.kind === "source" ? 0 : 6);
    node.importance = Math.round((node.degree / maxDegree) * 100);
  });

  const totalCommunities = new Set(nodes.map((n) => n.community)).size;
  return { nodes, edges, adjacency, incidentEdges, totalCommunities };
}

function computeConnectedComponents(nodes, adjacency) {
  const componentOf = new Map();
  let componentId = 0;
  nodes.forEach((start) => {
    if (componentOf.has(start.id)) return;
    const queue = [start.id];
    while (queue.length) {
      const id = queue.shift();
      if (componentOf.has(id)) continue;
      componentOf.set(id, componentId);
      (adjacency.get(id) || []).forEach((neighbor) => {
        if (!componentOf.has(neighbor)) queue.push(neighbor);
      });
    }
    componentId += 1;
  });
  return componentOf;
}

function runForceSimulation(nodes, edges, iterations = 280) {
  if (!nodes.length) return nodes;
  nodes.forEach((node, i) => {
    if (typeof node.x !== "number") {
      const angle = (i / nodes.length) * Math.PI * 2;
      const radius = 140 + Math.random() * 60;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
    }
    node.vx = 0;
    node.vy = 0;
  });

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const alpha0 = 1;
  const alphaDecay = alpha0 / iterations;
  const repulsion = 2400;
  const springLen = 110;
  const springK = 0.045;
  const centerPull = 0.012;

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = Math.max(0.001, alpha0 - alphaDecay * iter);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (repulsion / (dist * dist)) * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    edges.forEach((edge) => {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - springLen) * springK * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    });

    nodes.forEach((node) => {
      node.vx -= node.x * centerPull * alpha;
      node.vy -= node.y * centerPull * alpha;
      node.vx *= 0.68;
      node.vy *= 0.68;
      node.x += node.vx;
      node.y += node.vy;
    });
  }

  nodes.forEach((node) => {
    node.x = Math.round(node.x * 100) / 100;
    node.y = Math.round(node.y * 100) / 100;
  });

  return nodes;
}

function findShortestPath(adjacency, sourceId, targetId) {
  if (sourceId === targetId) return [sourceId];
  const visited = new Set([sourceId]);
  const queue = [[sourceId]];
  while (queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];
    const neighbors = adjacency.get(last) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      const nextPath = [...path, neighbor];
      if (neighbor === targetId) return nextPath;
      queue.push(nextPath);
    }
  }
  return null;
}

function computeGraphViewBox(nodes) {
  if (!nodes.length) return { x: -200, y: -150, w: 400, h: 300 };
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  const padding = 80;
  return {
    x: minX - padding,
    y: minY - padding,
    w: Math.max(maxX - minX + padding * 2, 320),
    h: Math.max(maxY - minY + padding * 2, 220),
  };
}

function renderKnowledgeGraphScene(result, entities, relations) {
  const graph = buildKnowledgeGraphData(result, entities, relations);
  KG_STATE.graph = graph;
  KG_STATE.selectedId = null;
  KG_STATE.pathMode = false;
  KG_STATE.pathSource = null;
  KG_STATE.pathTarget = null;
  const { nodes, edges } = graph;

  const typeOptions = Array.from(new Set(nodes.map((node) => node.type || "entity"))).sort();
  const relationTypes = Array.from(new Set(edges.map((edge) => edge.relationType || "related"))).sort();
  const sourceCount = nodes.filter((n) => n.kind === "source").length;

  return `
    <section class="kg-card">
      <div class="kg-header">
        <div>
          <div class="chain-section-label">${esc(t("kg_title"))}</div>
          <div class="kg-hint">${esc(t("kg_hint"))}</div>
        </div>
        <div class="kg-legend">
          <span><i style="background:${KG_ENTITY_TYPE_COLORS.company}"></i>${esc(t("kg_entity"))}</span>
          <span><i style="background:${KG_ENTITY_TYPE_COLORS.source}"></i>${esc(t("kg_source"))}</span>
          <span><i class="path"></i>Path</span>
        </div>
      </div>
      <div class="kg-toolbar">
        <input class="kg-search" type="search" placeholder="${esc(t("kg_search"))}" />
        <select class="kg-type-filter">
          <option value="">${esc(t("kg_all_types"))}</option>
          ${typeOptions.map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join("")}
        </select>
        <button type="button" class="kg-tool-btn" data-action="path-mode">${esc(t("kg_path_mode"))}</button>
        <button type="button" class="kg-tool-btn" data-action="fit">${esc(t("kg_fit"))}</button>
        <button type="button" class="kg-tool-btn" data-action="reset">${esc(t("kg_reset"))}</button>
      </div>
      <div class="kg-shell">
        <div class="kg-stage" data-state-empty="${nodes.length ? "false" : "true"}">
          <div class="kg-3d-container"></div>
          <div class="kg-hint-overlay">${esc(t("kg_drag_hint"))}</div>
          <div class="kg-status" hidden></div>
        </div>
        <aside class="kg-inspector">
          <div class="kg-stats">
            <div><strong>${nodes.length}</strong><span>${esc(t("kg_stats_entities"))}</span></div>
            <div><strong>${edges.length}</strong><span>${esc(t("kg_stats_relations"))}</span></div>
            <div><strong>${sourceCount}</strong><span>${esc(t("kg_stats_sources"))}</span></div>
            <div><strong>${graph.totalCommunities}</strong><span>${esc(t("kg_stats_communities"))}</span></div>
          </div>
          <div class="kg-inspector-card kg-detail-card">
            <div class="chain-section-label">${esc(t("kg_selected"))}</div>
            <div class="kg-detail-empty">${esc(t("kg_select_hint"))}</div>
          </div>
          <div class="kg-inspector-card kg-path-card" hidden>
            <div class="chain-section-label">${esc(t("kg_path_mode"))}</div>
            <div class="kg-path-hint">${esc(t("kg_path_hint"))}</div>
            <div class="kg-path-slots">
              <div class="kg-path-slot" data-slot="source"><span>${esc(t("kg_path_source"))}</span><strong>—</strong></div>
              <div class="kg-path-slot" data-slot="target"><span>${esc(t("kg_path_target"))}</span><strong>—</strong></div>
            </div>
            <div class="kg-path-result"></div>
            <button type="button" class="kg-tool-btn" data-action="clear-path">${esc(t("kg_clear_path"))}</button>
          </div>
          <div class="kg-inspector-card">
            <div class="chain-section-label">${esc(t("kg_strength"))}</div>
            <div class="kg-relation-list">${relationTypes.map((type) => `<span>${esc(type)}</span>`).join("") || `<span>${esc(t("no_data"))}</span>`}</div>
          </div>
        </aside>
      </div>
    </section>`;
}

function renderKnowledgeGraphFallback(container, graph) {
  const nodes = calculateForceLayout(graph.nodes || [], graph.edges || [], 260);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const viewBox = computeGraphViewBox(nodes);
  const edges = graph.edges || [];
  const svgEdges = edges
    .map((edge) => {
      const a = byId.get(edge.source);
      const b = byId.get(edge.target);
      if (!a || !b) return "";
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="kg2-edge" />`;
    })
    .join("");
  const svgNodes = nodes
    .map((node) => {
      const color = getGraphNodeColor(node.type, node.id);
      return `
        <g class="kg2-node">
          <circle cx="${node.x}" cy="${node.y}" r="${node.kind === "source" ? 8 : 10}" fill="${esc(color)}" />
          <text x="${node.x + 12}" y="${node.y + 4}">${esc((node.name || node.id).slice(0, 20))}</text>
        </g>`;
    })
    .join("");
  const sourceRows = nodes
    .filter((node) => node.kind === "source")
    .map((node) => `<li><code>${esc(node.id)}</code><span>${esc(node.name || "")}</span></li>`)
    .join("");
  container.innerHTML = `
    <div class="kg2-fallback">
      <div class="kg2-head">
        <strong>${esc(t("kg_fallback_title"))}</strong>
        <span>${esc(t("kg_fallback_body"))}</span>
      </div>
      <svg class="kg2-svg" viewBox="${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}" role="img">
        ${svgEdges}
        ${svgNodes}
      </svg>
      <ul class="kg2-source-list">${sourceRows}</ul>
    </div>`;
}

async function bindKnowledgeGraphControls(panel) {
  const graph = KG_STATE.graph;
  if (!graph) return;
  const card = panel.querySelector(".kg-card");
  if (!card) return;

  KG_STATE.abortController?.abort();
  KG_STATE.abortController = new AbortController();
  const { signal } = KG_STATE.abortController;

  if (KG_STATE.fg) {
    try { KG_STATE.fg.pauseAnimation?.(); } catch { /* noop */ }
    try { KG_STATE.fg._destructor?.(); } catch { /* noop */ }
    KG_STATE.fg = null;
  }

  const stage = card.querySelector(".kg-stage");
  const container = card.querySelector(".kg-3d-container");
  const inspector = card.querySelector(".kg-detail-card");
  const pathCard = card.querySelector(".kg-path-card");
  const statusBanner = card.querySelector(".kg-status");
  const search = card.querySelector(".kg-search");
  const typeFilter = card.querySelector(".kg-type-filter");
  const pathToggleBtn = card.querySelector('[data-action="path-mode"]');
  const fitBtn = card.querySelector('[data-action="fit"]');
  const resetBtn = card.querySelector('[data-action="reset"]');
  const clearPathBtn = card.querySelector('[data-action="clear-path"]');

  if (typeof ForceGraph3D !== "function") {
    container.innerHTML = `<div class="kg-fallback">${esc(t("kg_loading"))}</div>`;
    try {
      await loadVendor("forceGraph");
    } catch (err) {
      renderKnowledgeGraphFallback(container, graph);
      return;
    }
    container.innerHTML = "";
  }

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
  const highlightNodes = new Set();
  const highlightLinks = new Set();
  const pathNodes = new Set();
  const pathLinks = new Set();
  const labelSprites = new Map();
  const DIM_COLOR = "rgba(120,128,150,0.18)";

  const isNodeDim = (id) =>
    (pathNodes.size && !pathNodes.has(id)) || (highlightNodes.size && !highlightNodes.has(id));

  const refreshLabelOpacity = () => {
    labelSprites.forEach((sprite, id) => {
      if (!sprite?.material) return;
      sprite.material.opacity = isNodeDim(id) ? 0.22 : 1;
    });
  };

  const dataNodes = graph.nodes.map((n) => ({
    id: n.id,
    name: n.name,
    type: n.type,
    kind: n.kind,
    color: n.color,
    communityColor: n.communityColor,
    degree: n.degree,
    importance: n.importance,
    community: n.community,
    sourceIds: n.sourceIds,
    val: Math.max(2, n.degree * 1.5),
  }));
  const dataLinks = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    kind: e.kind,
    relationType: e.relationType,
    strength: e.strength,
  }));

  const showStatus = (message, tone = "info") => {
    if (!message) {
      statusBanner.hidden = true;
      statusBanner.textContent = "";
      return;
    }
    statusBanner.hidden = false;
    statusBanner.dataset.tone = tone;
    statusBanner.textContent = message;
  };

  const hasSpriteText = typeof SpriteText === "function";
  const buildLabelSprite = (n) => {
    if (!hasSpriteText) return null;
    const sprite = new SpriteText(truncateLabel(n.name, 20));
    sprite.color = "#f5f7fb";
    sprite.fontFace = "Inter, 'PingFang SC', 'Segoe UI', sans-serif";
    sprite.fontWeight = "600";
    sprite.textHeight = 4.2;
    sprite.padding = 2.2;
    sprite.borderRadius = 4;
    sprite.borderWidth = 0.6;
    sprite.borderColor = "rgba(255,255,255,0.18)";
    sprite.backgroundColor = "rgba(10,14,28,0.78)";
    sprite.material.depthWrite = false;
    sprite.position.set(0, Math.max(8, n.val * 1.6 + 4), 0);
    sprite.userData.kgLabel = true;
    return sprite;
  };

  const Graph = ForceGraph3D({ controlType: "orbit" })(container)
    .backgroundColor("rgba(8,11,20,0)")
    .showNavInfo(false)
    .nodeId("id")
    .nodeLabel((n) =>
      `<div class="kg-tooltip"><strong>${esc(n.name)}</strong><span>${esc(n.type)} · #${n.community}</span><em>deg ${n.degree} · imp ${n.importance}%</em></div>`,
    )
    .nodeRelSize(7)
    .nodeVal((n) => n.val)
    .nodeColor((n) => {
      if (pathNodes.size && !pathNodes.has(n.id)) return DIM_COLOR;
      if (highlightNodes.size && !highlightNodes.has(n.id)) return DIM_COLOR;
      return n.color;
    })
    .nodeOpacity(1)
    .nodeResolution(24)
    .nodeThreeObjectExtend(true)
    .nodeThreeObject((n) => {
      const sprite = buildLabelSprite(n);
      if (!sprite) return null;
      sprite.material.opacity = isNodeDim(n.id) ? 0.22 : 1;
      labelSprites.set(n.id, sprite);
      return sprite;
    })
    .linkColor((l) => {
      const id = l.id;
      if (pathLinks.size) return pathLinks.has(id) ? "#e2b96f" : "rgba(120,128,150,0.06)";
      if (highlightLinks.size) return highlightLinks.has(id) ? "#e2b96f" : "rgba(120,128,150,0.06)";
      return l.kind === "evidence" ? "rgba(226,185,111,0.7)" : "rgba(124,140,255,0.62)";
    })
    .linkOpacity(0.85)
    .linkWidth((l) => 0.9 + ((l.strength || 50) / 100) * 2.4)
    .linkDirectionalArrowLength(4)
    .linkDirectionalArrowRelPos(0.94)
    .linkDirectionalArrowColor(() => "rgba(255,255,255,0.65)")
    .linkDirectionalParticles((l) => ((l.strength || 0) > 65 ? 3 : (l.strength || 0) > 35 ? 1 : 0))
    .linkDirectionalParticleSpeed(0.008)
    .linkDirectionalParticleWidth(1.8)
    .linkDirectionalParticleColor(() => "#e2b96f")
    .onNodeClick((node) => {
      if (KG_STATE.pathMode) {
        handlePathPick(node.id);
        return;
      }
      selectNode(node.id);
    })
    .onNodeHover((node) => {
      container.style.cursor = node ? "pointer" : "";
      highlightNodes.clear();
      highlightLinks.clear();
      if (node) {
        highlightNodes.add(node.id);
        (graph.adjacency.get(node.id) || []).forEach((id) => highlightNodes.add(id));
        graph.incidentEdges.get(node.id)?.forEach((e) => highlightLinks.add(e.id));
      } else if (KG_STATE.selectedId) {
        highlightNodes.add(KG_STATE.selectedId);
        (graph.adjacency.get(KG_STATE.selectedId) || []).forEach((id) => highlightNodes.add(id));
        graph.incidentEdges.get(KG_STATE.selectedId)?.forEach((e) => highlightLinks.add(e.id));
      }
      refreshScene();
    })
    .onBackgroundClick(() => {
      KG_STATE.selectedId = null;
      highlightNodes.clear();
      highlightLinks.clear();
      renderInspectorEmpty();
      refreshScene();
    });

  const fitToView = (ms = 600, padding = 60) => {
    try {
      const data = Graph.graphData();
      if (!data?.nodes?.length) return;
      Graph.zoomToFit(ms, padding, () => true);
    } catch { /* noop */ }
  };

  const syncContainerSize = () => {
    const rect = container.getBoundingClientRect();
    if (rect.width && rect.height) Graph.width(rect.width).height(rect.height);
  };

  const freezeNodes = () => {
    try {
      (Graph.graphData()?.nodes || []).forEach((n) => {
        if (typeof n.x === "number") {
          n.fx = n.x;
          n.fy = n.y;
          n.fz = n.z;
        }
      });
    } catch { /* noop */ }
  };

  Graph
    .cooldownTicks(120)
    .enableNodeDrag(false)
    .onEngineStop(() => {
      freezeNodes();
    });

  syncContainerSize();
  Graph.graphData({ nodes: dataNodes, links: dataLinks });
  KG_STATE.fg = Graph;

  try {
    Graph.d3Force("charge")?.strength(-220);
    Graph.d3Force("link")?.distance(55);
    Graph.d3Force("center")?.strength(0.6);
  } catch { /* noop */ }

  const refreshScene = () => {
    if (KG_STATE.fg) KG_STATE.fg.refresh();
    refreshLabelOpacity();
  };

  requestAnimationFrame(syncContainerSize);
  setTimeout(() => { syncContainerSize(); fitToView(600, 80); }, 600);

  const resizeObserver = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => { syncContainerSize(); })
    : null;
  resizeObserver?.observe(container);
  signal.addEventListener("abort", () => resizeObserver?.disconnect());

  window.addEventListener("resize", () => { syncContainerSize(); }, { signal });

  const applyFilter = () => {
    const query = (search?.value || "").trim().toLowerCase();
    const type = (typeFilter?.value || "").toLowerCase();
    const filteredNodes = dataNodes.filter((n) => {
      const matchQ = !query || n.name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query);
      const matchT = !type || (n.type || "").toLowerCase() === type;
      return matchQ && matchT;
    });
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    const filteredLinks = dataLinks
      .map((l) => {
        const sid = typeof l.source === "object" && l.source ? l.source.id : l.source;
        const tid = typeof l.target === "object" && l.target ? l.target.id : l.target;
        return { ...l, source: sid, target: tid };
      })
      .filter((l) => visibleIds.has(l.source) && visibleIds.has(l.target));
    Graph.graphData({ nodes: filteredNodes, links: filteredLinks });
  };
  search?.addEventListener("input", applyFilter, { signal });
  typeFilter?.addEventListener("change", applyFilter, { signal });

  const renderInspectorEmpty = () => {
    if (!inspector) return;
    inspector.innerHTML = `
      <div class="chain-section-label">${esc(t("kg_selected"))}</div>
      <div class="kg-detail-empty">${esc(t("kg_select_hint"))}</div>`;
  };

  const selectNode = (id) => {
    const node = nodeMap.get(id);
    if (!node || !inspector) return;
    KG_STATE.selectedId = id;
    highlightNodes.clear();
    highlightLinks.clear();
    highlightNodes.add(id);
    (graph.adjacency.get(id) || []).forEach((nid) => highlightNodes.add(nid));
    graph.incidentEdges.get(id)?.forEach((e) => highlightLinks.add(e.id));
    refreshScene();

    const neighbors = Array.from(graph.adjacency.get(id) || []);
    const sourceIds = node.sourceIds || [];
    inspector.innerHTML = `
      <div class="chain-section-label">${esc(t("kg_selected"))}</div>
      <div class="kg-detail-name" style="--node-color:${node.color}">${esc(node.name)}</div>
      <div class="kg-detail-meta">
        <span>${esc(node.type)}</span>
        <span>${esc(node.id)}</span>
      </div>
      <div class="kg-detail-grid">
        <div><strong>${node.degree}</strong><span>${esc(t("kg_degree"))}</span></div>
        <div><strong>${node.importance}%</strong><span>${esc(t("kg_pagerank"))}</span></div>
        <div><strong>#${node.community}</strong><span>${esc(t("kg_community"))}</span></div>
        <div><strong>${sourceIds.length}</strong><span>${esc(t("kg_evidence"))}</span></div>
      </div>
      ${neighbors.length ? `<div class="kg-detail-section"><div class="chain-section-label">${esc(t("kg_neighbor_list"))}</div><div class="kg-neighbor-chips">${neighbors
        .slice(0, 12)
        .map((nid) => {
          const neighborNode = nodeMap.get(nid);
          if (!neighborNode) return "";
          return `<button type="button" class="kg-neighbor-chip" data-neighbor-id="${esc(nid)}" style="--node-color:${neighborNode.color}">${esc(neighborNode.name)}</button>`;
        })
        .join("")}</div></div>` : ""}
      ${sourceIds.length ? `<div class="kg-detail-section"><div class="chain-section-label">${esc(t("kg_evidence"))}</div><div class="chain-tags">${sourceIds.map((sid) => `<span class="tag">${esc(sid)}</span>`).join("")}</div></div>` : ""}`;
    inspector.querySelectorAll(".kg-neighbor-chip").forEach((chip) => {
      chip.addEventListener("click", () => selectNode(chip.dataset.neighborId));
    });
  };

  const updatePathSlots = () => {
    const sourceSlot = card.querySelector('[data-slot="source"] strong');
    const targetSlot = card.querySelector('[data-slot="target"] strong');
    if (sourceSlot) sourceSlot.textContent = KG_STATE.pathSource ? nodeMap.get(KG_STATE.pathSource)?.name || "—" : "—";
    if (targetSlot) targetSlot.textContent = KG_STATE.pathTarget ? nodeMap.get(KG_STATE.pathTarget)?.name || "—" : "—";
  };

  const renderPathResult = (path) => {
    const target = card.querySelector(".kg-path-result");
    if (!target) return;
    if (!path) {
      target.innerHTML = `<div class="kg-path-empty">${esc(t("kg_path_none"))}</div>`;
      return;
    }
    target.innerHTML = `
      <div class="kg-path-found">${esc(t("kg_path_found"))} · ${path.length} hops</div>
      <div class="kg-path-chain">${path
        .map((id, i) => {
          const node = nodeMap.get(id);
          if (!node) return "";
          const arrow = i < path.length - 1 ? '<span class="kg-path-arrow">→</span>' : "";
          return `<button type="button" class="kg-path-step" data-neighbor-id="${esc(id)}" style="--node-color:${node.color}">${esc(node.name)}</button>${arrow}`;
        })
        .join("")}</div>`;
    target.querySelectorAll(".kg-path-step").forEach((step) => {
      step.addEventListener("click", () => selectNode(step.dataset.neighborId));
    });
  };

  const runPathAnalysis = () => {
    pathNodes.clear();
    pathLinks.clear();
    if (!KG_STATE.pathSource || !KG_STATE.pathTarget) {
      renderPathResult(null);
      refreshScene();
      return;
    }
    const path = findShortestPath(graph.adjacency, KG_STATE.pathSource, KG_STATE.pathTarget);
    renderPathResult(path);
    if (!path) {
      refreshScene();
      return;
    }
    path.forEach((id) => pathNodes.add(id));
    for (let i = 0; i < path.length - 1; i++) {
      const edge = graph.edges.find(
        (item) => (item.source === path[i] && item.target === path[i + 1]) || (item.source === path[i + 1] && item.target === path[i]),
      );
      if (edge) pathLinks.add(edge.id);
    }
    refreshScene();
  };

  const handlePathPick = (id) => {
    if (!KG_STATE.pathSource) {
      KG_STATE.pathSource = id;
      showStatus(`${t("kg_path_source")}: ${nodeMap.get(id)?.name}`);
    } else if (!KG_STATE.pathTarget && id !== KG_STATE.pathSource) {
      KG_STATE.pathTarget = id;
      showStatus(`${t("kg_path_target")}: ${nodeMap.get(id)?.name}`);
      runPathAnalysis();
    } else {
      KG_STATE.pathSource = id;
      KG_STATE.pathTarget = null;
      pathNodes.clear();
      pathLinks.clear();
      refreshScene();
      renderPathResult(null);
      showStatus(`${t("kg_path_source")}: ${nodeMap.get(id)?.name}`);
    }
    updatePathSlots();
  };

  pathToggleBtn?.addEventListener("click", () => {
    KG_STATE.pathMode = !KG_STATE.pathMode;
    pathToggleBtn.classList.toggle("is-active", KG_STATE.pathMode);
    stage.classList.toggle("is-path-mode", KG_STATE.pathMode);
    pathCard.hidden = !KG_STATE.pathMode;
    if (!KG_STATE.pathMode) {
      pathNodes.clear();
      pathLinks.clear();
      refreshScene();
      showStatus(null);
    } else {
      showStatus(t("kg_path_hint"));
      KG_STATE.pathSource = null;
      KG_STATE.pathTarget = null;
      updatePathSlots();
      renderPathResult(null);
    }
  }, { signal });

  clearPathBtn?.addEventListener("click", () => {
    KG_STATE.pathSource = null;
    KG_STATE.pathTarget = null;
    pathNodes.clear();
    pathLinks.clear();
    refreshScene();
    renderPathResult(null);
    updatePathSlots();
    showStatus(KG_STATE.pathMode ? t("kg_path_hint") : null);
  }, { signal });

  fitBtn?.addEventListener("click", () => {
    try { Graph.zoomToFit(600, 60); } catch { /* noop */ }
  }, { signal });

  resetBtn?.addEventListener("click", () => {
    KG_STATE.selectedId = null;
    KG_STATE.pathSource = null;
    KG_STATE.pathTarget = null;
    KG_STATE.pathMode = false;
    pathToggleBtn?.classList.remove("is-active");
    stage.classList.remove("is-path-mode");
    pathCard.hidden = true;
    highlightNodes.clear();
    highlightLinks.clear();
    pathNodes.clear();
    pathLinks.clear();
    renderInspectorEmpty();
    updatePathSlots();
    renderPathResult(null);
    showStatus(null);
    if (search) search.value = "";
    if (typeFilter) typeFilter.value = "";
    const normalizedLinks = dataLinks.map((l) => ({
      ...l,
      source: typeof l.source === "object" && l.source ? l.source.id : l.source,
      target: typeof l.target === "object" && l.target ? l.target.id : l.target,
    }));
    Graph.graphData({ nodes: dataNodes, links: normalizedLinks });
    refreshScene();
    try { Graph.zoomToFit(600, 60); } catch { /* noop */ }
  }, { signal });
}

function truncateLabel(value, limit) {
  if (!value) return "";
  const text = String(value);
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function clampDisplayText(value, limit = 96) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, Math.max(1, limit - 1))}…` : text;
}

function compactSandboxLabel(value, limit = 36) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  const spacexMatch = text.match(/\bspace\s*x\b|\bspacex\b/i);
  if (spacexMatch) return "SpaceX";
  const companyLike = text.match(/\b(?:Kweichow Moutai|NVIDIA|BYD|CATL|China Merchants Bank|Apple|Microsoft|Amazon|Tesla|OpenAI|Google|Alphabet|Meta)\b/i);
  if (companyLike) return companyLike[0];
  return clampDisplayText(text, limit);
}

function companyDisplayName(result, limit = 36) {
  return compactSandboxLabel(result?.company || "", limit);
}

function getRelationStrength(edge, evidenceBySource) {
  const evidence = evidenceBySource.get(edge.source_id);
  if (!evidence) return 55;
  const sourceScore = SOURCE_RELIABILITY_SCORE[evidence.source_reliability] ?? 50;
  const infoScore = INFO_CREDIBILITY_SCORE[evidence.info_credibility] ?? 50;
  return Math.round((sourceScore + infoScore) / 2);
}

function getGraphNodeColor(type, id) {
  const normalized = String(type || "").toLowerCase();
  return KG_ENTITY_TYPE_COLORS[normalized] || KG_ENTITY_TYPE_COLORS[id] || "#78716c";
}

function sourceButton(id, label = id, className = "source-jump") {
  return `<button type="button" class="${className}" data-source-jump="${esc(id)}">${esc(label)}</button>`;
}

function bindSourceJumpLinks(scope = document) {
  scope.querySelectorAll("[data-source-jump]").forEach((btn) => {
    if (btn.dataset.jumpBound) return;
    btn.dataset.jumpBound = "1";
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      jumpToSource(btn.dataset.sourceJump);
    });
  });
}

function jumpToSource(sourceId) {
  if (!sourceId) return;
  activateTab("sources");
  setTimeout(() => {
    const target = document.querySelector(`[data-source-id="${CSS.escape(sourceId)}"]`);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("trace-highlight");
    setTimeout(() => target.classList.remove("trace-highlight"), 1800);
  }, 80);
}

function buildSourceBacklinks(result) {
  const claimsBySource = new Map();
  const stepsBySource = new Map();
  (result.citations || []).forEach((cite, idx) => {
    (cite.source_ids || []).forEach((id) => {
      if (!claimsBySource.has(id)) claimsBySource.set(id, []);
      claimsBySource.get(id).push({ idx: idx + 1, claim: formatDisplayText(cite.claim || "") });
    });
  });
  (result.steps || []).forEach((step) => {
    (step.sources || []).forEach((src) => {
      const id = src.source_id;
      if (!id) return;
      if (!stepsBySource.has(id)) stepsBySource.set(id, []);
      stepsBySource.get(id).push({ step: step.step_number, action: step.action || "" });
    });
  });
  return { claimsBySource, stepsBySource };
}

function renderCitations(result) {
  const panel = $("#panel-citations");
  if (!result.citations?.length) {
    panel.innerHTML = `<p style="color:var(--text-3);font-size:0.88rem">—</p>`;
    return;
  }
  const mode = result.mode || "live";
  panel.innerHTML = `
    <div class="trace-mode-callout">
      <strong>${esc(t("trace_mode_title"))}</strong>
      <span>${esc(t("trace_mode_body"))}</span>
    </div>
    <div class="cite-list">${result.citations
    .map(
      (c, i) => {
        const claimAttr = esc(c.claim).replace(/'/g, "&apos;");
        return `
    <div class="cite-item" data-claim="${claimAttr}" data-claim-index="${i + 1}">
      <div class="cite-claim">
        <span class="cite-num">${i + 1}</span>
        <span class="cite-text">${esc(formatDisplayText(c.claim))}</span>
      </div>
      <div class="cite-tags">${c.source_ids.map((id) => sourceButton(id, id, "tag source-jump")).join("")}</div>
      <div class="cite-feedback" data-claim-idx="${i}">
        <button type="button" class="cite-fb-btn" data-verdict="up" aria-label="${esc(t("feedback_up"))}">
          <span class="cite-fb-icon">▲</span>
          <span class="cite-fb-count" data-count="up">0</span>
        </button>
        <button type="button" class="cite-fb-btn" data-verdict="down" aria-label="${esc(t("feedback_down"))}">
          <span class="cite-fb-icon">▼</span>
          <span class="cite-fb-count" data-count="down">0</span>
        </button>
        <span class="cite-fb-status" aria-live="polite"></span>
      </div>
    </div>`;
      },
    )
    .join("")}</div>`;

  panel.querySelectorAll(".cite-fb-btn").forEach((btn) => {
    btn.addEventListener("click", () => submitClaimFeedback(btn, result, mode));
  });
  bindSourceJumpLinks(panel);

  loadCitationFeedback(result, mode, panel);
}

async function loadCitationFeedback(result, mode, panel) {
  if (!result.company || !result.question) return;
  try {
    const url = `/api/feedback/claim?company=${encodeURIComponent(result.company)}&question=${encodeURIComponent(result.question)}&locale=${encodeURIComponent(result.locale || locale)}&mode=${encodeURIComponent(mode)}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.by_claim) return;
    const items = panel.querySelectorAll(".cite-item");
    items.forEach((item, idx) => {
      const claim = result.citations?.[idx]?.claim;
      if (!claim) return;
      const hash = sha1Short(claim);
      const agg = data.by_claim[hash];
      if (!agg) return;
      updateFeedbackCounts(item, agg);
    });
  } catch (err) {
    /* non-blocking — feedback counts simply stay at 0 */
  }
}

async function submitClaimFeedback(btn, result, mode) {
  const item = btn.closest(".cite-item");
  if (!item) return;
  const claim = item.dataset.claim || "";
  if (!claim) return;
  const verdict = btn.dataset.verdict;
  const status = item.querySelector(".cite-fb-status");
  const buttons = item.querySelectorAll(".cite-fb-btn");
  buttons.forEach((b) => (b.disabled = true));
  status.textContent = t("feedback_sending");
  try {
    const res = await fetch("/api/feedback/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: result.company || "",
        question: result.question || "",
        locale: result.locale || locale,
        mode,
        claim,
        verdict,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    updateFeedbackCounts(item, data.aggregate || {});
    status.textContent = t("feedback_thanks");
    btn.classList.add("voted");
    setTimeout(() => { status.textContent = ""; }, 2400);
  } catch (err) {
    status.textContent = t("feedback_failed");
    setTimeout(() => { status.textContent = ""; }, 3000);
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

function updateFeedbackCounts(item, agg) {
  const up = Number(agg.up || 0);
  const down = Number(agg.down || 0);
  const upEl = item.querySelector('[data-count="up"]');
  const downEl = item.querySelector('[data-count="down"]');
  if (upEl) upEl.textContent = String(up);
  if (downEl) downEl.textContent = String(down);
  item.dataset.fbUp = String(up);
  item.dataset.fbDown = String(down);
  if (up + down >= 3 && down > up) {
    item.classList.add("disputed");
  } else {
    item.classList.remove("disputed");
  }
}

// Tiny synchronous SHA-1 (first 16 hex chars) to mirror backend claim_hash.
// Implemented locally to avoid a SubtleCrypto async hop for a single hash.
function sha1Short(input) {
  function rotl(n, b) { return (n << b) | (n >>> (32 - b)); }
  function toBytes(str) {
    const utf8 = unescape(encodeURIComponent(str));
    const out = new Uint8Array(utf8.length);
    for (let i = 0; i < utf8.length; i++) out[i] = utf8.charCodeAt(i);
    return out;
  }
  const msg = toBytes(input.trim());
  const ml = msg.length * 8;
  const withOne = new Uint8Array(((msg.length + 9 + 63) >> 6) << 6);
  withOne.set(msg);
  withOne[msg.length] = 0x80;
  const dv = new DataView(withOne.buffer);
  dv.setUint32(withOne.length - 4, ml >>> 0, false);
  dv.setUint32(withOne.length - 8, Math.floor(ml / 0x100000000), false);
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
  for (let i = 0; i < withOne.length; i += 64) {
    const w = new Array(80);
    for (let j = 0; j < 16; j++) w[j] = dv.getUint32(i + j * 4, false);
    for (let j = 16; j < 80; j++) w[j] = rotl(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let j = 0; j < 80; j++) {
      let f, k;
      if (j < 20) { f = (b & c) | (~b & d); k = 0x5a827999; }
      else if (j < 40) { f = b ^ c ^ d; k = 0x6ed9eba1; }
      else if (j < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc; }
      else { f = b ^ c ^ d; k = 0xca62c1d6; }
      const tmp = (rotl(a, 5) + f + e + k + w[j]) >>> 0;
      e = d; d = c; c = rotl(b, 30) >>> 0; b = a; a = tmp;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0; h4 = (h4 + e) >>> 0;
  }
  const hex = [h0, h1, h2, h3, h4].map((n) => n.toString(16).padStart(8, "0")).join("");
  return hex.slice(0, 16);
}

function renderTrace(result) {
  const panel = $("#panel-trace");
  if (!result.steps?.length) {
    panel.innerHTML = `<p style="color:var(--text-3);font-size:0.88rem">—</p>`;
    return;
  }

  panel.innerHTML = `<div class="timeline">${result.steps
    .map((step, i) => {
      const isLast = i === result.steps.length - 1;
      const isOpen = step.step_number <= 2;
      const sourcesHtml = (step.sources || [])
        .map(
          (s) => `
        <div class="tl-src" data-step-source-id="${esc(s.source_id)}">
          <div class="tl-src-id">${sourceButton(s.source_id, s.source_id, "tl-src-jump")}</div>
          <div class="tl-src-title">${esc(s.title)}</div>
          <div class="tl-src-excerpt">${esc(s.excerpt?.slice(0, 200) ?? "")}</div>
        </div>`,
        )
        .join("");

      return `
      <div class="tl-item" data-step-number="${esc(String(step.step_number))}">
        <div class="tl-rail">
          <div class="tl-dot"></div>
          ${isLast ? "" : '<div class="tl-line"></div>'}
        </div>
        <div class="tl-body">
          <div class="tl-header${isOpen ? " open" : ""}" data-step="${step.step_number}">
            <div class="tl-hdr-top">
              <span class="tl-step-num">Step ${step.step_number}</span>
              <span class="tl-tool">${esc(step.action)}</span>
              <span class="tl-thought-preview">${esc(step.thought)}</span>
              <svg class="tl-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
          <div class="tl-content${isOpen ? " open" : ""}">
            <div class="tl-thought"><strong>${esc(t("thought"))}</strong>${esc(step.thought)}</div>
            <div class="tl-block">
              <div class="tl-block-label">${esc(t("tool_input"))}</div>
              <pre>${esc(JSON.stringify(step.action_input, null, 2))}</pre>
            </div>
            <div class="tl-block">
              <div class="tl-block-label">${esc(t("observation"))}</div>
              <pre>${esc(step.observation?.slice(0, 1800) ?? "")}</pre>
            </div>
            ${
              sourcesHtml
                ? `<div class="tl-block"><div class="tl-block-label">${esc(t("sources_in_step"))}</div>${sourcesHtml}</div>`
                : ""
            }
          </div>
        </div>
      </div>`;
    })
    .join("")}</div>`;

  // Accordion toggle
  panel.querySelectorAll(".tl-header").forEach((hdr) => {
    hdr.addEventListener("click", () => {
      const content = hdr.nextElementSibling;
      const isOpen = hdr.classList.toggle("open");
      content.classList.toggle("open", isOpen);
    });
  });
  bindSourceJumpLinks(panel);
}

function getSentiment(sourceId, result) {
  for (const step of result.steps || []) {
    if (step.action !== "search_news") continue;
    try {
      const articles = JSON.parse(step.observation);
      if (Array.isArray(articles)) {
        const match = articles.find((a) => a.id === sourceId);
        if (match?.sentiment) return match.sentiment;
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function renderSources(result) {
  const panel = $("#panel-sources");
  if (!result.all_sources?.length) {
    panel.innerHTML = `<p style="color:var(--text-3);font-size:0.88rem">—</p>`;
    return;
  }
  const { claimsBySource, stepsBySource } = buildSourceBacklinks(result);

  panel.innerHTML = `<div class="src-grid">${result.all_sources
    .map((src) => {
      const icon = SOURCE_ICONS[src.source_type] ?? "📄";
      const typeLabel = t(`source_type.${src.source_type}`) ?? src.source_type;
      const sentiment = src.source_type === "news" ? getSentiment(src.source_id, result) : null;
      const sentimentHtml = sentiment
        ? `<span class="src-sentiment ${sentiment}">${esc(t(`sentiment.${sentiment}`))}</span>`
        : "";
      const urlHtml = src.url
        ? `<div class="src-url"><a href="${esc(src.url)}" target="_blank">↗ ${esc(src.url.slice(0, 55))}${src.url.length > 55 ? "…" : ""}</a></div>`
        : "";

      const tier = getSourceTier(src.source_type);
      const tierLabel = t(tier.label_key);
      const stars = "★".repeat(tier.stars) + "☆".repeat(5 - tier.stars);
      const claimLinks = claimsBySource.get(src.source_id) || [];
      const stepLinks = stepsBySource.get(src.source_id) || [];
      const backlinksHtml = `
        <div class="src-backlinks">
          ${claimLinks.length ? `<div class="src-backlink-row"><span>${esc(t("trace_supported_claims"))}</span>${claimLinks
            .slice(0, 4)
            .map((item) => `<button type="button" class="src-backlink-chip" data-claim-jump="${item.idx}" title="${esc(item.claim)}">#${item.idx}</button>`)
            .join("")}</div>` : ""}
          ${stepLinks.length ? `<div class="src-backlink-row"><span>${esc(t("trace_used_steps"))}</span>${stepLinks
            .slice(0, 4)
            .map((item) => `<button type="button" class="src-backlink-chip" data-step-jump="${item.step}">Step ${item.step}</button>`)
            .join("")}</div>` : ""}
        </div>`;

      return `
      <div class="src-card tier-${tier.key}" id="source-${esc(src.source_id)}" data-source-id="${esc(src.source_id)}">
        <div class="src-hdr">
          <span class="src-type ${src.source_type}">${icon} ${esc(typeLabel)}</span>
          <span class="src-tier-badge" style="--tier-color:${tier.color}">${esc(tierLabel)}</span>
          ${sentimentHtml}
          <span class="src-id">${esc(src.source_id)}</span>
        </div>
        <div class="src-reliability" title="${esc(t("source_reliability_label"))}">
          <span class="src-reliability-stars" style="--tier-color:${tier.color}">${stars}</span>
          <span class="src-reliability-label">${esc(t("source_reliability_label"))} · ${tier.stars}/5</span>
        </div>
        <div class="src-title">${esc(src.title)}</div>
        <div class="src-excerpt">${esc(src.excerpt?.slice(0, 240) ?? "")}</div>
        ${backlinksHtml}
        ${urlHtml}
      </div>`;
    })
    .join("")}</div>`;
  panel.querySelectorAll("[data-claim-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activateTab("citations");
      setTimeout(() => {
        const target = document.querySelector(`[data-claim-index="${btn.dataset.claimJump}"]`);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("trace-highlight");
        setTimeout(() => target.classList.remove("trace-highlight"), 1800);
      }, 80);
    });
  });
  panel.querySelectorAll("[data-step-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activateTab("trace");
      setTimeout(() => {
        const target = document.querySelector(`[data-step-number="${btn.dataset.stepJump}"]`);
        if (!target) return;
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.add("trace-highlight");
        setTimeout(() => target.classList.remove("trace-highlight"), 1800);
      }, 80);
    });
  });
}

function renderResults(result, options = {}) {
  const persist = options.persist !== false;
  if (result && !result.generated_at) result.generated_at = new Date().toISOString();
  lastResult = result;
  if (persist) saveResearchHistory(result);
  updateMetrics(result);
  renderHeroDeck(result);
  renderVizStrip(result);
  renderConclusion(result);
  renderResultsList(result);
  renderEvidenceChain(result);
  renderDecision(result);
  renderSandtable(result);
  renderHypotheses(result);
  renderAudit(result);
  renderEntities(result);
  renderHistory();
  renderCitations(result);
  renderTrace(result);
  renderSources(result);
  renderFollowups(result);

  els.results.classList.remove("hidden");
  els.exportBtn.classList.remove("hidden");
  els.reportBtn.classList.remove("hidden");
  els.pdfBtn?.classList.remove("hidden");
  els.shareBtn?.classList.remove("hidden");
}

// ── Follow-up suggestions ─────────────────────────────────────────────────────
function buildFollowups(result) {
  const protocol = result?.protocol || {};
  const risks = protocol.risk_signals || [];
  const benchmarks = protocol.industry_benchmarks || [];
  const metrics = protocol.financial_metrics || [];
  const company = result.company || t("company");

  const out = [];

  const topRisk = [...risks].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  if (topRisk) {
    const name = t(`risk_signal.${topRisk.risk_id}`) ?? topRisk.risk_id;
    out.push({
      icon: "⚠",
      tone: "warn",
      label: t("followup_risk").replace("{name}", name),
    });
  }

  const peer = benchmarks.find((b) => b.company_id !== "target");
  if (peer) {
    out.push({
      icon: "⚖",
      tone: "accent",
      label: t("followup_peer").replace("{peer}", peer.name || peer.company_id),
    });
  }

  const focusMetric = metrics.find((m) => ["net_margin", "rd_expense_ratio", "debt_to_asset_ratio"].includes(m.metric_id))
    || metrics[0];
  if (focusMetric) {
    const name = t(`financial_metric.${focusMetric.metric_id}`) ?? focusMetric.metric_id;
    out.push({
      icon: "📈",
      tone: "accent",
      label: t("followup_metric").replace("{company}", company).replace("{name}", name),
    });
  }

  out.push({ icon: "🌡", tone: "neutral", label: t("followup_scenario") });
  out.push({ icon: "🛡", tone: "neutral", label: t("followup_followup") });

  return out.slice(0, 5);
}

function renderFollowups(result) {
  const panel = document.getElementById("panel-conclusion");
  if (!panel) return;
  panel.querySelector(".followup-block")?.remove();
  if (!result) return;

  const items = buildFollowups(result);
  if (!items.length) return;

  const block = document.createElement("section");
  block.className = "followup-block";
  block.innerHTML = `
    <div class="followup-head">
      <div>
        <div class="followup-title">${esc(t("followup_title"))}</div>
        <div class="followup-sub">${esc(t("followup_subtitle"))}</div>
      </div>
    </div>
    <div class="followup-list">
      ${items
        .map(
          (item) => `
        <button type="button" class="followup-card ${item.tone}" data-question="${esc(item.label)}">
          <span class="followup-icon">${item.icon}</span>
          <span class="followup-label">${esc(item.label)}</span>
          <span class="followup-arrow">→</span>
        </button>`,
        )
        .join("")}
    </div>
    <div class="followup-answers" id="followup-answers" aria-live="polite"></div>`;
  panel.appendChild(block);

  block.querySelectorAll(".followup-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      const question = btn.dataset.question || "";
      if (!question) return;
      runFollowup(question, btn);
    });
  });
}

let followupCounter = 0;
let followupInflight = false;
let followupController = null;

async function runFollowup(question, triggerBtn) {
  if (!lastResult) return;
  if (followupInflight) return;
  followupInflight = true;
  const answersHost = $("#followup-answers");
  if (!answersHost) {
    followupInflight = false;
    return;
  }

  followupCounter += 1;
  const cardId = `followup-card-${followupCounter}`;
  const placeholder = document.createElement("article");
  placeholder.className = "followup-answer pending";
  placeholder.id = cardId;
  placeholder.innerHTML = `
    <header class="followup-answer-head">
      <span class="followup-answer-tag">${esc(t("followup_pending_tag"))}</span>
      <span class="followup-answer-q">${esc(question)}</span>
      <button type="button" class="followup-answer-close" data-action="close" aria-label="${esc(t("close_overlay"))}">✕</button>
    </header>
    <div class="followup-answer-body">
      <div class="followup-spinner" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="followup-pending-text">${esc(t("followup_pending_message"))}</div>
    </div>`;
  answersHost.prepend(placeholder);
  placeholder.scrollIntoView({ behavior: "smooth", block: "center" });

  if (triggerBtn) triggerBtn.classList.add("loading");
  const controller = new AbortController();
  followupController = controller;
  const timer = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), 60000);
  placeholder.querySelector('[data-action="close"]')?.addEventListener("click", () => {
    controller.abort(new DOMException("cancelled-by-user", "AbortError"));
    placeholder.remove();
  });

  try {
    const res = await fetch("/api/research/followup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        followup_question: question,
        base_result: lastResult,
        locale,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      let detail = "";
      try {
        const errBody = await res.json();
        detail = errBody.detail || errBody.error || "";
      } catch {
        detail = await res.text().catch(() => "");
      }
      throw new Error(detail || `HTTP ${res.status}`);
    }
    const followupResult = await res.json();
    renderFollowupAnswer(placeholder, question, followupResult);
  } catch (err) {
    if (err?.name !== "AbortError") renderFollowupAnswerError(placeholder, question, err);
  } finally {
    clearTimeout(timer);
    followupInflight = false;
    if (followupController === controller) followupController = null;
    if (triggerBtn) triggerBtn.classList.remove("loading");
  }
}

function renderFollowupAnswer(host, question, result) {
  const conclusionHtml = renderMarkdown(result.conclusion || "");
  const sources = result.all_sources || [];
  const sourceIds = new Set();
  (result.citations || []).forEach((c) => (c.source_ids || []).forEach((id) => sourceIds.add(id)));
  const citedSources = sources.filter((s) => sourceIds.has(s.source_id)).slice(0, 5);

  host.classList.remove("pending");
  host.classList.add("ready");
  host.innerHTML = `
    <header class="followup-answer-head">
      <span class="followup-answer-tag answered">${esc(t("followup_answered_tag"))}</span>
      <span class="followup-answer-q">${esc(question)}</span>
      <button type="button" class="followup-answer-close" data-action="close" aria-label="${esc(t("close_overlay"))}">✕</button>
    </header>
    <div class="followup-answer-body">
      <div class="followup-answer-text">${conclusionHtml}</div>
      ${citedSources.length
        ? `<div class="followup-answer-sources">
            <span class="followup-answer-sources-label">${esc(t("followup_sources_label"))}</span>
            ${citedSources
              .map(
                (s) => `<span class="followup-source-pill" title="${esc(s.title || "")}">${esc(s.source_id)}</span>`,
              )
              .join("")}
           </div>`
        : ""}
      <div class="followup-answer-actions">
        <button type="button" class="followup-answer-btn" data-action="open-full">${esc(t("followup_open_full"))}</button>
        <button type="button" class="followup-answer-btn ghost" data-action="copy">${esc(t("followup_copy"))}</button>
      </div>
    </div>`;

  host.querySelector('[data-action="close"]').addEventListener("click", () => host.remove());
  host.querySelector('[data-action="open-full"]')?.addEventListener("click", () => {
    lastResult = result;
    renderResults(result, { persist: false });
    activateTab("insights");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  host.querySelector('[data-action="copy"]')?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(result.conclusion || "");
      showShareToast(t("followup_copied"), "ok");
    } catch (err) {
      console.warn("copy failed", err);
    }
  });
}

function renderFollowupAnswerError(host, question, err) {
  host.classList.remove("pending");
  host.classList.add("errored");
  host.innerHTML = `
    <header class="followup-answer-head">
      <span class="followup-answer-tag errored">${esc(t("followup_error_tag"))}</span>
      <span class="followup-answer-q">${esc(question)}</span>
      <button type="button" class="followup-answer-close" data-action="close" aria-label="${esc(t("close_overlay"))}">✕</button>
    </header>
    <div class="followup-answer-body">
      <div class="followup-answer-text">${esc(err?.message || t("error_generic"))}</div>
      <div class="followup-answer-actions">
        <button type="button" class="followup-answer-btn" data-action="retry">${esc(t("error_action_retry"))}</button>
      </div>
    </div>`;
  host.querySelector('[data-action="close"]').addEventListener("click", () => host.remove());
  host.querySelector('[data-action="retry"]').addEventListener("click", () => {
    host.remove();
    runFollowup(question);
  });
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
const SECTION_TO_TAB = {
  conclusion: "insights",
  decision: "insights",
  "results-list": "insights",
  hypotheses: "insights",
  "evidence-chain": "evidence",
  citations: "evidence",
  sources: "evidence",
  audit: "evidence",
  trace: "reasoning",
  entities: "graph",
  history: "history",
  insights: "insights",
  evidence: "evidence",
  reasoning: "reasoning",
  graph: "graph",
};

function initTabs() {
  $$(".tab").forEach((tab) => {
    const name = tab.dataset.tab;
    tab.setAttribute("role", "tab");
    tab.setAttribute("id", `tab-${name}`);
    tab.setAttribute("aria-controls", `panel-${name}`);
    tab.setAttribute("aria-selected", tab.classList.contains("active") ? "true" : "false");
    tab.setAttribute("tabindex", tab.classList.contains("active") ? "0" : "-1");
    tab.addEventListener("click", () => {
      activateTab(tab.dataset.tab);
    });
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      const all = Array.from($$(".tab"));
      const idx = all.indexOf(tab);
      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % all.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + all.length) % all.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = all.length - 1;
      activateTab(all[next].dataset.tab);
      all[next].focus();
    });
  });
  $$(".tab-panel").forEach((panel) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
    const id = panel.id || "";
    const name = id.replace(/^panel-/, "");
    if (name) panel.setAttribute("aria-labelledby", `tab-${name}`);
  });
  initSubnavScrollSpy();
  $$(".merged-subnav a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href")?.slice(1);
      if (!targetId) return;
      const section = $(`#${targetId}`);
      if (!section) return;
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      updateSubnavActive(link);
      section.classList.add("section-flash");
      setTimeout(() => section.classList.remove("section-flash"), 800);
    });
  });
}

function updateSubnavActive(activeLink) {
  const parent = activeLink.closest(".merged-subnav");
  if (!parent) return;
  parent.querySelectorAll("a").forEach((a) => a.classList.toggle("active", a === activeLink));
}

function initSubnavScrollSpy() {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      const link = $(`.merged-subnav a[href="#${id}"]`);
      if (link) updateSubnavActive(link);
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  $$(".merged-section").forEach((section) => observer.observe(section));
}

function activateTab(tabName) {
  const mainTab = SECTION_TO_TAB[tabName] || tabName;
  $$(".tab").forEach((tab) => {
    const on = tab.dataset.tab === mainTab;
    tab.classList.toggle("active", on);
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.setAttribute("tabindex", on ? "0" : "-1");
  });
  $$(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  $(`#panel-${mainTab}`)?.classList.add("active");

  if (mainTab !== tabName) {
    const section = $(`#sec-${tabName}`);
    if (section) {
      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        const link = $(`.merged-subnav a[href="#sec-${tabName}"]`);
        if (link) updateSubnavActive(link);
      }, 30);
    }
  } else {
    const firstLink = $(`#panel-${mainTab} .merged-subnav a`);
    if (firstLink) updateSubnavActive(firstLink);
  }
}

function loadResearchHistory() {
  return Storage.getHistory();
}

function saveResearchHistory(result) {
  const history = loadResearchHistory();
  const item = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    created_at: new Date().toISOString(),
    company: result.company,
    question: result.question,
    confidence: result.protocol?.confidence,
    source_count: result.all_sources?.length ?? 0,
    result,
  };
  const next = [
    item,
    ...history.filter((entry) => entry.company !== result.company || entry.question !== result.question),
  ];
  Storage.saveHistory(next);
}

function deleteResearchHistory(id) {
  if (!id) return false;
  const history = loadResearchHistory();
  const next = history.filter((entry) => entry.id !== id);
  if (next.length === history.length) return false;
  Storage.saveHistory(next);
  return true;
}

function formatHistoryTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Run ───────────────────────────────────────────────────────────────────────
let activeResearchController = null;

function cancelActiveResearch() {
  if (activeResearchController) {
    activeResearchController.abort(new DOMException("cancelled-by-user", "AbortError"));
  }
}

async function runResearch() {
  const company = els.company.value.trim();
  const question = els.question.value.trim();
  if (!company || !question) return;

  els.runBtn.disabled = true;
  els.runBtn.querySelector(".btn-text").classList.add("hidden");
  els.runBtn.querySelector(".btn-spinner").classList.remove("hidden");

  startLoading();

  const controller = new AbortController();
  activeResearchController = controller;
  const timeoutMs = 180000;
  const timer = setTimeout(() => controller.abort(new DOMException("timeout", "TimeoutError")), timeoutMs);
  let userCancelled = false;
  let result = null;

  try {
    const stepCounter = { count: 0 };

    try {
      result = await runResearchStream({ company, question, locale }, controller.signal, stepCounter);
    } catch (streamErr) {
      if (controller.signal.aborted) throw streamErr;
      console.warn("SSE failed, falling back to non-stream:", streamErr);
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, question, locale }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let detail = "";
        try {
          const errBody = await res.json();
          detail = errBody.detail || errBody.error || "";
        } catch {
          detail = await res.text().catch(() => "");
        }
        throw new Error(detail || `HTTP ${res.status}`);
      }
      result = await res.json();
      await replayReasoning(result);
    }
    clearTimeout(timer);

    stopLoading();
    if (!result) throw new Error("Empty result");
    renderResults(result);
  } catch (err) {
    clearTimeout(timer);
    stopLoading();
    els.emptyState.classList.remove("hidden");
    const abortReason = controller.signal.reason;
    const timedOut = err?.name === "TimeoutError" || abortReason?.name === "TimeoutError";
    if (timedOut) {
      showError(formatFetchError(abortReason || err, "timeout"));
    } else if (err?.name === "AbortError" || controller.signal.aborted) {
      userCancelled = true;
      showError(t("research_cancelled"), "info");
    } else {
      showError(formatFetchError(err, err.message));
      console.error(err);
    }
  } finally {
    activeResearchController = null;
    els.runBtn.disabled = false;
    els.runBtn.querySelector(".btn-text").classList.remove("hidden");
    els.runBtn.querySelector(".btn-spinner").classList.add("hidden");
  }
  if (userCancelled) return null;
  return result;
}

// ── SSE streaming consumer ────────────────────────────────────────────────────
async function runResearchStream(body, signal, stepCounter) {
  const res = await fetch("/api/research/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    throw new Error(`stream HTTP ${res.status}`);
  }
  if (!res.body) {
    throw new Error("ReadableStream unsupported");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult = null;
  let lastError = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const parsed = parseSseBlock(block);
      if (!parsed) continue;
      const { event, data } = parsed;
      if (event === "started") {
        setThinkingStatus(t("thinking_planning"));
      } else if (event === "step" && data.step) {
        if (stepCounter.count === 0) {
          clearInterval(loadingTimer);
          clearThinkingConsole();
        }
        stepCounter.count++;
        renderStreamStep(data.step, stepCounter.count);
      } else if (event === "phase") {
        if (data.phase === "audit") {
          setThinkingStatus(t("thinking_auditing"));
          appendThinkingLine(`<span class="tl-dot ok"></span><span class="tl-text">${esc(t("thinking_auditing"))}</span>`, "audit");
        } else if (data.phase === "thinking") {
          setThinkingStatus(`${t("thinking_planning")} · #${data.step_number || "?"}`);
        }
      } else if (event === "warning") {
        appendThinkingLine(`<span class="tl-dot ok"></span><span class="tl-text">⚠ ${esc(data.message || "")}</span>`, "audit");
      } else if (event === "final" && data.result) {
        finalResult = data.result;
        setThinkingStatus(t("thinking_finalizing"));
        appendThinkingLine(`<span class="tl-dot ok"></span><span class="tl-text">${esc(t("thinking_finalizing"))}</span>`, "done");
        setThinkingProgress(stepCounter.count, stepCounter.count);
        await new Promise((r) => setTimeout(r, 280));
      } else if (event === "error") {
        lastError = data.message || "stream error";
      }
    }
  }

  if (lastError) throw new Error(lastError);
  if (!finalResult) throw new Error("Stream ended without final result");
  return finalResult;
}

function parseSseBlock(block) {
  let event = "message";
  let dataLines = [];
  for (const line of block.split("\n")) {
    if (!line) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return null;
  try {
    return { event, data: JSON.parse(dataLines.join("\n")) };
  } catch {
    return null;
  }
}

function renderStreamStep(step, ordinal) {
  setThinkingProgress(ordinal, Math.max(ordinal, 4));
  const action = step.action || "tool";
  const thought = (step.thought || "").slice(0, 110);
  const sources = (step.sources || []).slice(0, 3).map((s) => s.source_id).join(" · ");
  const status = step.data_status || {};
  const hitLabel = status.cache_hit ? t("tool_cache_hit") : status.hit === false ? t("tool_miss") : t("tool_hit");
  const loopLabel = status.loop ? String(status.loop).replace("deep_search:", "Deep Search · ") : "";
  const dataLabel = [loopLabel, hitLabel, status.data_source, status.source_count != null ? `${status.source_count} src` : ""]
    .filter(Boolean)
    .join(" · ");
  appendThinkingLine(
    `<span class="tl-step">#${String(step.step_number ?? ordinal).padStart(2, "0")}</span>
     <span class="tl-act">${esc(action)}</span>
     <span class="tl-text">${esc(thought)}</span>
     ${dataLabel ? `<span class="tl-meta">${esc(dataLabel)}</span>` : ""}
     ${sources ? `<span class="tl-meta">${esc(sources)}</span>` : ""}`,
    "step",
  );
  setThinkingStatus(`${t("thinking_calling")} · ${action}`);
}

function clearResults() {
  lastResult = null;
  clearError();
  els.results.classList.add("hidden");
  els.exportBtn.classList.add("hidden");
  els.reportBtn.classList.add("hidden");
  els.pdfBtn?.classList.add("hidden");
  els.shareBtn?.classList.add("hidden");
  els.emptyState.classList.remove("hidden");
  updateMetrics(null);
  renderHeroDeck(null);
  renderVizStrip(null);
}

function exportJson() {
  if (!lastResult) return;
  const blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "research_result.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ── Shareable URL (compressed result in URL hash) ─────────────────────────────
function base64UrlEncode(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(token) {
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function encodeShareToken(result) {
  if (typeof pako === "undefined") return null;
  const slim = stripResultForShare(result);
  const json = JSON.stringify(slim);
  const compressed = pako.deflate(json);
  return base64UrlEncode(compressed);
}

function decodeShareToken(token) {
  if (typeof pako === "undefined") return null;
  const compressed = base64UrlDecode(token);
  const json = pako.inflate(compressed, { to: "string" });
  return JSON.parse(json);
}

function stripResultForShare(result) {
  const out = { ...result };
  if (out.steps?.length) {
    out.steps = out.steps.map((step) => ({
      ...step,
      observation: typeof step.observation === "string" ? step.observation.slice(0, 600) : step.observation,
    }));
  }
  if (out.all_sources?.length) {
    out.all_sources = out.all_sources.map((src) => ({
      ...src,
      excerpt: typeof src.excerpt === "string" ? src.excerpt.slice(0, 400) : src.excerpt,
    }));
  }
  return out;
}

function buildShareUrl(result) {
  const token = encodeShareToken(result);
  if (!token) return null;
  const base = `${location.origin}${location.pathname}`;
  return `${base}#share=${token}`;
}

async function copyShareLink() {
  if (!lastResult) return;
  try {
    await loadVendor("pako");
  } catch {
    showShareToast(t("share_load_fail"), "error");
    return;
  }
  const url = buildShareUrl(lastResult);
  if (!url) {
    downloadShareJson(lastResult);
    showShareToast(t("share_downloaded"), "ok");
    return;
  }
  if (url.length > 60000) {
    downloadShareJson(lastResult);
    showShareToast(t("share_downloaded"), "ok");
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    showShareToast(t("share_copied"), "ok", url);
  } catch {
    showShareToast(url.length > 200 ? `${url.slice(0, 200)}…` : url, "ok");
  }
}

function downloadShareJson(result) {
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tracemind-share-payload.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function showShareToast(text, tone = "ok", url = null) {
  document.querySelectorAll(".share-toast").forEach((el) => el.remove());
  const toast = document.createElement("div");
  toast.className = `share-toast ${tone}`;
  toast.innerHTML = `
    <div class="share-toast-title">${esc(text)}</div>
    ${url ? `<div class="share-toast-sub">${esc(t("share_copied_sub"))}</div>
            <div class="share-toast-url">${esc(url.length > 80 ? `${url.slice(0, 80)}…` : url)}</div>` : ""}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("in"));
  setTimeout(() => {
    toast.classList.remove("in");
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

async function tryLoadFromHash() {
  const hash = location.hash || "";
  const match = hash.match(/share=([^&]+)/);
  if (!match) return false;
  try {
    await loadVendor("pako");
    const result = decodeShareToken(match[1]);
    if (!result) return false;
    setTimeout(() => {
      renderResults(result, { persist: false });
      els.company.value = result.company || "";
      els.question.value = result.question || "";
      els.company.dataset.auto = "0";
      els.question.dataset.auto = "0";
    }, 60);
    return true;
  } catch (err) {
    console.warn("share decode failed", err);
    showError(t("share_decode_failed"));
    return false;
  }
}

// ── PDF Export (printable view with QR codes per source) ──────────────────────
function buildQrSvg(text, cellSize = 4) {
  if (typeof qrcode !== "function") return "";
  try {
    const qr = qrcode(0, "M");
    qr.addData(text);
    qr.make();
    return qr.createSvgTag({ cellSize, margin: 0, scalable: true });
  } catch (err) {
    console.warn("qr generation failed", err);
    return "";
  }
}

async function openPdfPreview() {
  if (!lastResult) return;
  document.getElementById("pdf-preview")?.remove();

  try {
    await Promise.all([loadVendor("pako"), loadVendor("qrcode")]);
  } catch {
    // QR / share link will degrade silently; preview still useful.
  }

  const shareUrl = buildShareUrl(lastResult) || location.href;
  const overlay = document.createElement("div");
  overlay.id = "pdf-preview";
  overlay.className = "pdf-preview-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", t("pdf_cover_title"));
  overlay.innerHTML = renderPdfPreview(lastResult, shareUrl);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('[data-action="close-pdf"]')?.addEventListener("click", close);
  overlay.querySelector('[data-action="print-pdf"]')?.addEventListener("click", () => {
    overlay.classList.add("printing");
    window.print();
    setTimeout(() => overlay.classList.remove("printing"), 1500);
  });
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
}

function renderPdfPreview(result, shareUrl) {
  const protocol = result.protocol || {};
  const decision = protocol.investment_decision;
  const faith = protocol.faithfulness || {};
  const audit = protocol.audit || {};
  const trustScore = computeTrustScore(result);
  const verdict = classifyTrust(trustScore);
  const totalClaims = faith.total_claims || (result.citations?.length ?? 0);
  const groundedClaims = faith.grounded_claims || 0;
  const sources = result.all_sources || [];
  const generatedAt = getResultGeneratedAt(result);
  const dataMode = getDataModeInfo(result);
  const sourceTypeSummary = [...new Set(sources.map((s) => s.source_type).filter(Boolean))].join(" / ") || "—";

  const masterQr = buildQrSvg(shareUrl, 4);
  const footerQr = buildQrSvg(shareUrl, 2);

  const sourcesHtml = sources
    .map((src) => {
      const tier = getSourceTier(src.source_type);
      const tierLabel = t(tier.label_key);
      const stars = "★".repeat(tier.stars) + "☆".repeat(5 - tier.stars);
      const qrTarget = src.url || `${shareUrl}#src=${encodeURIComponent(src.source_id)}`;
      const qr = buildQrSvg(qrTarget, 2);
      return `
        <div class="pdf-source">
          <div class="pdf-source-main">
            <div class="pdf-source-head">
              <span class="pdf-source-id">${esc(src.source_id)}</span>
              <span class="pdf-source-tier" style="--tier-color:${tier.color}">${esc(tierLabel)}</span>
              <span class="pdf-source-stars" style="color:${tier.color}">${stars}</span>
            </div>
            <div class="pdf-source-title">${esc(src.title || "")}</div>
            <div class="pdf-source-excerpt">${esc((src.excerpt || "").slice(0, 240))}</div>
            ${src.url ? `<div class="pdf-source-url">${esc(src.url)}</div>` : ""}
          </div>
          <div class="pdf-source-qr">
            ${qr}
            <span class="pdf-qr-caption">${esc(t("pdf_qr_caption"))}</span>
          </div>
        </div>`;
    })
    .join("");

  const citationHtml = (result.citations || [])
    .map((cite, i) => {
      const detail = (faith.claim_details || []).find((c) => c.claim === cite.claim);
      const grounded = detail ? detail.grounded : true;
      return `
        <div class="pdf-claim ${grounded ? "ok" : "bad"}">
          <span class="pdf-claim-badge">${grounded ? "✓" : "✗"}</span>
          <span class="pdf-claim-num">${String(i + 1).padStart(2, "0")}</span>
          <span class="pdf-claim-text">${esc(formatDisplayText(cite.claim))}</span>
          <span class="pdf-claim-srcs">${(cite.source_ids || []).map((id) => `[${esc(id)}]`).join(" ")}</span>
        </div>`;
    })
    .join("");

  return `
    <div class="pdf-preview-toolbar no-print">
      <span class="pdf-preview-title">PDF Preview</span>
      <div class="pdf-preview-actions">
        <button type="button" class="btn-outline" data-action="print-pdf">🖨 ${esc(t("pdf_print_btn"))}</button>
        <button type="button" class="btn-ghost" data-action="close-pdf">✕ ${esc(t("pdf_close_btn"))}</button>
      </div>
    </div>
    <div class="pdf-paper" id="pdf-paper">
      <div class="pdf-watermark">${esc(dataMode.label)}</div>
      <header class="pdf-cover">
        <div class="pdf-brand">
          <div class="pdf-brand-mark">T</div>
          <div>
            <div class="pdf-brand-name">${esc(t("pdf_cover_title"))}</div>
            <div class="pdf-brand-sub">${esc(t("pdf_cover_sub"))}</div>
          </div>
        </div>
        <div class="pdf-cover-meta">
          <div><span>${esc(t("company"))}</span><strong>${esc(compactSandboxLabel(result.company || "", 64))}</strong></div>
          <div><span>${esc(t("chain_question"))}</span><strong>${esc(clampDisplayText(result.question || "", 160))}</strong></div>
          <div><span>${esc(t("pdf_generated_at"))}</span><strong>${esc(generatedAt)}</strong></div>
          <div><span>${esc(t("data_mode_label"))}</span><strong>${esc(dataMode.label)}</strong></div>
          <div><span>${esc(t("data_source_types"))}</span><strong>${esc(sourceTypeSummary)}</strong></div>
        </div>
        <div class="pdf-trust-row">
          <div class="pdf-trust-box" style="--trust-color:${verdict.color}">
            <div class="pdf-trust-score">${trustScore}<span>/100</span></div>
            <div class="pdf-trust-label">${esc(t("hero_trust_label"))}</div>
          </div>
          <div class="pdf-kpi-row">
            <div><strong>${totalClaims ? Math.round((groundedClaims / totalClaims) * 100) : 0}%</strong><span>${esc(t("hero_grounded"))}</span></div>
            <div><strong>${typeof audit.score === "number" ? Math.round(audit.score * 100) : 0}%</strong><span>${esc(t("metric_audit"))}</span></div>
            <div><strong>${sources.length}</strong><span>${esc(t("metric_sources"))}</span></div>
            <div><strong>${(protocol.risk_signals || []).length}</strong><span>${esc(t("hero_risks"))}</span></div>
          </div>
        </div>
        ${decision ? `
          <div class="pdf-decision">
            <div class="pdf-decision-rating ${decision.rating}">${esc(t(`decision_rating.${decision.rating}`) ?? decision.rating)}</div>
            <div class="pdf-decision-body">
              <div class="pdf-decision-rationale">${esc(decision.rationale || "")}</div>
              <div class="pdf-decision-meta">${esc(t("decision_monitoring"))}: ${(decision.monitoring_indicators || []).map((m) => esc(m)).join(" · ")}</div>
            </div>
          </div>` : ""}
        <div class="pdf-cover-qr">
          ${masterQr}
          <div class="pdf-qr-caption">${esc(t("pdf_share_qr_caption"))}</div>
        </div>
      </header>

      <section class="pdf-section">
        <h2>${esc(t("conclusion_label"))}</h2>
        <div class="pdf-prose">${renderMarkdown(result.conclusion || "")}</div>
      </section>

      ${citationHtml ? `
      <section class="pdf-section">
        <h2>${esc(locale === "zh" ? "逐条接地核查" : "Per-claim grounding check")}</h2>
        <div class="pdf-claims">${citationHtml}</div>
      </section>` : ""}

      <section class="pdf-section">
        <h2>${esc(t("chain_sources"))}</h2>
        <div class="pdf-sources">${sourcesHtml}</div>
      </section>

      <footer class="pdf-footer">
        <div class="pdf-footer-qr">${footerQr}</div>
        <div class="pdf-footer-text">
          <div>${esc(t("pdf_share_qr_caption"))}</div>
          <div class="pdf-footer-url">${esc(shareUrl.length > 110 ? shareUrl.slice(0, 110) + "…" : shareUrl)}</div>
        </div>
      </footer>
    </div>`;
}

function exportMarkdownReport() {
  if (!lastResult) return;
  const md = buildMarkdownReport(lastResult);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tracemind_research_report.md";
  a.click();
  URL.revokeObjectURL(url);
}

function buildMarkdownReport(result) {
  const protocol = result.protocol || {};
  const audit = protocol.audit || {};
  const faith = protocol.faithfulness || {};
  const metrics = protocol.financial_metrics || [];
  const risks = protocol.risk_signals || [];
  const decision = protocol.investment_decision || {};
  const benchmarks = protocol.industry_benchmarks || [];
  const lines = [
    `# TraceMind Research Report`,
    ``,
    `## ${t("chain_question")}`,
    result.question || "",
    ``,
    `## ${t("chain_answer")}`,
    result.conclusion || "",
    ``,
    `## ${t("chain_quality")}`,
    `- ${t("tab_audit")}: ${audit.score != null ? Math.round(audit.score * 100) + "%" : "—"}`,
    `- ${t("faithfulness")}: ${faith.score != null ? Math.round(faith.score * 100) + "%" : "—"}`,
    `- ${t("metric_confidence")}: ${t(`confidence.${protocol.confidence}`) ?? protocol.confidence ?? "—"}`,
    ``,
    `## ${t("decision_title")}`,
    `- ${t("decision_rating.${decision.rating}") ?? decision.rating ?? "—"} / ${t(`confidence.${decision.confidence}`) ?? decision.confidence ?? "—"}`,
    `- ${decision.rationale || ""}`,
    ...((decision.monitoring_indicators || []).map((item) => `- ${item}`)),
    ``,
    `## ${t("chain_trace")}`,
    ...(result.steps || []).map((step) => `- Step ${step.step_number}: \`${step.action}\` — ${step.thought}`),
    ``,
    `## ${t("chain_financials")}`,
    ...metrics.map((m) => `- ${t(`financial_metric.${m.metric_id}`) ?? m.metric_id}: ${m.unit === "percent" ? `${m.value}%` : formatCompactNumber(m.value, m.unit)} (${m.source_id})`),
    ``,
    `## ${t("chain_risks")}`,
    ...risks.map((r) => `- ${t(`risk_signal.${r.risk_id}`) ?? r.risk_id}: ${t(`risk_severity.${r.severity}`) ?? r.severity}, ${Math.round((r.score || 0) * 100)}% (${(r.source_ids || []).join(", ")})`),
    ``,
    `## ${t("benchmark_title")}`,
    `| Company | ${t("benchmark_revenue")} | ${t("benchmark_margin")} | ${t("benchmark_rd")} | ${t("benchmark_debt")} | Note |`,
    `|---|---:|---:|---:|---:|---|`,
    ...benchmarks.map((b) => `| ${b.name} | ${b.revenue_billion} | ${b.net_margin}% | ${b.rd_ratio}% | ${b.debt_to_asset_ratio}% | ${b.note || ""} |`),
    ``,
    `## ${t("chain_claims")}`,
    ...(result.citations || []).map((c, i) => `${i + 1}. ${c.claim} [${c.source_ids.join(", ")}]`),
    ``,
    `## ${t("chain_sources")}`,
    ...(result.all_sources || []).map((s) => `- \`${s.source_id}\` ${s.title}: ${(s.excerpt || "").slice(0, 180)}`),
    ``,
  ];
  return lines.join("\n");
}

// ── Language ──────────────────────────────────────────────────────────────────
function setLocale(lang) {
  locale = lang;
  Storage.setLocale(lang);
  $$(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
  applyI18n();
  loadConfig();
  if (lastResult) renderResults(lastResult);
  renderHistory();
  renderCachedGrid();
}

function setTheme(nextTheme) {
  theme = ["violet", "aurum", "light"].includes(nextTheme) ? nextTheme : "violet";
  document.documentElement.dataset.theme = theme;
  Storage.setTheme(theme);
  $$(".theme-btn").forEach((b) => b.classList.toggle("active", b.dataset.theme === theme));
}

function applyPreset(name) {
  els.company.value = name === "market" ? t("market_company") : t("default_company");
  els.question.value = name === "market" ? t("market_question") : t("default_question");
  els.company.dataset.auto = "0";
  els.question.dataset.auto = "0";
  clearError();
}

// ── Cached real-company samples (no backend / no API key needed) ──────────────
let CACHED_INDEX = null;

const COMPANY_GLYPHS = {
  "kweichow-moutai": { glyph: "茅", tone: "#c89758" },
  catl: { glyph: "C", tone: "#4ade80" },
  nvidia: { glyph: "N", tone: "#76b900" },
  byd: { glyph: "B", tone: "#e2392f" },
  cmb: { glyph: "招", tone: "#a3260a" },
};

async function loadCachedIndex() {
  if (CACHED_INDEX) return CACHED_INDEX;
  try {
    const res = await fetch("/assets/cached/index.json", { cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    CACHED_INDEX = Array.isArray(data?.companies) ? data.companies : [];
  } catch (err) {
    console.warn("cached index load failed", err);
    CACHED_INDEX = [];
  }
  return CACHED_INDEX;
}

async function renderCachedGrid() {
  const grid = $("#cached-grid");
  if (!grid) return;
  const companies = await loadCachedIndex();
  if (!companies.length) {
    grid.innerHTML = `<div class="cached-empty">—</div>`;
    els.compareOpenBtn?.classList.add("hidden");
    return;
  }
  if (companies.length >= 2) {
    els.compareOpenBtn?.classList.remove("hidden");
  }
  grid.innerHTML = companies
    .map((c) => {
      const glyph = COMPANY_GLYPHS[c.slug] || { glyph: c.company.slice(0, 1), tone: "#7c8cff" };
      const name = locale === "en" ? c.company_en || c.company : c.company;
      const industry = locale === "en" ? c.industry_en || c.industry : c.industry;
      const metric = locale === "en" ? c.headline_metric_en || c.headline_metric : c.headline_metric;
      return `
        <button type="button" class="cached-card" data-slug="${esc(c.slug)}" style="--tone:${glyph.tone}">
          <span class="cached-card-glyph" style="background:${glyph.tone}">${esc(glyph.glyph)}</span>
          <span class="cached-card-body">
            <span class="cached-card-name">${esc(name)}</span>
            <span class="cached-card-industry">${esc(industry || "")}</span>
            ${metric ? `<span class="cached-card-metric">${esc(metric)}</span>` : ""}
          </span>
          <span class="cached-card-arrow">→</span>
        </button>`;
    })
    .join("");

  grid.querySelectorAll(".cached-card").forEach((btn) => {
    btn.addEventListener("click", () => loadCachedCompany(btn.dataset.slug, btn));
  });
}

// ── Mobile sidebar drawer (toggle + autoclose on action / route change) ─────
function installMobileSidebar() {
  const toggle = $("#mobile-sidebar-toggle");
  const scrim = $("#mobile-sidebar-scrim");
  if (!toggle || !scrim) return;

  const setOpen = (open) => {
    document.body.classList.toggle("sidebar-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? t("close_overlay") : "打开侧边栏");
  };

  toggle.addEventListener("click", () => {
    setOpen(!document.body.classList.contains("sidebar-open"));
  });
  scrim.addEventListener("click", () => setOpen(false));

  // Auto-close after picking a sample / preset / running research on mobile.
  const autoCloseTargets = [
    "#cached-grid",
    "#run-btn",
    ".preset-btn",
  ];
  autoCloseTargets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((node) => {
      node.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 820px)").matches) setOpen(false);
      }, { capture: true });
    });
  });

  // Re-bind whenever sample grid re-renders.
  const cachedHost = $("#cached-grid");
  if (cachedHost) {
    new MutationObserver(() => {
      cachedHost.querySelectorAll(".cached-card").forEach((card) => {
        if (card.dataset.mobileBound) return;
        card.dataset.mobileBound = "1";
        card.addEventListener("click", () => {
          if (window.matchMedia("(max-width: 820px)").matches) setOpen(false);
        }, { capture: true });
      });
    }).observe(cachedHost, { childList: true, subtree: false });
  }

  // Escape closes drawer too.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("sidebar-open")) {
      setOpen(false);
    }
  });
}

// ── Keyboard shortcuts (⌘K focus query · ⌘↵ run · Esc close · ? help) ───────
const KBD_SHORTCUTS = [
  { keys: ["⌘", "K"], pcKeys: ["Ctrl", "K"], action: "focus_company", labelKey: "shortcut_focus" },
  { keys: ["⌘", "↵"], pcKeys: ["Ctrl", "↵"], action: "run_research", labelKey: "shortcut_run" },
  { keys: ["Esc"], pcKeys: ["Esc"], action: "close_overlay", labelKey: "shortcut_close" },
  { keys: ["g", "h"], pcKeys: ["g", "h"], action: "go_history", labelKey: "shortcut_go_history" },
  { keys: ["g", "i"], pcKeys: ["g", "i"], action: "go_insights", labelKey: "shortcut_go_insights" },
  { keys: ["?"], pcKeys: ["?"], action: "show_help", labelKey: "shortcut_help" },
];

let kbdSequence = null;
let kbdSequenceTimer = null;

function isTypingTarget(target) {
  if (!target) return false;
  const tag = (target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

function installKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const meta = e.metaKey || e.ctrlKey;

    if (e.key === "Escape") {
      if ($("#kbd-help-overlay")) { closeKbdHelp(); return; }
      if ($("#compare-overlay")) { closeCompareDrawer(); return; }
      if ($("#pdf-preview")) { document.getElementById("pdf-preview").remove(); return; }
      if (activeResearchController) { cancelActiveResearch(); return; }
    }

    if (meta && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      els.company?.focus();
      els.company?.select?.();
      return;
    }

    if (meta && (e.key === "Enter" || e.key === "Return")) {
      e.preventDefault();
      runResearch();
      return;
    }

    if (isTypingTarget(e.target)) return;

    if (e.key === "?" && !meta) {
      e.preventDefault();
      openKbdHelp();
      return;
    }

    if (e.key === "g" && !meta) {
      kbdSequence = "g";
      if (kbdSequenceTimer) clearTimeout(kbdSequenceTimer);
      kbdSequenceTimer = setTimeout(() => { kbdSequence = null; }, 900);
      return;
    }
    if (kbdSequence === "g" && !meta) {
      kbdSequence = null;
      if (kbdSequenceTimer) { clearTimeout(kbdSequenceTimer); kbdSequenceTimer = null; }
      const map = { h: "history", i: "insights", e: "evidence", r: "reasoning", k: "graph" };
      const target = map[e.key.toLowerCase()];
      if (target) {
        e.preventDefault();
        activateTab(target);
      }
    }
  });
}

function openKbdHelp() {
  closeKbdHelp();
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const overlay = document.createElement("div");
  overlay.id = "kbd-help-overlay";
  overlay.className = "kbd-help-overlay";
  overlay.innerHTML = `
    <div class="kbd-help-shell" role="dialog" aria-modal="true" aria-labelledby="kbd-help-title">
      <div class="kbd-help-head">
        <div>
          <div id="kbd-help-title" class="kbd-help-title">${esc(t("shortcut_panel_title"))}</div>
          <div class="kbd-help-sub">${esc(t("shortcut_panel_sub"))}</div>
        </div>
        <button type="button" class="kbd-help-close" data-action="close" aria-label="${esc(t("close_overlay"))}">✕</button>
      </div>
      <div class="kbd-help-body">
        ${KBD_SHORTCUTS.map((s) => {
          const keys = isMac ? s.keys : s.pcKeys;
          const kbds = keys.map((k) => `<kbd>${esc(k)}</kbd>`).join('<span class="kbd-plus">+</span>');
          return `<div class="kbd-row"><div class="kbd-keys">${kbds}</div><div class="kbd-label">${esc(t(s.labelKey))}</div></div>`;
        }).join("")}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeKbdHelp(); });
  overlay.querySelector('[data-action="close"]').addEventListener("click", closeKbdHelp);
}

function closeKbdHelp() {
  document.getElementById("kbd-help-overlay")?.remove();
}

// ── Compare drawer (side-by-side cached companies) ───────────────────────────
const CACHED_RESULT_MEMO = new Map();

async function getCachedResult(slug) {
  if (!slug) return null;
  if (CACHED_RESULT_MEMO.has(slug)) return CACHED_RESULT_MEMO.get(slug);
  const res = await fetch(`/assets/cached/${slug}.json`, { cache: "force-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  CACHED_RESULT_MEMO.set(slug, data);
  return data;
}

let compareState = { slugA: null, slugB: null };

async function openCompareDrawer() {
  const companies = await loadCachedIndex();
  if (companies.length < 2) return;

  if (!compareState.slugA) compareState.slugA = companies[0].slug;
  if (!compareState.slugB || compareState.slugB === compareState.slugA) {
    compareState.slugB = companies.find((c) => c.slug !== compareState.slugA)?.slug || companies[1].slug;
  }

  let overlay = $("#compare-overlay");
  if (overlay) overlay.remove();
  overlay = document.createElement("div");
  overlay.id = "compare-overlay";
  overlay.className = "compare-overlay";
  overlay.innerHTML = `
    <div class="compare-shell" role="dialog" aria-modal="true" aria-labelledby="compare-title">
      <header class="compare-shell-head">
        <div class="compare-shell-title-block">
          <div id="compare-title" class="compare-shell-title">${esc(t("compare_title"))}</div>
          <div class="compare-shell-sub">${esc(t("compare_subtitle"))}</div>
        </div>
        <button type="button" class="compare-shell-close" data-action="close" aria-label="${esc(t("close_overlay"))}">✕</button>
      </header>
      <div class="compare-pickers">
        <div class="compare-picker">
          <label>${esc(t("compare_left"))}</label>
          <select id="compare-select-a">${buildCompareOptions(companies, compareState.slugA)}</select>
        </div>
        <div class="compare-vs" aria-hidden="true">vs</div>
        <div class="compare-picker">
          <label>${esc(t("compare_right"))}</label>
          <select id="compare-select-b">${buildCompareOptions(companies, compareState.slugB)}</select>
        </div>
      </div>
      <div class="compare-body" id="compare-body">
        <div class="compare-loading">${esc(t("compare_loading"))}</div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeCompareDrawer();
  });
  overlay.querySelector('[data-action="close"]').addEventListener("click", closeCompareDrawer);
  overlay.querySelector("#compare-select-a").addEventListener("change", (e) => {
    compareState.slugA = e.target.value;
    refreshCompareBody();
  });
  overlay.querySelector("#compare-select-b").addEventListener("change", (e) => {
    compareState.slugB = e.target.value;
    refreshCompareBody();
  });

  refreshCompareBody();
}

function buildCompareOptions(companies, selectedSlug) {
  return companies
    .map((c) => {
      const name = locale === "en" ? c.company_en || c.company : c.company;
      const industry = locale === "en" ? c.industry_en || c.industry : c.industry;
      const isSel = c.slug === selectedSlug ? " selected" : "";
      return `<option value="${esc(c.slug)}"${isSel}>${esc(name)} · ${esc(industry || "")}</option>`;
    })
    .join("");
}

async function refreshCompareBody() {
  const body = $("#compare-body");
  if (!body) return;
  body.innerHTML = `<div class="compare-loading">${esc(t("compare_loading"))}</div>`;
  try {
    const [rA, rB] = await Promise.all([
      getCachedResult(compareState.slugA),
      getCachedResult(compareState.slugB),
    ]);
    body.innerHTML = renderCompareBody(rA, rB);
  } catch (err) {
    body.innerHTML = `<div class="compare-loading error">${esc(err.message)}</div>`;
  }
}

function closeCompareDrawer() {
  const overlay = $("#compare-overlay");
  if (overlay) overlay.remove();
}

function compareNumberDiff(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (a === b) return { tag: t("compare_diff_equal"), tone: "neutral" };
  return a > b
    ? { tag: t("compare_diff_higher"), tone: "up" }
    : { tag: t("compare_diff_lower"), tone: "down" };
}

function renderCompareBody(rA, rB) {
  const sameWarn = compareState.slugA === compareState.slugB
    ? `<div class="compare-warning">${esc(t("compare_same_warning"))}</div>`
    : "";

  const protoA = rA.protocol || {};
  const protoB = rB.protocol || {};
  const trustA = computeTrustScore(rA);
  const trustB = computeTrustScore(rB);
  const finA = byId(protoA.financial_metrics);
  const finB = byId(protoB.financial_metrics);
  const risksA = protoA.risk_signals || [];
  const risksB = protoB.risk_signals || [];
  const decisionA = protoA.investment_decision || {};
  const decisionB = protoB.investment_decision || {};
  const groundedA = computeGroundedPct(protoA);
  const groundedB = computeGroundedPct(protoB);

  const rows = [
    {
      key: "trust",
      label: t("compare_metric_trust"),
      a: { display: `${trustA}/100`, num: trustA },
      b: { display: `${trustB}/100`, num: trustB },
      higherBetter: true,
    },
    {
      key: "decision",
      label: t("compare_metric_decision"),
      a: { display: ratingLabel(decisionA.rating), tone: ratingTone(decisionA.rating) },
      b: { display: ratingLabel(decisionB.rating), tone: ratingTone(decisionB.rating) },
    },
    {
      key: "revenue",
      label: t("compare_metric_revenue"),
      a: financeCell(finA.revenue),
      b: financeCell(finB.revenue),
      higherBetter: true,
    },
    {
      key: "net_profit",
      label: t("compare_metric_net_profit"),
      a: financeCell(finA.net_profit),
      b: financeCell(finB.net_profit),
      higherBetter: true,
    },
    {
      key: "rd",
      label: t("compare_metric_rd"),
      a: financeCell(finA.rd_expense),
      b: financeCell(finB.rd_expense),
      higherBetter: true,
    },
    {
      key: "risks",
      label: t("compare_metric_risks"),
      a: { display: `${risksA.length}`, num: risksA.length },
      b: { display: `${risksB.length}`, num: risksB.length },
      higherBetter: false,
    },
    {
      key: "grounded",
      label: t("compare_metric_grounded"),
      a: { display: `${groundedA}%`, num: groundedA },
      b: { display: `${groundedB}%`, num: groundedB },
      higherBetter: true,
    },
    {
      key: "sources",
      label: t("compare_metric_sources"),
      a: { display: `${(rA.all_sources || []).length}`, num: (rA.all_sources || []).length },
      b: { display: `${(rB.all_sources || []).length}`, num: (rB.all_sources || []).length },
      higherBetter: true,
    },
  ];

  const nameA = locale === "en" ? rA.company : rA.company;
  const nameB = locale === "en" ? rB.company : rB.company;

  const headerHtml = `
    <div class="compare-cards">
      <div class="compare-card-pane">
        <div class="compare-card-head">
          <span class="compare-card-eyebrow">${esc(t("compare_left"))}</span>
          <span class="compare-card-name">${esc(nameA)}</span>
          <span class="compare-card-meta">${esc(rA.industry || "")} · ${esc(rA.headline_metric || "")}</span>
        </div>
      </div>
      <div class="compare-card-pane">
        <div class="compare-card-head">
          <span class="compare-card-eyebrow">${esc(t("compare_right"))}</span>
          <span class="compare-card-name">${esc(nameB)}</span>
          <span class="compare-card-meta">${esc(rB.industry || "")} · ${esc(rB.headline_metric || "")}</span>
        </div>
      </div>
    </div>`;

  const tableRows = rows
    .map((r) => {
      const diff = compareNumberDiff(r.a.num, r.b.num);
      const arrow = !diff
        ? ""
        : diff.tone === "up"
          ? r.higherBetter === false ? "↑ ⚠" : "↑"
          : diff.tone === "down"
            ? r.higherBetter === false ? "↓ ✓" : "↓"
            : "=";
      const arrowTone = diff
        ? (diff.tone === "neutral" ? "neutral" : r.higherBetter === false ? (diff.tone === "up" ? "warn" : "good") : (diff.tone === "up" ? "good" : "warn"))
        : "neutral";
      return `
        <div class="compare-row">
          <div class="compare-row-label">${esc(r.label)}</div>
          <div class="compare-row-cell ${r.a.tone || ""}">${r.a.display}</div>
          <div class="compare-row-diff ${arrowTone}">${esc(arrow)}</div>
          <div class="compare-row-cell ${r.b.tone || ""}">${r.b.display}</div>
        </div>`;
    })
    .join("");

  const thesisA = (decisionA.rationale || "").slice(0, 220) || "—";
  const thesisB = (decisionB.rationale || "").slice(0, 220) || "—";
  const monitorA = (decisionA.monitoring_indicators || []).slice(0, 4);
  const monitorB = (decisionB.monitoring_indicators || []).slice(0, 4);

  const thesisHtml = `
    <div class="compare-section">
      <div class="compare-section-head">${esc(t("compare_section_thesis"))}</div>
      <div class="compare-section-grid">
        <div class="compare-section-cell">${esc(thesisA)}</div>
        <div class="compare-section-cell">${esc(thesisB)}</div>
      </div>
    </div>
    <div class="compare-section">
      <div class="compare-section-head">${esc(t("compare_section_monitor"))}</div>
      <div class="compare-section-grid">
        <div class="compare-section-cell">
          ${monitorA.length ? monitorA.map((m) => `<span class="compare-chip">${esc(m)}</span>`).join("") : "—"}
        </div>
        <div class="compare-section-cell">
          ${monitorB.length ? monitorB.map((m) => `<span class="compare-chip">${esc(m)}</span>`).join("") : "—"}
        </div>
      </div>
    </div>`;

  return sameWarn + headerHtml + `<div class="compare-table">${tableRows}</div>` + thesisHtml;
}

function byId(metricsList) {
  const out = {};
  (metricsList || []).forEach((m) => {
    if (m && m.metric_id) out[m.metric_id] = m;
  });
  return out;
}

function financeCell(metric) {
  if (!metric || !Number.isFinite(Number(metric.value))) return { display: "—", num: null };
  const num = Number(metric.value);
  return { display: formatBigNumber(num, metric.unit), num };
}

function ratingLabel(rating) {
  if (!rating) return "—";
  return t(`decision_rating.${rating}`) || rating;
}

function ratingTone(rating) {
  if (rating === "positive") return "good";
  if (rating === "cautious") return "warn";
  return "neutral";
}

function computeGroundedPct(protocol) {
  if (!protocol) return 0;
  const details = protocol.faithfulness?.claim_details || [];
  if (!details.length) return 0;
  const grounded = details.filter((d) => d.grounded).length;
  return Math.round((grounded / details.length) * 100);
}

async function loadCachedCompany(slug, btn) {
  if (!slug) return;
  if (btn) btn.classList.add("loading");
  try {
    const res = await fetch(`/assets/cached/${slug}.json`, { cache: "force-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    clearError();
    els.company.value = result.company || "";
    els.question.value = result.question || "";
    els.company.dataset.auto = "0";
    els.question.dataset.auto = "0";
    renderResults(result, { persist: false });
    activateTab("insights");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.warn("cached load failed", err);
    showError(formatFetchError(err, err.message));
  } finally {
    if (btn) btn.classList.remove("loading");
  }
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCompactNumber(value, unit) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? "—");
  if (unit !== "CNY") return `${num} ${unit || ""}`.trim();
  if (locale === "zh") {
    if (Math.abs(num) >= 100000000) return `${(num / 100000000).toFixed(2)} 亿`;
    if (Math.abs(num) >= 10000) return `${(num / 10000).toFixed(2)} 万`;
    return `${num.toFixed(0)} 元`;
  }
  if (Math.abs(num) >= 1000000000) return `${(num / 1000000000).toFixed(2)}B CNY`;
  if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(2)}M CNY`;
  return `${num.toFixed(0)} CNY`;
}

function trimFixed(value, digits = 2) {
  return Number(value).toFixed(digits).replace(/\.?0+$/, "");
}

function formatCnyDisplay(value) {
  const num = Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(num)) return value;
  if (locale === "zh") {
    if (Math.abs(num) >= 100000000) return `${trimFixed(num / 100000000)} 亿元`;
    if (Math.abs(num) >= 10000) return `${trimFixed(num / 10000)} 万元`;
    return `${trimFixed(num, 0)} 元`;
  }
  if (Math.abs(num) >= 1000000000) return `${trimFixed(num / 1000000000)}B CNY`;
  if (Math.abs(num) >= 1000000) return `${trimFixed(num / 1000000)}M CNY`;
  return `${trimFixed(num, 0)} CNY`;
}

function formatDisplayText(text) {
  return String(text ?? "").replace(
    /(^|[^\w.])(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d{5,}(?:\.\d+)?)\s*(元|CNY)(?![\w])/gi,
    (_, prefix, value) => `${prefix}${formatCnyDisplay(value)}`,
  );
}

window.formatDisplayText = formatDisplayText;

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const savedLocale = Storage.getLocale();
  if (savedLocale === "zh" || savedLocale === "en") locale = savedLocale;
  $$(".lang-btn").forEach((b) => b.classList.toggle("active", b.dataset.lang === locale));
  setTheme(theme);
  applyI18n();
  loadConfig();
  initTabs();
  renderHistory();
  renderCachedGrid();
  if (loadResearchHistory().length && !lastResult) {
    els.results.classList.remove("hidden");
    els.emptyState.classList.add("hidden");
    activateTab("history");
  }

  $$(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => setLocale(btn.dataset.lang));
  });
  $$(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => applyPreset(btn.dataset.preset));
  });
  $$(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });

  els.runBtn.addEventListener("click", runResearch);
  els.clearBtn.addEventListener("click", clearResults);
  els.exportBtn.addEventListener("click", exportJson);
  els.reportBtn.addEventListener("click", exportMarkdownReport);
  els.pdfBtn?.addEventListener("click", openPdfPreview);
  els.shareBtn?.addEventListener("click", copyShareLink);
  els.cancelBtn?.addEventListener("click", cancelActiveResearch);
  els.compareOpenBtn?.addEventListener("click", openCompareDrawer);
  installKeyboardShortcuts();
  installMobileSidebar();

  els.company.addEventListener("input", () => { els.company.dataset.auto = "0"; });
  els.question.addEventListener("input", () => { els.question.dataset.auto = "0"; });

  tryLoadFromHash();
  window.addEventListener("hashchange", tryLoadFromHash);
});
