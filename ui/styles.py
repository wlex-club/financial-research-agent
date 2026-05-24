from __future__ import annotations

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS — Linear / Vercel inspired
   ════════════════════════════════════════════════════════════════ */
:root {
  /* Neutral scale */
  --gray-0:  #ffffff;
  --gray-1:  #fafafa;
  --gray-2:  #f4f4f5;
  --gray-3:  #e4e4e7;
  --gray-4:  #d4d4d8;
  --gray-5:  #a1a1aa;
  --gray-6:  #71717a;
  --gray-7:  #52525b;
  --gray-8:  #3f3f46;
  --gray-9:  #27272a;
  --gray-10: #18181b;
  --gray-11: #09090b;

  /* Brand */
  --brand:        #6366f1;
  --brand-2:      #8b5cf6;
  --brand-soft:   #eef2ff;
  --brand-border: #c7d2fe;

  /* Semantic */
  --success:        #10b981;
  --success-soft:   #ecfdf5;
  --success-border: #a7f3d0;
  --success-text:   #047857;

  --warning:        #f59e0b;
  --warning-soft:   #fffbeb;
  --warning-border: #fde68a;
  --warning-text:   #b45309;

  --danger:         #ef4444;
  --danger-soft:    #fef2f2;
  --danger-border:  #fecaca;
  --danger-text:    #b91c1c;

  --info:           #3b82f6;
  --info-soft:      #eff6ff;
  --info-border:    #bfdbfe;
  --info-text:      #1d4ed8;

  /* Surfaces */
  --surface:       var(--gray-0);
  --surface-2:     var(--gray-1);
  --surface-3:     var(--gray-2);
  --border:        var(--gray-3);
  --border-strong: var(--gray-4);

  /* Text */
  --text:          var(--gray-11);
  --text-2:        var(--gray-7);
  --text-3:        var(--gray-6);
  --text-muted:    var(--gray-5);

  /* Shadows — soft Linear-style */
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.05);

  /* Radii */
  --r-xs: 6px;
  --r-sm: 8px;
  --r-md: 10px;
  --r-lg: 12px;
  --r-xl: 16px;
  --r-2xl: 20px;

  /* Easing */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}

/* ════════════════════════════════════════════════════════════════
   BASE
   ════════════════════════════════════════════════════════════════ */
* {
  box-sizing: border-box;
}

html, body, [class*="css"] {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text);
  font-feature-settings: 'cv02','cv03','cv04','cv11','ss01';
}

.stApp {
  background: var(--surface-2);
}

.block-container {
  padding-top: 1.25rem !important;
  padding-bottom: 4rem !important;
  max-width: 1240px !important;
}

header[data-testid="stHeader"] {
  background: transparent !important;
  height: 0 !important;
}
#MainMenu, footer { visibility: hidden; }
.stDeployButton { display: none !important; }

/* Hide Streamlit chrome elements */
[data-testid="stToolbar"] { display: none !important; }

/* ════════════════════════════════════════════════════════════════
   SIDEBAR — Premium dark
   ════════════════════════════════════════════════════════════════ */
section[data-testid="stSidebar"] {
  background: var(--gray-11) !important;
  border-right: 1px solid rgba(255,255,255,0.06) !important;
}

section[data-testid="stSidebar"] > div:first-child {
  padding-top: 1.5rem !important;
}

section[data-testid="stSidebar"] * {
  color: var(--gray-3) !important;
}

section[data-testid="stSidebar"] h1,
section[data-testid="stSidebar"] h2,
section[data-testid="stSidebar"] h3 {
  color: var(--gray-1) !important;
  font-weight: 600 !important;
  letter-spacing: -0.01em !important;
}

section[data-testid="stSidebar"] h3 {
  font-size: 0.7rem !important;
  text-transform: uppercase;
  letter-spacing: 0.08em !important;
  color: var(--gray-5) !important;
  font-weight: 600 !important;
  margin-top: 1.25rem !important;
  margin-bottom: 0.6rem !important;
}

section[data-testid="stSidebar"] label {
  font-size: 0.78rem !important;
  font-weight: 500 !important;
  color: var(--gray-4) !important;
  margin-bottom: 0.3rem !important;
}

section[data-testid="stSidebar"] .stTextInput input,
section[data-testid="stSidebar"] .stTextArea textarea {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: var(--r-md) !important;
  color: var(--gray-1) !important;
  font-size: 0.85rem !important;
  padding: 0.55rem 0.7rem !important;
  transition: all 0.2s var(--ease);
}

section[data-testid="stSidebar"] .stTextInput input:hover,
section[data-testid="stSidebar"] .stTextArea textarea:hover {
  background: rgba(255,255,255,0.06) !important;
  border-color: rgba(255,255,255,0.12) !important;
}

section[data-testid="stSidebar"] .stTextInput input:focus,
section[data-testid="stSidebar"] .stTextArea textarea:focus {
  background: rgba(255,255,255,0.07) !important;
  border-color: var(--brand) !important;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.18) !important;
  outline: none !important;
}

/* Sidebar primary button */
section[data-testid="stSidebar"] .stButton > button[kind="primary"] {
  background: var(--gray-1) !important;
  color: var(--gray-11) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  border-radius: var(--r-md) !important;
  font-weight: 600 !important;
  font-size: 0.85rem !important;
  padding: 0.55rem 1rem !important;
  letter-spacing: -0.01em !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, var(--shadow-sm) !important;
  transition: all 0.15s var(--ease) !important;
}

section[data-testid="stSidebar"] .stButton > button[kind="primary"]:hover {
  background: var(--gray-0) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 1px 0 rgba(255,255,255,0.1) inset, var(--shadow-md) !important;
}

section[data-testid="stSidebar"] .stButton > button[kind="primary"]:active {
  transform: translateY(0) !important;
}

/* Sidebar secondary button (clear) */
section[data-testid="stSidebar"] .stButton > button:not([kind="primary"]) {
  background: rgba(255,255,255,0.04) !important;
  color: var(--gray-4) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: var(--r-md) !important;
  font-weight: 500 !important;
  padding: 0.55rem !important;
  transition: all 0.15s var(--ease) !important;
}

section[data-testid="stSidebar"] .stButton > button:not([kind="primary"]):hover {
  background: rgba(255,255,255,0.08) !important;
  color: var(--gray-1) !important;
  border-color: rgba(255,255,255,0.15) !important;
}

/* Sidebar radio (language) */
section[data-testid="stSidebar"] [role="radiogroup"] {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
  border-radius: var(--r-md) !important;
  padding: 0.2rem !important;
  display: flex !important;
  gap: 0.15rem !important;
}

section[data-testid="stSidebar"] [role="radiogroup"] label {
  flex: 1 !important;
  margin: 0 !important;
  padding: 0.4rem 0.6rem !important;
  border-radius: var(--r-sm) !important;
  text-align: center !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.15s var(--ease) !important;
  background: transparent !important;
}

section[data-testid="stSidebar"] [role="radiogroup"] label:has(input:checked) {
  background: var(--brand) !important;
  color: white !important;
  box-shadow: var(--shadow-sm) !important;
}

section[data-testid="stSidebar"] [role="radiogroup"] label:has(input:checked) * {
  color: white !important;
}

section[data-testid="stSidebar"] [role="radiogroup"] label > div:first-child {
  display: none !important;
}

section[data-testid="stSidebar"] hr {
  border-color: rgba(255,255,255,0.06) !important;
  margin: 1.25rem 0 !important;
}

/* ════════════════════════════════════════════════════════════════
   TOP BAR (replaces hero with refined nav)
   ════════════════════════════════════════════════════════════════ */
.fra-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0 1.25rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
  animation: fadeInDown 0.4s var(--ease);
}

.fra-brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.fra-brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
  box-shadow: 0 2px 8px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
}

.fra-brand-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.fra-brand-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.fra-brand-tag {
  font-size: 0.72rem;
  color: var(--text-3);
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.fra-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fra-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 500;
  border: 1px solid;
  letter-spacing: -0.005em;
  font-feature-settings: 'tnum';
}

.fra-status-pill.demo {
  background: var(--warning-soft);
  color: var(--warning-text);
  border-color: var(--warning-border);
}

.fra-status-pill.live {
  background: var(--success-soft);
  color: var(--success-text);
  border-color: var(--success-border);
}

.fra-status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  box-shadow: 0 0 0 2px currentColor;
  opacity: 0.4;
}

.fra-status-pill.live .dot {
  animation: pulse 2s var(--ease) infinite;
}

/* ════════════════════════════════════════════════════════════════
   PAGE TITLE
   ════════════════════════════════════════════════════════════════ */
.fra-page-title {
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.5s var(--ease) 0.05s backwards;
}

.fra-page-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.025em;
  line-height: 1.15;
  margin: 0 0 0.4rem;
}

.fra-page-title p {
  font-size: 0.92rem;
  color: var(--text-2);
  margin: 0;
  letter-spacing: -0.005em;
}

/* ════════════════════════════════════════════════════════════════
   METRICS — Linear-style cards
   ════════════════════════════════════════════════════════════════ */
.fra-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  animation: fadeInUp 0.5s var(--ease) 0.1s backwards;
}

.fra-metric {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 1rem 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  transition: all 0.2s var(--ease);
  position: relative;
  overflow: hidden;
}

.fra-metric:hover {
  border-color: var(--border-strong);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.fra-metric::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--brand-soft), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.fra-metric.has-data::before { opacity: 1; }

.fra-metric-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--r-sm);
  background: var(--gray-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.fra-metric.has-data .fra-metric-icon {
  background: var(--brand-soft);
  color: var(--brand);
}

.fra-metric-content {
  flex: 1;
  min-width: 0;
}

.fra-metric-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  font-weight: 600;
  margin-bottom: 0.15rem;
}

.fra-metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  line-height: 1;
  font-feature-settings: 'tnum';
}

/* ════════════════════════════════════════════════════════════════
   SECTIONS
   ════════════════════════════════════════════════════════════════ */
.fra-sec {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-2);
  margin: 0.5rem 0 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.fra-sec::before {
  content: "";
  width: 12px;
  height: 1px;
  background: var(--border-strong);
}

/* ════════════════════════════════════════════════════════════════
   CONCLUSION
   ════════════════════════════════════════════════════════════════ */
.fra-conclusion {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 1.4rem 1.6rem;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.5s var(--ease);
}

.fra-conclusion::before {
  content: "";
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--brand), var(--brand-2));
}

.fra-conclusion-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--brand);
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.fra-conclusion-text {
  font-size: 0.98rem;
  color: var(--text);
  line-height: 1.7;
  letter-spacing: -0.005em;
}

/* ════════════════════════════════════════════════════════════════
   CITATIONS
   ════════════════════════════════════════════════════════════════ */
.fra-cite {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 1rem 1.15rem;
  margin-bottom: 0.6rem;
  transition: all 0.2s var(--ease);
  animation: fadeInUp 0.4s var(--ease) backwards;
}

.fra-cite:hover {
  border-color: var(--brand-border);
  box-shadow: var(--shadow-sm);
}

.fra-cite:nth-child(1) { animation-delay: 0.05s; }
.fra-cite:nth-child(2) { animation-delay: 0.1s; }
.fra-cite:nth-child(3) { animation-delay: 0.15s; }
.fra-cite:nth-child(4) { animation-delay: 0.2s; }

.fra-cite-claim {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  margin-bottom: 0.6rem;
}

.fra-cite-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 0.72rem;
  font-weight: 700;
  font-feature-settings: 'tnum';
  margin-top: 1px;
}

.fra-cite-text {
  flex: 1;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text);
  line-height: 1.55;
  letter-spacing: -0.005em;
}

.fra-source-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  padding-left: 2.05rem;
}

.fra-source-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  background: var(--gray-2);
  color: var(--text-2);
  border: 1px solid var(--border);
  border-radius: var(--r-xs);
  padding: 0.18rem 0.5rem;
  font-weight: 500;
  transition: all 0.15s var(--ease);
}

.fra-source-tag:hover {
  background: var(--brand-soft);
  color: var(--brand);
  border-color: var(--brand-border);
}

/* ════════════════════════════════════════════════════════════════
   STEPS — Refined timeline
   ════════════════════════════════════════════════════════════════ */
.fra-step-thought {
  font-size: 0.92rem;
  color: var(--text);
  line-height: 1.65;
  letter-spacing: -0.005em;
  padding: 0.75rem 0 1rem;
}

.fra-step-thought strong {
  font-weight: 600;
  color: var(--text);
  margin-right: 0.35rem;
}

.fra-sub-block {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 0.75rem 0.9rem;
  margin-bottom: 0.5rem;
}

.fra-sub-label {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3);
  margin-bottom: 0.4rem;
}

.fra-sub-block pre {
  margin: 0;
}

.fra-sub-block code,
.fra-sub-block pre {
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.78rem !important;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-2);
  background: transparent !important;
  font-feature-settings: 'tnum';
  line-height: 1.55;
}

/* Streamlit expander → step card */
details[data-testid="stExpander"] {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--r-lg) !important;
  box-shadow: none !important;
  margin-bottom: 0.5rem !important;
  transition: all 0.2s var(--ease) !important;
  overflow: hidden;
}

details[data-testid="stExpander"]:hover {
  border-color: var(--border-strong) !important;
}

details[data-testid="stExpander"][open] {
  box-shadow: var(--shadow-sm) !important;
  border-color: var(--brand-border) !important;
}

details[data-testid="stExpander"] summary {
  font-size: 0.88rem !important;
  font-weight: 500 !important;
  color: var(--text) !important;
  padding: 0.85rem 1.15rem !important;
  letter-spacing: -0.005em !important;
  cursor: pointer !important;
  list-style: none !important;
  display: flex !important;
  align-items: center !important;
  gap: 0.6rem !important;
}

details[data-testid="stExpander"] summary::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--brand);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px var(--brand-soft);
}

details[data-testid="stExpander"] > div {
  padding: 0 1.15rem 1.15rem !important;
  border-top: 1px solid var(--border);
}

/* ════════════════════════════════════════════════════════════════
   SOURCE CARDS — Premium grid
   ════════════════════════════════════════════════════════════════ */
.fra-src-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.85rem;
}

.fra-src-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  transition: all 0.2s var(--ease);
  animation: fadeInUp 0.4s var(--ease) backwards;
  position: relative;
}

.fra-src-card:nth-child(1) { animation-delay: 0.05s; }
.fra-src-card:nth-child(2) { animation-delay: 0.1s; }
.fra-src-card:nth-child(3) { animation-delay: 0.15s; }
.fra-src-card:nth-child(4) { animation-delay: 0.2s; }
.fra-src-card:nth-child(5) { animation-delay: 0.25s; }

.fra-src-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
}

.fra-src-hdr {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.fra-src-type {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 600;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
  letter-spacing: -0.005em;
}

.fra-src-type.financial_report {
  background: var(--success-soft);
  color: var(--success-text);
  border: 1px solid var(--success-border);
}

.fra-src-type.news {
  background: var(--info-soft);
  color: var(--info-text);
  border: 1px solid var(--info-border);
}

.fra-src-type.knowledge {
  background: #f5f3ff;
  color: #6d28d9;
  border: 1px solid #ddd6fe;
}

.fra-src-sentiment {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 500;
  border-radius: 999px;
  padding: 0.22rem 0.55rem;
}

.fra-src-sentiment.positive {
  background: var(--success-soft);
  color: var(--success-text);
}

.fra-src-sentiment.negative {
  background: var(--danger-soft);
  color: var(--danger-text);
}

.fra-src-sentiment.neutral {
  background: var(--gray-2);
  color: var(--text-3);
}

.fra-src-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-left: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
}

.fra-src-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.fra-src-excerpt {
  font-size: 0.8rem;
  color: var(--text-2);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.fra-src-url a {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--brand);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.fra-src-url a:hover {
  color: var(--brand-2);
  text-decoration: underline;
}

/* ════════════════════════════════════════════════════════════════
   INLINE SOURCES (in steps)
   ════════════════════════════════════════════════════════════════ */
.fra-inline-src {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 0.65rem 0.8rem;
  margin-top: 0.4rem;
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  transition: border-color 0.15s var(--ease);
}

.fra-inline-src:hover {
  border-color: var(--brand-border);
}

.fra-inline-src-icon {
  font-size: 0.95rem;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: var(--r-xs);
  background: var(--gray-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fra-inline-src-body {
  flex: 1;
  min-width: 0;
}

.fra-inline-src-title {
  font-size: 0.83rem;
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.005em;
  line-height: 1.4;
  margin-bottom: 0.15rem;
}

.fra-inline-src-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: var(--text-muted);
}

.fra-inline-src-excerpt {
  font-size: 0.78rem;
  color: var(--text-2);
  line-height: 1.5;
  margin-top: 0.25rem;
}

/* ════════════════════════════════════════════════════════════════
   STREAMLIT TABS — Refined
   ════════════════════════════════════════════════════════════════ */
.stTabs [data-baseweb="tab-list"] {
  gap: 0;
  background: transparent;
  border-bottom: 1px solid var(--border);
  padding: 0;
  border-radius: 0;
}

.stTabs [data-baseweb="tab"] {
  border-radius: 0 !important;
  font-size: 0.85rem !important;
  font-weight: 500 !important;
  padding: 0.65rem 1rem !important;
  color: var(--text-3) !important;
  background: transparent !important;
  border: none !important;
  border-bottom: 2px solid transparent !important;
  margin-bottom: -1px !important;
  letter-spacing: -0.005em !important;
  transition: all 0.15s var(--ease) !important;
}

.stTabs [data-baseweb="tab"]:hover {
  color: var(--text) !important;
}

.stTabs [aria-selected="true"] {
  color: var(--text) !important;
  border-bottom-color: var(--brand) !important;
  font-weight: 600 !important;
}

.stTabs [data-baseweb="tab-panel"] {
  padding-top: 1.5rem !important;
}

/* ════════════════════════════════════════════════════════════════
   DOWNLOAD BUTTON
   ════════════════════════════════════════════════════════════════ */
.stDownloadButton > button {
  background: var(--surface) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--r-md) !important;
  font-weight: 500 !important;
  font-size: 0.82rem !important;
  padding: 0.45rem 0.9rem !important;
  letter-spacing: -0.005em !important;
  box-shadow: var(--shadow-xs) !important;
  transition: all 0.15s var(--ease) !important;
}

.stDownloadButton > button:hover {
  background: var(--surface-2) !important;
  border-color: var(--border-strong) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm) !important;
}

/* ════════════════════════════════════════════════════════════════
   EMPTY STATE
   ════════════════════════════════════════════════════════════════ */
.fra-empty {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-2xl);
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.4s var(--ease);
}

.fra-empty::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 10%, rgba(99,102,241,0.04) 0%, transparent 40%),
    radial-gradient(circle at 80% 90%, rgba(139,92,246,0.04) 0%, transparent 40%);
  pointer-events: none;
}

.fra-empty-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--r-xl);
  background: linear-gradient(135deg, var(--brand-soft), #f5f3ff);
  border: 1px solid var(--brand-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin: 0 auto 1.1rem;
  position: relative;
  box-shadow: 0 1px 2px rgba(99,102,241,0.05), 0 8px 16px rgba(99,102,241,0.08);
}

.fra-empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 0.4rem;
  letter-spacing: -0.015em;
  position: relative;
}

.fra-empty-body {
  font-size: 0.88rem;
  color: var(--text-2);
  position: relative;
}

/* ════════════════════════════════════════════════════════════════
   SIDEBAR NOTE
   ════════════════════════════════════════════════════════════════ */
.fra-sidebar-note {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--r-md);
  padding: 0.85rem 0.95rem;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--gray-5) !important;
}

.fra-sidebar-note strong {
  display: block;
  color: var(--gray-3) !important;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.45rem;
}

.fra-sidebar-note ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.fra-sidebar-note li {
  padding-left: 0.85rem;
  position: relative;
  margin-bottom: 0.3rem;
}

.fra-sidebar-note li::before {
  content: "—";
  position: absolute;
  left: 0;
  color: var(--gray-7);
}

.fra-sidebar-note li:last-child {
  margin-bottom: 0;
}

/* ════════════════════════════════════════════════════════════════
   DATAFRAME
   ════════════════════════════════════════════════════════════════ */
.stDataFrame {
  border-radius: var(--r-lg) !important;
  overflow: hidden;
  border: 1px solid var(--border);
}

/* ════════════════════════════════════════════════════════════════
   SPINNER
   ════════════════════════════════════════════════════════════════ */
.stSpinner > div {
  border-color: var(--brand) transparent transparent transparent !important;
}

/* ════════════════════════════════════════════════════════════════
   ANIMATIONS
   ════════════════════════════════════════════════════════════════ */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 0.8; transform: scale(1.5); }
}

/* ════════════════════════════════════════════════════════════════
   RESPONSIVE
   ════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .fra-metrics { grid-template-columns: 1fr; }
  .fra-src-grid { grid-template-columns: 1fr; }
  .fra-topbar { flex-direction: column; align-items: flex-start; gap: 0.85rem; }
  .fra-page-title h1 { font-size: 1.4rem; }
}
</style>
"""


def inject_styles() -> None:
    import streamlit as st

    st.markdown(CUSTOM_CSS, unsafe_allow_html=True)
