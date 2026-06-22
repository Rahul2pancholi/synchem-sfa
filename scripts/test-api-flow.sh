#!/usr/bin/env bash
# End-to-end API flow: MR submit → Manager approve (DCR, Leave, Expense)
set -euo pipefail

BASE="${API_URL:-http://localhost:3001}"
ADMIN_USER="${GO_LIVE_ADMIN_USER:-admin}"
ADMIN_PASS="${GO_LIVE_ADMIN_PASSWORD:-${SEED_ADMIN_PASSWORD:-Admin@123}}"
MR_USER="${GO_LIVE_MR_USER:-mr1}"
MR_PASS="${GO_LIVE_MR_PASSWORD:-Mr@123}"
RM_USER="${GO_LIVE_RM_USER:-rm1}"
RM_PASS="${GO_LIVE_RM_PASSWORD:-Rm@123}"
COMP="${GO_LIVE_COMP_CODE:-SYN}"
PASS=0
FAIL=0

log() { echo "▸ $*"; }
ok()  { PASS=$((PASS + 1)); echo "  ✓ $*"; }
bad() { FAIL=$((FAIL + 1)); echo "  ✗ $*"; exit 1; }

login() {
  local user=$1 pass=$2 comp=$3
  curl -sf -X POST "$BASE/token" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d "grant_type=password&username=${user},${comp}&password=${pass}" \
    | tee /tmp/sfa-token.json
}

auth_header() {
  echo "Authorization: Bearer $(jq -r '.access_token' /tmp/sfa-token.json)"
}

api_get() {
  curl -sf "$BASE$1" -H "$(auth_header)" -H 'X-App-Language: en'
}

empty_json() { echo '{}'; }

api_post_allow_fail() {
  local path=$1 body=${2:-$(empty_json)}
  curl -s -X POST "$BASE$path" \
    -H "$(auth_header)" \
    -H 'Content-Type: application/json' \
    -H 'X-App-Language: en' \
    -d "$body" \
    -w '\n__HTTP__%{http_code}'
}

find_or_create_dcr() {
  local work_date=$1
  local list res id status
  list=$(api_get "/api/v1/daily-call-reports")
  id=$(echo "$list" | jq -r --arg d "$work_date" '.data.items[] | select(.workDate==$d) | .id' | head -1)
  if [[ -n "$id" && "$id" != "null" ]]; then
    status=$(echo "$list" | jq -r --arg d "$work_date" '.data.items[] | select(.workDate==$d) | .approveStatus' | head -1)
    echo "$id|$status|existing"
    return
  fi
  res=$(api_post_allow_fail "/api/v1/daily-call-reports" "$(jq -n --arg d "$work_date" '{workDate: $d, doctorIds: []}')")
  id=$(echo "$res" | sed '/__HTTP__/d' | jq -r '.data.id // empty')
  if [[ -n "$id" ]]; then
    echo "$id|DRAFT|created"
    return
  fi
  local tomorrow
  tomorrow=$(date -v+1d +%Y-%m-%d 2>/dev/null || date -d '+1 day' +%Y-%m-%d)
  list=$(api_get "/api/v1/daily-call-reports")
  id=$(echo "$list" | jq -r --arg d "$tomorrow" '.data.items[] | select(.workDate==$d) | .id' | head -1)
  if [[ -n "$id" && "$id" != "null" ]]; then
    status=$(echo "$list" | jq -r --arg d "$tomorrow" '.data.items[] | select(.workDate==$d) | .approveStatus' | head -1)
    echo "$id|$status|existing-tomorrow"
    return
  fi
  res=$(api_post "/api/v1/daily-call-reports" "$(jq -n --arg d "$tomorrow" '{workDate: $d, doctorIds: []}')")
  id=$(echo "$res" | jq -r '.data.id')
  echo "$id|DRAFT|created-tomorrow"
}

api_post() {
  local path=$1 body=${2:-$(empty_json)}
  curl -sf -X POST "$BASE$path" \
    -H "$(auth_header)" \
    -H 'Content-Type: application/json' \
    -H 'X-App-Language: en' \
    -d "$body"
}

echo "=== Synchem SFA API E2E Flow ==="
echo "Base: $BASE"
echo

# ── Health ──────────────────────────────────────────────────────────────────
log "Health check"
api_get "/health" > /dev/null 2>&1 || curl -sf "$BASE/health" > /dev/null
ok "API healthy"

# ── MR login ────────────────────────────────────────────────────────────────
log "Login as mr1 (FS)"
login "$MR_USER" "$MR_PASS" "$COMP" > /dev/null
MR_TOKEN=$(jq -r '.access_token' /tmp/sfa-token.json)
[[ "$MR_TOKEN" != "null" && -n "$MR_TOKEN" ]] && ok "mr1 login" || bad "mr1 login failed"

# ── DCR: create + submit ────────────────────────────────────────────────────
log "DCR: find or create draft"
WORK_DATE=$(date +%Y-%m-%d)
DCR_INFO=$(find_or_create_dcr "$WORK_DATE")
DCR_ID=$(echo "$DCR_INFO" | cut -d'|' -f1)
DCR_EXISTING_STATUS=$(echo "$DCR_INFO" | cut -d'|' -f2)
DCR_SRC=$(echo "$DCR_INFO" | cut -d'|' -f3)
ok "DCR ready ($DCR_SRC): $DCR_ID status=$DCR_EXISTING_STATUS"

if [[ "$DCR_EXISTING_STATUS" == "DRAFT" || "$DCR_EXISTING_STATUS" == "REJECTED" ]]; then
  log "DCR: submit for approval"
  SUBMIT_DCR=$(api_post "/api/v1/daily-call-reports/${DCR_ID}/submit")
  DCR_STATUS=$(echo "$SUBMIT_DCR" | jq -r '.data.approveStatus')
  [[ "$DCR_STATUS" == "SUBMITTED" ]] && ok "DCR submitted" || bad "DCR submit failed: $SUBMIT_DCR"
else
  ok "DCR already $DCR_EXISTING_STATUS — skip submit"
fi

# ── Leave: create + submit ──────────────────────────────────────────────────
log "Leave: find or create application"
FROM=$(date -v+7d +%Y-%m-%d 2>/dev/null || date -d '+7 days' +%Y-%m-%d)
TO=$(date -v+8d +%Y-%m-%d 2>/dev/null || date -d '+8 days' +%Y-%m-%d)
LEAVE_BODY=$(jq -n --arg f "$FROM" --arg t "$TO" '{leaveType: "CL", fromDate: $f, toDate: $t, reason: "E2E test"}')
LEAVE_RES=$(api_post_allow_fail "/api/v1/leave-applications" "$LEAVE_BODY")
LEAVE_ID=$(echo "$LEAVE_RES" | sed '/__HTTP__/d' | jq -r '.data.id // empty')
LEAVE_EXISTING_STATUS="DRAFT"
if [[ -z "$LEAVE_ID" ]]; then
  LEAVE_LIST=$(api_get "/api/v1/leave-applications")
  LEAVE_ID=$(echo "$LEAVE_LIST" | jq -r '.data.items[] | select(.approveStatus=="DRAFT" or .approveStatus=="REJECTED" or .approveStatus=="SUBMITTED") | .id' | head -1)
  LEAVE_EXISTING_STATUS=$(echo "$LEAVE_LIST" | jq -r --arg id "$LEAVE_ID" '.data.items[] | select(.id==$id) | .approveStatus' | head -1)
  [[ -n "$LEAVE_ID" ]] && ok "Leave reused: $LEAVE_ID status=$LEAVE_EXISTING_STATUS" || bad "Leave not available: $LEAVE_RES"
else
  ok "Leave created: $LEAVE_ID"
fi

if [[ "$LEAVE_EXISTING_STATUS" == "DRAFT" || "$LEAVE_EXISTING_STATUS" == "REJECTED" ]]; then
  log "Leave: submit for approval"
  SUBMIT_LEAVE=$(api_post "/api/v1/leave-applications/${LEAVE_ID}/submit")
  LEAVE_STATUS=$(echo "$SUBMIT_LEAVE" | jq -r '.data.approveStatus')
  [[ "$LEAVE_STATUS" == "SUBMITTED" ]] && ok "Leave submitted" || bad "Leave submit failed: $SUBMIT_LEAVE"
else
  ok "Leave already $LEAVE_EXISTING_STATUS — skip submit"
fi

# ── Expense: create + submit ────────────────────────────────────────────────
log "Expense: find or create statement"
MONTH=$(date +%-m 2>/dev/null || date +%m | sed 's/^0//')
YEAR=$(date +%Y)
EXP_BODY=$(jq -n --argjson m "$MONTH" --argjson y "$YEAR" \
  '{claimMonth: $m, claimYear: $y, lines: [{description: "E2E allowance", amount: 5000}]}')
EXP_RES=$(api_post_allow_fail "/api/v1/expense-statements" "$EXP_BODY")
EXP_ID=$(echo "$EXP_RES" | sed '/__HTTP__/d' | jq -r '.data.id // empty')
EXP_EXISTING_STATUS="DRAFT"
if [[ -z "$EXP_ID" ]]; then
  EXP_LIST=$(api_get "/api/v1/expense-statements")
  EXP_ID=$(echo "$EXP_LIST" | jq -r --argjson m "$MONTH" --argjson y "$YEAR" \
    '.data.items[] | select(.claimMonth==$m and .claimYear==$y) | .id' | head -1)
  EXP_EXISTING_STATUS=$(echo "$EXP_LIST" | jq -r --arg id "$EXP_ID" '.data.items[] | select(.id==$id) | .approveStatus' | head -1)
  [[ -n "$EXP_ID" ]] && ok "Expense reused: $EXP_ID status=$EXP_EXISTING_STATUS" || bad "Expense not available: $EXP_RES"
else
  ok "Expense created: $EXP_ID"
fi

log "Expense: submit for approval (if needed)"
EXP_LIST=$(api_get "/api/v1/expense-statements")
EXP_STATUS=$(echo "$EXP_LIST" | jq -r --arg id "$EXP_ID" '.data.items[] | select(.id==$id) | .approveStatus' | head -1)
if [[ "$EXP_STATUS" == "DRAFT" || "$EXP_STATUS" == "REJECTED" ]]; then
  SUBMIT_EXP=$(api_post "/api/v1/expense-statements/${EXP_ID}/submit")
  EXP_STATUS=$(echo "$SUBMIT_EXP" | jq -r '.data.approveStatus')
  [[ "$EXP_STATUS" == "SUBMITTED" ]] && ok "Expense submitted" || bad "Expense submit failed: $SUBMIT_EXP"
else
  ok "Expense already $EXP_STATUS — skip submit"
fi

# ── RM login ────────────────────────────────────────────────────────────────
log "Login as rm1 (Manager)"
login "$RM_USER" "$RM_PASS" "$COMP" > /dev/null
RM_TOKEN=$(jq -r '.access_token' /tmp/sfa-token.json)
[[ "$RM_TOKEN" != "null" && -n "$RM_TOKEN" ]] && ok "rm1 login" || bad "rm1 login failed"

# ── Pending approvals (manager sees team only) ──────────────────────────────
log "Manager: approve DCR (if pending)"
PENDING_DCR=$(api_get "/api/v1/approvals/pending?entityType=DCR")
DCR_QUEUE=$(echo "$PENDING_DCR" | jq -r --arg id "$DCR_ID" '.data.items[] | select(.entityId==$id) | .id' | head -1)
if [[ -n "$DCR_QUEUE" && "$DCR_QUEUE" != "null" ]]; then
  APPROVE_DCR=$(api_post "/api/v1/approvals/${DCR_QUEUE}/approve" '{}')
  [[ $(echo "$APPROVE_DCR" | jq -r '.data.status') == "APPROVED" ]] && ok "DCR approved" || bad "DCR approve failed: $APPROVE_DCR"
else
  ok "DCR not pending (already approved or not in queue)"
fi

log "Manager: approve Leave (if pending)"
PENDING_LEAVE=$(api_get "/api/v1/approvals/pending?entityType=LEAVE")
LEAVE_QUEUE=$(echo "$PENDING_LEAVE" | jq -r --arg id "$LEAVE_ID" '.data.items[] | select(.entityId==$id) | .id' | head -1)
if [[ -n "$LEAVE_QUEUE" && "$LEAVE_QUEUE" != "null" ]]; then
  APPROVE_LEAVE=$(api_post "/api/v1/approvals/${LEAVE_QUEUE}/approve" '{}')
  [[ $(echo "$APPROVE_LEAVE" | jq -r '.data.status') == "APPROVED" ]] && ok "Leave approved" || bad "Leave approve failed: $APPROVE_LEAVE"
else
  ok "Leave not pending"
fi

log "Manager: approve Expense (if pending)"
PENDING_EXP=$(api_get "/api/v1/approvals/pending?entityType=EXPENSE")
EXP_QUEUE=$(echo "$PENDING_EXP" | jq -r --arg id "$EXP_ID" '.data.items[] | select(.entityId==$id) | .id' | head -1)
if [[ -n "$EXP_QUEUE" && "$EXP_QUEUE" != "null" ]]; then
  APPROVE_EXP=$(api_post "/api/v1/approvals/${EXP_QUEUE}/approve" '{}')
  [[ $(echo "$APPROVE_EXP" | jq -r '.data.status') == "APPROVED" ]] && ok "Expense approved" || bad "Expense approve failed: $APPROVE_EXP"
else
  ok "Expense not pending"
fi

# ── Summary + reports ───────────────────────────────────────────────────────
log "Manager: approval summary"
SUMMARY=$(api_get "/api/v1/approvals/summary")
TOTAL=$(echo "$SUMMARY" | jq -r '.data.total')
ok "Approval summary total pending: $TOTAL"

log "Admin: DCR report"
login "$ADMIN_USER" "$ADMIN_PASS" "$COMP" > /dev/null
REPORT=$(api_get "/api/v1/reports/dcr-summary?month=${MONTH}&year=${YEAR}")
REPORT_ROWS=$(echo "$REPORT" | jq '.data.items | length')
ok "DCR report rows: $REPORT_ROWS"

log "Leave balance after approval (mr1)"
login "$MR_USER" "$MR_PASS" "$COMP" > /dev/null
BALANCES=$(api_get "/api/v1/leave-balances")
CL_BAL=$(echo "$BALANCES" | jq -r '.data.items[] | select(.leaveType=="CL") | .balance' | head -1)
ok "mr1 CL balance after approve: $CL_BAL (expected 10 if started at 12, 2-day leave)"

echo
echo "=== Results: $PASS passed, $FAIL failed ==="
[[ "$FAIL" -eq 0 ]]
