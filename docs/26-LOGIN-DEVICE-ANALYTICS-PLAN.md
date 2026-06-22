# Login Device Capture & Security Analytics

> **Priority:** P1 (security / compliance — pharma audit)  
> **Admin menu:** `ADM06` — Login & Device Analytics  
> **Route:** `/app/security/loginAnalytics`  
> **Related:** [03-authentication-and-security.md](./03-authentication-and-security.md) · [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md) §5.4 audit

---

## Goal

Har login par **device + network context** capture karo taaki admin dekh sake:

- User **kitni jagah / kitne devices** se active hai
- Web vs mobile split
- Failed login attempts (same device / IP)
- **Audit log** row with device snapshot (immutable trail)

---

## Phase A — Done in this PR (MVP)

| Item | Detail |
|------|--------|
| DB | `login_events` — per login attempt (success/fail) + device fields |
| Capture | On `POST /token` — IP, User-Agent, `X-Device-Id`, `X-App-Channel`, `X-App-Version` |
| Audit | `audit_logs` `LOGIN` / `LOGIN_FAILED` with device summary in `newValues` |
| API | `GET /api/v1/security/login-analytics?days=30` — summary + per-user + recent events |
| Web | Login sends stable `X-Device-Id` (localStorage); Admin page with tables + stat cards |
| Menu | `ADM06` under Admin |

---

## Phase B — Next (after MVP)

| Item | Detail |
|------|--------|
| Mobile | Send `X-Device-Id` (Expo installationId) + `X-App-Channel: mobile` on auth/sync |
| Refresh | Log `SESSION_REFRESH` on token refresh (optional device change detection) |
| Logout | `LOGOUT` audit + revoke refresh token + login_events `logoutAt` |
| Alerts | Admin alert when same user > N active devices in 24h |
| Geo | IP → city/country (MaxMind or GCP) — display only, no blocking in v1 |
| Export | CSV export login events for compliance |
| Platform | Platform super-admin login events (separate table or `actorType`) |

---

## Data captured (per login event)

| Field | Source |
|-------|--------|
| `compCode`, `empId`, `userName` | Auth |
| `loginStatus` | `SUCCESS` \| `FAILED` |
| `channel` | Header `X-App-Channel` (web / mobile) |
| `deviceId` | Header `X-Device-Id` |
| `deviceType` | Parsed UA (mobile / desktop / tablet) |
| `osName`, `osVersion` | Parsed UA |
| `browserName`, `browserVersion` | Parsed UA (web) |
| `appVersion` | Header `X-App-Version` |
| `ipAddress` | `X-Forwarded-For` or socket |
| `userAgent` | Raw UA (truncated 500 chars) |
| `acceptLanguage` | Header |
| `requestId` | Pino `X-Request-Id` |
| `refreshTokenId` | Link to active session (success only) |

---

## Analytics (admin dashboard)

**Summary (period):**

- Total logins / failed logins
- Unique users
- Unique devices
- Active sessions (non-revoked refresh tokens)
- Users with **multiple devices** (distinct `deviceId` in period)

**Per employee row:**

- Employee name, code
- Login count, last login time
- Distinct devices, distinct IPs
- Active sessions count
- `multiDeviceFlag` when devices > 1

**Recent events table:**

- Time, user, status, channel, device, OS, browser, IP

---

## Security & privacy

- IP + device stored for **tenant admin** visibility only (`compCode` scoped)
- No passwords or tokens in `login_events`
- Retention: 90 days default (Phase B job); MVP keeps all
- GDPR: document in tenant DPA as operational security log

---

## E2E test

1. Login web as `mr1` from browser → event row + audit `LOGIN`
2. Login same user from another browser (different `X-Device-Id`) → multi-device flag
3. Wrong password → `LOGIN_FAILED` + failed count
4. Admin → Login & Device Analytics → summary + recent list

---

*Part of Synchem SFA roadmap — Phase 6 security.*
