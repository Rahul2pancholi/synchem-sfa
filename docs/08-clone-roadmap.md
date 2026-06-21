# Clone Roadmap — Implementation Phases

> **⭐ START HERE for build decisions:** [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) — locked stack, multi-tenant SaaS, 500 users in 6 months, Docker, monorepo.

This document covers **detailed phase breakdown**. Two tracks:

| Track | Timeline | Goal |
|-------|----------|------|
| **A — MVP Go-Live** | **6 months** | 500 users, core SFA + mobile offline |
| **B — Full Parity** | 9–10 months | All 152 screens, 327 APIs |

---

## Track A — MVP Go-Live (6 Months, 500 Users)

### Scale targets

| Milestone | Users | Notes |
|-----------|-------|-------|
| Day 1 | 20–40 | Synchem (`SYN`) first tenant |
| Month 3 | 10–20 | Internal test + mobile offline |
| Month 4 | 40–50 | Pilot MRs |
| Month 5 | 100–200 | Beta |
| **Month 6** | **500** | Production go-live |

### Phase 0 — Foundation (Month 1)

- [ ] Monorepo scaffold (`apps/api`, `web`, `mobile`, `worker`, `packages/shared-types`)
- [ ] Docker Compose (Postgres, Redis, API, worker)
- [ ] GitHub Actions CI (lint, test, Docker build)
- [ ] Prisma schema v1 + migrations
- [ ] Auth: `/token` endpoint, JWT, refresh tokens
- [ ] **Multi-tenant:** `companies` table, `compCode` middleware, tenant settings
- [ ] **Platform super admin** + tenant admin roles
- [ ] RBAC: roles, menus, permissions (per tenant)
- [ ] React: login + sidebar shell (role-based menus)
- [ ] OpenAPI v1 skeleton

**Deliverable:** Login works, tenant isolation verified, sidebar renders.

### Phase 1 — Master Data (Month 2)

Priority P0 masters — see [modules/master-setup/](./modules/master-setup/)

| # | Master |
|---|--------|
| 1 | Hierarchy, Employee |
| 2 | City, HeadQuarter, Route |
| 3 | Product, Brand, Division |
| 4 | Doctor, Retailer, Stockist |
| 5 | Key LOVs (designation, specialist, dosage, etc.) |
| 6 | Bulk upload (7 types) |

**Deliverable:** Admin can set up full master data for Synchem.

### Phase 2 — Core Transactions Web (Month 3)

| # | Transaction | Priority |
|---|-------------|----------|
| 1 | Tour Programme (RTP) | P0 |
| 2 | Daily Call Report (DCR) | P0 |
| 3 | Weekly Plan | P0 |
| 4 | Personal Order Booking (POB) | P0 |

**Deliverable:** MR can plan and submit DCR on web (online).

### Phase 3 — Mobile MVP (Month 3–4, parallel Phase 2)

**Stack:** React Native + Expo + WatermelonDB — see [15-mobile-stack.md](./15-mobile-stack.md)

- [ ] Mobile login (EMPLOYEE + compCode) + MPIN
- [ ] Field Staff Dashboard
- [ ] **Offline DCR** + delta sync API
- [ ] GPS check-in (`expo-location`)
- [ ] Firebase push (approval pending)
- [ ] Load test: 100 concurrent syncs

**Deliverable:** MR submits DCR offline from mobile — **critical for 500 users**.

### Phase 4 — Approvals & Manager (Month 4–5)

Minimum approval queues for go-live:

- [ ] DCR Approval
- [ ] Tour Programme Approval
- [ ] Weekly Plan Approval
- [ ] Leave Approval
- [ ] Expense Approval
- [ ] Doctor / Retailer Approval
- [ ] Manager Dashboard + push notifications

**Deliverable:** Full submit → approve loop works.

### Phase 5 — Monthly Cycle + Reports (Month 5)

| Module | Features |
|--------|----------|
| Leave | Application + policy |
| Expense | Statement + template |
| Stock | Statement (basic) |
| Gift/Sample | Requisition + receive (basic) |
| Dashboards | FS, Manager, Management |
| Reports | **10–15 key reports** (not all 60) |

**Deliverable:** Month-end workflows + HO can view key reports.

### Phase 6 — Go-Live (Month 6)

- [ ] Staging UAT vs `synchem.salestrip.in`
- [ ] Load test (500 user simulation)
- [ ] Production deploy (2 API instances, managed DB)
- [ ] MR training + rollout
- [ ] Monitoring (Sentry, uptime alerts)

**Deliverable:** **500 live users** on production MVP.

---

## Track B — Full Parity (9–10 Months)

After MVP go-live, continue with remaining features:

### Phase 7 — Remaining Approvals & Transactions (Month 7–8)

- All 15 approval queues
- Infiltration, Input/Sales Plan, Focused Activity, Manager Day Allocation
- Manager Tour Programme, Manager DCR
- Stock revise/unlock, pool distribution

### Phase 8 — Reports Batch (Month 8–9)

60 report screens — implement in batches of 10:

1. DCR reports (14)
2. Sales reports (13)
3. Employee reports (10)
4. Doctor/Retailer reports (7)
5. Expense, Gift/Sample, Achievement, Tracking

Each report: filters + grid + Excel/PDF export.

### Phase 9 — Communication & Extras (Month 9–10)

- Internal mail (inbox, compose, sent, draft)
- Internal messages / broadcast
- E-Detailing with document upload
- Product price updation
- GPS live tracking map
- Login history report

### Phase 10 — AI Layer (Month 10+, optional)

- Voice-to-DCR (Whisper + LLM)
- Pre-call doctor brief
- Receipt OCR
- Manager approval summary
- See [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) Section 9

---

## Estimated Full Scope

| Category | Count |
|----------|-------|
| Menu screens | 146 |
| Additional routes | ~20 |
| API endpoints | 327 |
| User roles | 3+ (AD, MAN, FS) + Platform Super Admin |
| Approval workflows | 15 |

---

## Testing Strategy

| Type | Coverage |
|------|----------|
| Unit tests | Services, validators |
| API tests | All MVP endpoints (expand to 327) |
| E2E web | Playwright: Login → RTP → DCR → Approval |
| E2E mobile | Offline DCR → sync → approve |
| Load test | Month 5 — 500 user simulation |
| UAT | Side-by-side vs synchem.salestrip.in |
| Tenant isolation | Tenant A cannot access Tenant B |

**Critical E2E flow:**
```
Login → RTP → Mobile offline DCR → Sync → Manager approve → Report
```

---

## Team Recommendation

| Role | Count | Focus |
|------|-------|-------|
| Backend dev | 2 | NestJS API + Prisma + sync |
| Frontend dev | 1–2 | React web |
| Mobile dev | 1 | React Native + offline |
| QA | 1 | API + E2E + load test |
| PM/BA | 1 | UAT, client demos |
| DevOps | 0.5 | Docker, CI, staging |

| Track | Timeline | Team |
|-------|----------|------|
| **MVP (500 users)** | **6 months** | 5–7 |
| **Full parity** | 9–10 months | 5–7 |

---

## Risk Items

| Risk | Mitigation |
|------|------------|
| Hidden business rules in legacy backend | UAT against live Salestrip (read-only) |
| Mobile offline sync complexity | Start Month 3, dedicated sync API, load test Month 5 |
| 500 users by Month 6 with small team | Strict MVP scope — not all 152 screens |
| Multi-tenant data leak | Middleware + integration tests day 0 |
| Minified JS hard to reverse | This docs project + API probing |
| Report queries slow at scale | Indexes + read replica when needed |

---

*See [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) for locked tech stack, Docker, monorepo, and multi-tenant design.*
