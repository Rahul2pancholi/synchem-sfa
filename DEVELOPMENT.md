# Development — Quick Start (Phase 0)

## Prerequisites

- Node.js 20+
- pnpm 10+ (`corepack enable pnpm`)
- **Colima** + Docker CLI (lightweight — no Docker Desktop)

---

## Colima setup (macOS, one-time)

```bash
brew install colima docker docker-compose
colima start --cpu 2 --memory 4
docker context use colima   # use Colima instead of Docker Desktop
docker ps                   # should work without Docker Desktop
```

Verify:

```bash
pnpm colima:status
```

**Stop / start later:**

```bash
pnpm colima:stop
pnpm colima:start
```

> Colima not running? `pnpm docker:dev` will fail — run `pnpm colima:start` first.

---

## 1. Install dependencies

```bash
pnpm install
pnpm --filter @synchem-sfa/shared-types build
```

## 2. Start Postgres + Redis (Colima)

```bash
pnpm colima:start    # if not already running
pnpm docker:dev
cp apps/api/.env.example apps/api/.env.local
```

Services:

| Service  | Port | Credentials (dev)        |
|----------|------|--------------------------|
| Postgres | **5434** (host) → 5432 (container) | `sfa` / `sfa_dev_password` / DB `synchem_sfa` |
| Redis    | 6379 | no password              |

## 3. Migrate & seed

```bash
pnpm db:migrate
pnpm db:seed
```

Or from `apps/api`:

```bash
cd apps/api
pnpm exec prisma migrate deploy
pnpm prisma:seed
```

Default login: **admin** / **Admin@123** / company code **SYN**

Platform super admin: **superadmin@synchem.co** / **Platform@123**

## 4. Run apps

```bash
# Terminal 1 — API
pnpm dev:api

# Terminal 2 — Web
pnpm dev:web
```

| App | URL |
|-----|-----|
| API health | http://localhost:3000/health |
| Web login | http://localhost:5173/login |

## 5. Test login (curl)

```bash
curl -X POST http://localhost:3000/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&username=admin,SYN&password=Admin@123"
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to Docker daemon` | `pnpm colima:start` |
| Port 5432 already in use | Docker Postgres uses **5434** on the host (see `infra/docker/docker-compose.yml`). Stop local Postgres if needed: `brew services stop postgresql@14` |
| Port 5433 in use | EnterpriseDB Postgres may listen on 5433 — do not remap Docker to that port |
| Wrong Docker context | `docker context use colima` |
| Reset DB volumes | `pnpm docker:down` then `docker volume rm synchem-sfa_postgres_data` (or `docker compose ... down -v`) |

## Monorepo layout

```
apps/api/              NestJS API
apps/web/              React + Vite
apps/worker/           pg-boss job skeleton (Phase 0)
apps/mobile/           Placeholder — starts Phase 3
packages/shared-types/
infra/docker/          docker-compose (Colima / CI)
docs/                  Specifications
openapi/
apps/api/prisma/       Canonical DB schema + migrations
```

## Phase 0 checklist (complete)

| Item | Status |
|------|--------|
| Monorepo + CI | Done |
| Docker Postgres (5434) + Redis | Done |
| Prisma schema + migrations + seed | Done |
| Login `/token` + refresh rotation | Done |
| Forgot password (OTP via Redis) | Done |
| JWT guards + tenant/platform actors | Done |
| RBAC menus + `@RequirePermission` guard | Done |
| Platform tenant CRUD API | Done |
| Audit log on login / tenant create | Done |
| Web: login, forgot password, shell, platform tenants | Done |
| Worker skeleton (`pnpm dev:worker`) | Done |
| Health `/health` + `/ready` (DB + Redis) | Done |
| Trilingual UI (English, Hindi, Hinglish) | Done |
| Web UI: Ant Design + TanStack Query shell | Done |

## Phase 1 checklist (complete)

| Item | Status |
|------|--------|
| Hierarchy + Employee masters | Done |
| City, HQ, Route | Done |
| Brand, Product, Doctor, Retailer, Stockist | Done |
| LOVs (designation, dosage, division, specialist, qualification, holiday, expense) | Done |
| Bulk upload (7 types) | Done |
| OpenAPI Masters tag (Phase 1 endpoints) | Done |
| Master screens: antd Table/Form/Card | Done |

**Next:** Phase 6 — Go-live prep

## Phase 6 checklist (in progress)

> Full runbook: [23-PHASE6-GO-LIVE.md](./docs/23-PHASE6-GO-LIVE.md)

| Item | Status |
|------|--------|
| Go-live doc (UAT matrix, rollout, go/no-go) | Done |
| `pnpm go-live:check` — health + ready + API E2E | Done |
| `pnpm load-test` — 50 concurrent user simulation | Done |
| `pnpm docker:uat` — UAT compose (API + web + DB) | Done |
| `.env.uat.example` / `.env.prod.example` + CORS config | Done |
| k6 script (`tests/load/k6-mvp.js`) | Done |
| Staging UAT vs `synchem.salestrip.in` | Pending |
| Production deploy (2× API, managed DB) | Pending |
| Sentry integration (`@sentry/nestjs`) | Pending — DSN env ready |
| Load test: 100 concurrent mobile syncs | Pending |
| MR training + 500-user rollout | Pending |

**Commands:**

```bash
pnpm go-live:check          # smoke before deploy
pnpm load-test              # API load gate
cp apps/api/.env.uat.example apps/api/.env.uat && pnpm docker:uat
```

## Phase 5 checklist (MVP — complete)

| Item | Status |
|------|--------|
| Leave Application API + web (`TRN09`) | Done |
| Leave Approval queue (`TRN10`) + balance deduction | Done |
| Leave Policy admin (`SET03`) | Done |
| Expense Statement API + web (`TRN20`) | Done |
| Expense Approval queue (`TRN21`) | Done |
| Key reports: DCR Summary (`REP01`), Expense Summary (`REP05`), Employee POB (`REP12`) | Done |
| Stock statement, Gift/Sample | Deferred |
| Full 12-report suite + Excel export | Deferred |

**Test flow:** `mr1` applies leave → `rm1` approves → balance reduces · `mr1` creates expense claim → submit → approve

## Phase 4 checklist (MVP — complete)

| Item | Status |
|------|--------|
| `ApprovalService` — submit, list pending, approve/reject | Done |
| API `/api/v1/approvals/pending`, `/summary`, `/:id/approve`, `/:id/reject` | Done |
| AD sees all pending; MAN sees direct reports only | Done |
| Web: DCR Approval (`APP01`), RTP Approval (`TRN02`), Weekly Plan (`APP04`) | Done |
| Manager dashboard pending counts (`DSH02`, `DSH03`) | Done |
| Seed: APP menus, RM role + `rm1` user, `mr1` → `rm1` reporting | Done |
| Leave / Expense / Doctor approval | Deferred (no entity schema yet) |
| Firebase push on pending approval | Deferred |

**Test users:** `admin` / `Admin@123` / `SYN` (all pending) · `rm1` / `Rm@123` / `SYN` (team only)

## Phase 2 checklist (complete)

| Item | Status |
|------|--------|
| Prisma models: RTP, Weekly Plan, POB (+ DCR visits) | Done |
| API `/api/v1/daily-call-reports`, `/tour-programmes`, `/weekly-plans`, `/personal-orders` | Done |
| Submit → approval queue (DCR, RTP, Weekly Plan) | Done |
| Web UI: DCR, RTP, Weekly Plan, POB (antd Table/Form) | Done |
| Transaction menus TRN01, TRN03, TRN24, TRN04 in seed | Done |
| Trilingual txn message keys | Done |

## Phase 3 checklist (mobile MVP + polish — complete)

| Item | Status |
|------|--------|
| Expo app in monorepo (`apps/mobile`) | Done |
| WatermelonDB schema (DCR, masters, GPS, sync meta) | Done |
| Mobile login (`EMPLOYEE` + compCode) + MPIN | Done |
| NestJS sync API (`/sync/push`, `/sync/pull`, `/sync/masters/bootstrap`) | Done |
| Offline DCR create / submit (local DB) | Done |
| GPS check-in / check-out (`expo-location`) | Done |
| Field staff dashboard + manual sync | Done |
| Seed MR user (`mr1` / `Mr@123`) + sample doctor/retailer | Done |
| Biometric MPIN unlock (`expo-local-authentication`) | Done |
| Auto-sync on app foreground | Done |
| Mobile RTP calendar read view | Done |
| Expo push token registration + API save | Done |
| Firebase push delivery (server-side) | Deferred |
| Load test: 100 concurrent syncs | Deferred |

### Run mobile (dev)

```bash
# Terminal 1 — API (same as web)
pnpm dev:api

# Terminal 2 — Expo (iOS simulator / Android emulator / Expo Go)
pnpm dev:mobile
```

Set `EXPO_PUBLIC_API_URL` if API is not on `http://localhost:3000` (use machine LAN IP for physical device).

**Mobile login:** `mr1` / `Mr@123` / `SYN`

## Phase 1.5 checklist (complete)

> Full spec: [22-ROLE-ACCESS-CONFIG-PLAN.md](./docs/22-ROLE-ACCESS-CONFIG-PLAN.md)

| Item | Status |
|------|--------|
| Role Master API + web (`ADM01` `/app/roleMaster`) | Done |
| Role Setting matrix API + web (`ADM04` `/app/roleSetting`) | Done |
| Default AD / MAN / FS permission templates (MR seed fixed) | Done |
| Web `usePermission` + route guards + button gates (Employee) | Done |
| Mobile dashboard tiles gated by menu permissions | Done |
| `GET /api/v1/menus/me` menu refresh | Done |

## Future phases (planned — not started)

| Phase | Doc | Notes |
|-------|-----|-------|
| **1.5** | **[22-ROLE-ACCESS-CONFIG-PLAN.md](./docs/22-ROLE-ACCESS-CONFIG-PLAN.md)** | Admin role & menu permission UI |
| 4 | [08-clone-roadmap.md](./docs/08-clone-roadmap.md) | Approvals + manager dashboard |
| **11** | **[21-WORKFLOW-BUILDER-PLAN.md](./docs/21-WORKFLOW-BUILDER-PLAN.md)** | Admin drag-and-drop approval flows + business rules (after Phase 4) |

See [08-clone-roadmap.md](./docs/08-clone-roadmap.md) for full timeline (MVP + parity track).
