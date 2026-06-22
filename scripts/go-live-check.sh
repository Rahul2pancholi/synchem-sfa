#!/usr/bin/env bash
# Pre-deploy smoke: health + readiness + core API E2E flow
set -euo pipefail

BASE="${API_URL:-http://localhost:3000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Go-Live Smoke Check ==="
echo "API: $BASE"
echo

fail() { echo "✗ $*"; exit 1; }
ok() { echo "✓ $*"; }

echo "▸ GET /health"
HEALTH=$(curl -sf "$BASE/health") || fail "/health unreachable"
echo "$HEALTH" | grep -q '"status"' || echo "$HEALTH" | grep -q 'ok' || fail "unexpected /health body"
ok "/health OK"

echo "▸ GET /ready"
READY_CODE=$(curl -s -o /tmp/sfa-ready.json -w '%{http_code}' "$BASE/ready")
if [[ "$READY_CODE" != "200" ]]; then
  cat /tmp/sfa-ready.json
  fail "/ready returned HTTP $READY_CODE"
fi
ok "/ready OK"

echo "▸ API E2E flow"
API_URL="$BASE" bash "$ROOT/scripts/test-api-flow.sh"

echo
echo "=== All go-live checks passed ==="
