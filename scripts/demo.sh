#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# 默认使用独立端口，避免误连 Live 服务
PORT="${PORT:-8090}"
BASE="http://localhost:${PORT}"
LOG="/tmp/tracemind-demo.log"
PID_ON_PORT="$(lsof -t -i :"${PORT}" 2>/dev/null || true)"

echo "==> TraceMind demo script"
echo "    Project: $ROOT"
echo "    Port:   ${PORT}"

need_start=true
if curl -sf "${BASE}/api/health" >/dev/null 2>&1; then
  demo_mode="$(curl -s "${BASE}/api/config" | .venv/bin/python -c "import sys,json; print(json.load(sys.stdin).get('demo_mode', False))")"
  if [[ "${demo_mode}" == "True" ]]; then
    need_start=false
    echo "==> Reusing existing Demo server on :${PORT}"
  else
    echo "==> Port ${PORT} is Live mode; restarting as Demo..."
    [[ -n "${PID_ON_PORT}" ]] && kill "${PID_ON_PORT}" 2>/dev/null || true
    sleep 1
  fi
fi

if [[ "${need_start}" == true ]]; then
  [[ -n "${PID_ON_PORT}" ]] && kill "${PID_ON_PORT}" 2>/dev/null || true
  sleep 1
  echo "==> Starting Demo server on :${PORT}..."
  DEMO_MODE=on PORT="${PORT}" nohup .venv/bin/python main.py > "${LOG}" 2>&1 &
  for _ in $(seq 1 15); do
    curl -sf "${BASE}/api/health" >/dev/null 2>&1 && break
    sleep 1
  done
fi

echo "==> Config"
curl -s "${BASE}/api/config" | .venv/bin/python -m json.tool

echo ""
echo "==> Demo research (演示科技)"
OUT="/tmp/tracemind_demo_result.json"
curl -sf --max-time 30 -X POST "${BASE}/api/research" \
  -H "Content-Type: application/json" \
  -d '{"company":"演示科技有限公司","question":"主要风险是什么？","locale":"zh"}' \
  > "${OUT}"

.venv/bin/python - <<'PY'
import json
import sys
from pathlib import Path

data = json.loads(Path("/tmp/tracemind_demo_result.json").read_text())
p = data.get("protocol", {})
audit = p.get("audit", {})
faith = p.get("faithfulness", {})
print("mode:", data.get("mode"))
print("steps:", len(data.get("steps", [])))
print("audit:", audit.get("passed"), audit.get("score"))
print("faithfulness:", faith.get("passed"), faith.get("score"))
print("hypotheses:", len(p.get("competing_hypotheses", [])))
if data.get("mode") != "demo" or not faith:
    print("ERROR: expected demo mode with full protocol", file=sys.stderr)
    sys.exit(1)
print("saved:", "/tmp/tracemind_demo_result.json")
PY

echo ""
echo "==> Open UI: ${BASE}"
