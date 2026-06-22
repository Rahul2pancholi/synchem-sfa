# Phase 6 — Go-Live (500 Users)

> **Goal:** Production-ready MVP for **500 live users** by Month 6.  
> **Prerequisite:** Phases 0–5 MVP complete (core txn, approvals, leave/expense, 3 reports).  
> **Reference:** [08-clone-roadmap.md](./08-clone-roadmap.md) · [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) · [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md) §16

---

## Summary

| Workstream | Owner | Status |
|------------|-------|--------|
| UAT vs `synchem.salestrip.in` | PM / QA | ☐ |
| Staging deploy (UAT) | DevOps | ☐ |
| Load test (500 user sim) | QA / Backend | ☐ |
| Production deploy (2× API) | DevOps | ☐ |
| Monitoring (Sentry + uptime) | DevOps | ☐ |
| MR training + rollout | PM / Field ops | ☐ |

---

## 1. Pre-go-live gates (Go / No-Go)

All must pass before production traffic:

| # | Gate | Command / check |
|---|------|-----------------|
| 1 | CI green on `release/*` | GitHub Actions `CI` workflow |
| 2 | `/health` returns 200 | `curl -sf $API_URL/health` |
| 3 | `/ready` DB + Redis OK | `curl -sf $API_URL/ready` |
| 4 | API E2E flow | `pnpm go-live:check` |
| 5 | Tenant isolation test | `pnpm --filter @synchem-sfa/api test:e2e` |
| 6 | Load test p95 login < 500ms, error rate < 1% | `pnpm load-test` |
| 7 | UAT sign-off (below) | PM checklist signed |
| 8 | DB backup + rollback plan documented | §5 |
| 9 | Secrets not in git | `.env` gitignored |
| 10 | `APP_ENV=prod`, `NODE_ENV=production` | Deploy env verified |

---

## 2. UAT checklist (vs Salestrip)

Compare **read-only** on `https://synchem.salestrip.in` with new UAT stack.

### Auth & shell

| # | Flow | Salestrip | New SFA | Pass |
|---|------|-----------|---------|------|
| 1 | Login `username,compCode` + password | | | ☐ |
| 2 | Forgot password OTP | | | ☐ |
| 3 | Sidebar menus match role | | | ☐ |
| 4 | Logout clears session | | | ☐ |

### Masters (admin)

| # | Flow | Pass |
|---|------|------|
| 5 | Create city → HQ → route chain | ☐ |
| 6 | Create employee with reporting manager | ☐ |
| 7 | Doctor + retailer CRUD | ☐ |
| 8 | Bulk doctor upload (CSV) | ☐ |

### Core transactions (MR — `mr1`)

| # | Flow | Pass |
|---|------|------|
| 9 | Create + submit RTP | ☐ |
| 10 | Create + submit DCR | ☐ |
| 11 | Create + submit Weekly Plan | ☐ |
| 12 | Create POB | ☐ |
| 13 | Leave application + submit | ☐ |
| 14 | Expense statement + submit | ☐ |

### Approvals (manager — `rm1`)

| # | Flow | Pass |
|---|------|------|
| 15 | Pending DCR → approve | ☐ |
| 16 | Pending RTP → approve | ☐ |
| 17 | Pending Weekly → approve | ☐ |
| 18 | Pending Leave → balance deducted | ☐ |
| 19 | Pending Expense → approve | ☐ |
| 20 | Manager dashboard counts match queue | ☐ |

### Mobile (MR)

| # | Flow | Pass |
|---|------|------|
| 21 | Login + MPIN | ☐ |
| 22 | Offline DCR create | ☐ |
| 23 | Sync push after reconnect | ☐ |
| 24 | GPS check-in recorded | ☐ |

### Reports (admin)

| # | Report | Pass |
|---|--------|------|
| 25 | DCR Summary | ☐ |
| 26 | Monthly Expense Summary | ☐ |
| 27 | Employee POB | ☐ |

### Role & access

| # | Flow | Pass |
|---|------|------|
| 28 | Admin changes MR permissions → MR sees fewer menus | ☐ |
| 29 | API returns 403 for blocked menu action | ☐ |

**UAT sign-off**

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Client / HO | | | |
| Field ops | | | |
| QA lead | | | |
| Tech lead | | | |

---

## 3. Staging (UAT) deploy

### Option A — Docker Compose (single server)

```bash
# From repo root
cp apps/api/.env.uat.example apps/api/.env
# Edit DATABASE_URL, JWT_SECRET, CORS_ORIGINS

pnpm docker:uat          # Postgres + Redis + API + Web
pnpm db:migrate:deploy     # if API not auto-migrating
pnpm db:seed               # UAT data only — not in prod
```

URLs (default):

| Service | URL |
|---------|-----|
| Web | http://localhost:8080 |
| API | http://localhost:3000 |
| Health | http://localhost:3000/health |

### Option B — Managed (Fly.io / AWS / GCP)

- **2× API** instances behind load balancer
- **Managed Postgres** (PITR enabled)
- **Managed Redis**
- **Static web** on CDN or nginx container
- Run `prisma migrate deploy` as deploy hook before traffic switch
- Gate on `/ready` = 200

See `infra/docker/` for Dockerfiles and compose overrides.

---

## 4. Production deploy

### Environment

```bash
APP_ENV=prod
NODE_ENV=production
JWT_SECRET=<32+ chars from vault>
DATABASE_URL=<managed postgres>
REDIS_URL=<managed redis>
CORS_ORIGINS=https://sfa.synchem.com
LOG_LEVEL=info
# SENTRY_DSN=https://...@sentry.io/...   # optional
```

### Deploy sequence

1. Tag release: `git tag v1.0.0`
2. **Backup** database (snapshot)
3. Build & push Docker images (API + web)
4. `prisma migrate deploy` on prod DB
5. Rolling deploy API instances (one at a time)
6. Verify `/ready` on each instance
7. Deploy web / CDN
8. Run `pnpm go-live:check` against prod URL (smoke only — use test tenant)
9. Enable monitoring alerts
10. Rollout users in waves (§6)

### Rollback

1. Revert to previous Docker image tag
2. If migration broke schema: restore DB snapshot (last resort)
3. Post-mortem within 24h

---

## 5. Load testing

### Targets (MVP SLAs)

| Metric | Target |
|--------|--------|
| Login p95 | < 500 ms |
| CRUD p95 | < 500 ms |
| Error rate | < 1% |
| 50 concurrent users | Stable 5 min |
| 100 mobile sync pushes | < 2 s each (p95) |

### Run locally

```bash
# API must be running with seed data
API_URL=http://localhost:3000 pnpm load-test

# Or k6 (if installed): brew install k6
k6 run tests/load/k6-mvp.js
```

Tune `ThrottlerModule` in `app.module.ts` if load test hits 429 — increase limit for load test env only.

---

## 6. User rollout plan

| Wave | When | Users | Scope |
|------|------|-------|-------|
| 0 | Week -2 | 10 internal | Full UAT on staging |
| 1 | Week 0 | 40 pilot MRs | 1 region, SYN tenant |
| 2 | Week 2 | 100–200 | Add managers + HO reports |
| 3 | Week 4 | **500** | Full go-live |

**Training (per wave):**

- 30 min web: login, RTP, DCR, leave, expense
- 45 min mobile: offline DCR, sync, GPS
- 15 min managers: approval queues + dashboard
- Handout: test credentials sheet (change passwords on day 1)

---

## 7. Monitoring & alerts

### Health checks

| Endpoint | Use |
|----------|-----|
| `GET /health` | LB ping (process alive) |
| `GET /ready` | Deploy gate (DB + Redis) |

### Sentry (recommended)

1. Create Sentry project (NestJS)
2. Set `SENTRY_DSN` in prod/uat env
3. Install `@sentry/nestjs` when ready (see [Sentry NestJS docs](https://docs.sentry.io/platforms/javascript/guides/nestjs/))
4. Tag events: `compCode`, `requestId` (already in Pino logs)

### Uptime alerts

- Ping `/health` every 60s (UptimeRobot / Better Stack / GCP)
- Alert on 2 consecutive failures
- On-call runbook: check `/ready` → DB connections → Redis → recent deploy

### Log aggregation

- Pino JSON logs → CloudWatch / Datadog / Loki
- Search by `requestId` from API response header `X-Request-Id`

---

## 8. Known MVP gaps (accept or fix before go-live)

| Item | Risk | Decision |
|------|------|----------|
| Doctor Approval screen | Low if no new doctor onboarding at launch | Defer / build |
| 9 of 12 MVP reports | Medium for HO | Prioritize top 3 post-launch |
| Excel export on reports | Medium | Defer or quick win |
| Firebase push | Low | Defer — email/WhatsApp interim |
| Company Info / DCR Setting | Low | Defer if defaults OK |

---

## 9. Quick commands

```bash
pnpm go-live:check      # health + ready + API E2E
pnpm test:api-flow      # MR → manager approve flow
pnpm load-test          # 50 concurrent user simulation
pnpm docker:uat         # full UAT stack
```

---

## 10. Post go-live (Month 7+)

See [08-clone-roadmap.md](./08-clone-roadmap.md) Track B:

- Remaining reports + approvals
- Workflow builder (Phase 11)
- Full Salestrip parity (152 screens)

---

*Version 1.0 — June 2026*
