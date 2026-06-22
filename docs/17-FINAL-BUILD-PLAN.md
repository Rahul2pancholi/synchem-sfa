# Final Build Plan — Pharma SFA SaaS Platform

**Single source of truth** for what we are building, how we are building it, and when we deliver.

> **Status:** Research complete — ready for Phase 0 (code not started yet)  
> **Coding rules (strict):** [AGENTS.md](../AGENTS.md) · [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md)  
> **Related:** [14-enterprise-architecture.md](./14-enterprise-architecture.md) · [15-mobile-stack.md](./15-mobile-stack.md) · [16-page-tree.md](./16-page-tree.md) · [08-clone-roadmap.md](./08-clone-roadmap.md)

---

## 1. What We Are Building

| Item | Decision |
|------|----------|
| **Product type** | **Pharma Sales Force Automation (SFA)** — not generic CRM |
| **Reference** | Synchem Salestrip (`synchem.salestrip.in`) — functional blueprint |
| **Delivery model** | **Multi-tenant SaaS** — multiple pharma companies on one platform |
| **First tenant** | Synchem Pharmaceuticals (`compCode: SYN`) |
| **Platforms** | **Web** (Admin/Manager) + **Mobile** (MR field app) + **NestJS API** |

### Core SFA loop

```
Plan (RTP/Weekly) → Field visit → DCR + POB → Manager approve → Reports & targets
```

---

## 2. Scale Targets

| Milestone | Users | Tenants | Infra level |
|-----------|-------|---------|-------------|
| **Day 1 launch** | 20–40 | 1 (Synchem) | Small — 1 API, 1 DB |
| **6 months** | **500** | 1–3 companies | Medium — 2 API instances, managed DB |
| **12+ months** | 2,000+ | 5–10 companies | Scale — read replica, autoscale |
| **Future** | 10,000+ | 50+ | Optional microservices extract |

**500 users in 6 months** = modular monolith is sufficient. **No microservices on day one.**

Peak concurrent estimate at 500 users: **50–120** (not all 500 online at once).

---

## 3. Final Tech Stack (Locked)

| Layer | Technology | Notes |
|-------|------------|-------|
| **Repo** | **Monorepo** — pnpm + Turborepo | Web + mobile + API + shared types |
| **Backend** | **NestJS + TypeScript + Prisma** | Modular monolith |
| **Web** | **React 18 + Vite + TypeScript** | NOT Next.js — internal SPA |
| **Mobile** | **React Native + Expo + WatermelonDB** | Android + iOS, offline DCR |
| **Database** | **PostgreSQL 16** | Managed (Supabase/Neon → scale later) |
| **Cache** | **Redis** | Sessions, menu cache, optional queue |
| **Queue** | **pg-boss** (MVP) → BullMQ/SQS at scale | Background jobs |
| **Auth** | OAuth2 `/token` + JWT + refresh | Same pattern as original Salestrip |
| **Multi-tenant** | `compCode` on every row + middleware | Day 0 requirement |
| **Docker** | **Yes** — local, CI, production | See Section 7 |
| **AI (later)** | NestJS `ai` module → OpenAI/Gemini APIs | NOT Python backend initially |
| **UI grids** | TanStack Table + MUI DataGrid (free) | Reports & masters |
| **Maps** | Mapbox (tracking) + Google (geocoding) | |
| **Files** | Cloudflare R2 / S3 — `/{compCode}/` prefix | |
| **Push** | Firebase FCM | Mobile notifications |

### TypeScript everywhere

```
Web (React) + Mobile (RN) + API (NestJS) → packages/shared-types
```

---

## 4. Monorepo Structure

```
synchem-sfa/
├── apps/
│   ├── api/                 # NestJS modular monolith
│   ├── worker/              # pg-boss background jobs
│   ├── web/                 # React + Vite
│   └── mobile/              # React Native + Expo
├── packages/
│   ├── shared-types/        # DTOs, enums — shared by all apps
│   ├── api-client/          # OpenAPI generated client
│   ├── eslint-config/
│   └── tsconfig/
├── infra/
│   └── docker/
│       ├── docker-compose.yml
│       ├── Dockerfile.api
│       ├── Dockerfile.worker
│       └── Dockerfile.web
├── docs/                    # This specification repo
└── openapi/
    └── sfa-api.yaml
```

---

## 5. Monorepo Now → Microservices Later

| Phase | Architecture |
|-------|--------------|
| **Now (0–6 months)** | Monorepo + **modular monolith** (NestJS modules) |
| **Future (when scale demands)** | Same monorepo — extract modules to separate `apps/` services |

**Do NOT split repos.** Extract services inside monorepo when needed:

| First extract candidates | Trigger |
|--------------------------|---------|
| Report Service | Report queries slow OLTP DB |
| Sync Service | Mobile sync traffic dominates |
| Notification Service | Push/email volume high |
| AI Service | Custom Python ML needed |

**Module boundary rules (from day 0):**
- Each NestJS module owns its domain (`dcr/`, `masters/`, `approvals/`)
- Cross-module via exported services only — no internal imports
- Shared types only in `packages/shared-types`
- Events for loose coupling (approval → notification)

---

## 6. Multi-Tenant SaaS (Day 0)

Not a single-company app — **platform for onboarding multiple pharma businesses.**

### Three layers

```
PLATFORM LAYER     → Super admin creates/suspends tenants
TENANT LAYER       → Per company: config, masters, transactions (comp_code isolated)
USER LAYER         → MR / Manager / Admin within one tenant
```

### Login (same as original Salestrip)

```
POST /token
username={user},{compCode}&password={pass}
```

Example: `amit,SYN` + password

### Day 0 multi-tenant checklist

- [ ] `companies` table (comp_code, name, logo, timezone, active)
- [ ] `comp_code` column on **every** business table
- [ ] JWT payload: `compCode` mandatory
- [ ] Tenant middleware on every API request
- [ ] Prisma auto-filter by tenant
- [ ] `tenant_settings` table (SET001–SET131 per company)
- [ ] Platform Super Admin role (separate from tenant Admin)
- [ ] "Create new tenant" admin screen + default seed (roles, menus, settings)
- [ ] S3/R2 path prefix: `/{compCode}/`
- [ ] Integration test: Tenant A cannot read Tenant B data

### Onboarding new business (future)

```
Super Admin → Create tenant (comp_code, name) → Seed defaults
           → Create tenant admin → Tenant admin sets up masters → MRs go live
```

---

## 7. Docker & Infrastructure

### Docker — YES

| Use | Docker? |
|-----|---------|
| Local development | ✅ `docker-compose` (Postgres, Redis, API) |
| CI/CD (GitHub Actions) | ✅ Build & test in containers |
| Production | ✅ Container images on Fly.io / AWS ECS |
| Mobile (Expo) | ❌ Separate build pipeline |
| Kubernetes | ❌ Not until 2,000+ users |

### Local `docker-compose.yml`

```yaml
services:
  postgres:    # PostgreSQL 16
  redis:       # Cache + sessions
  api:         # NestJS (hot reload volume mount)
  worker:      # pg-boss jobs
```

### Environments

| Env | Purpose | Hosting (MVP) |
|-----|---------|---------------|
| **Local** | Dev daily | Docker Compose |
| **Dev** | Team shared | Fly.io / Railway |
| **Staging** | UAT vs Salestrip | Fly.io Mumbai |
| **Production** | Live users | Fly.io Mumbai + Vercel (web) |

### Infra cost estimate

| Scale | Monthly infra |
|-------|---------------|
| 20–40 users | ₹3,000–8,000 |
| 500 users (6 mo) | ₹15,000–35,000 |
| AI layer (optional) | +₹7,000–20,000 |

### Production at 500 users (Month 6)

```
Load Balancer
    ├── NestJS API #1
    ├── NestJS API #2
    ├── Worker (pg-boss)
    ├── PostgreSQL (managed, backups)
    ├── Redis
    └── R2/S3 (files)
Mobile (400+ MR) ──sync──► API
Web (admin/manager) ──────► API
```

---

## 8. Mobile App — Confirmed

| Item | Detail |
|------|--------|
| **Framework** | React Native + Expo SDK 55+ |
| **Offline** | WatermelonDB (SQLite) |
| **Sync** | NestJS delta API `{ lastSyncAt, changes[] }` |
| **Primary user** | MR (Field Staff) — ~80% of users on mobile |
| **Platforms** | Android + iOS (one codebase) |
| **Start** | **Phase 3 (~Month 3)** — parallel with web, NOT late |

See [15-mobile-stack.md](./15-mobile-stack.md) for full mobile spec.

---

## 9. AI Strategy (Phase 8+ — Optional)

**Analytics chatbot** runs in **`apps/insights-service`** (extractable microservice) — Knowledge Graph + Semantic Layer + LLM (intent only) + SQL Validation. See [25-AI-ANALYTICS-CHATBOT-PLAN.md](./25-AI-ANALYTICS-CHATBOT-PLAN.md).

**Field AI features** (voice DCR, OCR) may live in main API + worker; not in insights-service.

| Feature | Where | Priority |
|---------|-------|----------|
| NL analytics chat (POB, coverage, missed calls) | `insights-service` | Month 9–10 |
| Voice → DCR | API + worker + Whisper | High differentiator |
| Pre-call doctor brief | insights-service + KG | Medium |
| Receipt OCR | Vision API (API/worker) | Medium |
| Manager approval summary | LLM (API or insights) | Medium |
| Help chatbot (RAG on docs) | Separate module / later | Low |

**Rules:** LLM must **not** emit free-form SQL — semantic layer templates only. AI async where possible; MR confirms before submit; audit log all suggestions.

Optional future: Python FastAPI sidecar for custom ML only.

---

## 10. Six-Month Delivery Plan (500 Users Go-Live)

**Goal:** Production-ready **MVP SFA** for 500 users by **Month 6** — not full 152 screens.

| Phase | Month | Deliverable |
|-------|-------|-------------|
| **0** Foundation | 1 | Monorepo, Docker, auth, RBAC, multi-tenant, CI |
| **1** Masters | 2 | Employee, doctor, retailer, product, HQ, route, bulk upload |
| **2** Core web | 3 | RTP, DCR, Weekly Plan, POB (API + web) |
| **3** Mobile | 3–4 | **Offline DCR, GPS, sync, push** (parallel) |
| **4** Approvals | 4–5 | DCR/RTP/Weekly approval + manager dashboard |
| **5** Monthly cycle | 5 | Leave, expense, stock, gift/sample basics |
| **6** Go-live | 6 | Dashboards, 10–15 key reports, UAT, **500 users** |

### User rollout timeline

| Month | Users |
|-------|-------|
| 3 | 10–20 internal test |
| 4 | 40–50 pilot MRs |
| 5 | 100–200 beta |
| **6** | **500 live** |

### Team (recommended)

| Role | Count |
|------|-------|
| Backend (NestJS) | 2 |
| Frontend (React) | 1–2 |
| Mobile (RN) | 1 |
| QA | 1 |
| PM/BA | 1 |
| **Total** | **5–7** |

---

## 11. MVP Scope (6-Month Go-Live)

Full platform: **152 pages, 327 APIs**. MVP subset for 500 users:

### Must have (MVP)

| Area | Screens / features |
|------|-------------------|
| Auth | Login, forgot password, MPIN (mobile) |
| Multi-tenant | Company create, compCode login, tenant settings |
| Masters | Employee, hierarchy, city, HQ, route, doctor, retailer, product, brand, stockist, key LOVs |
| Bulk upload | Doctor, retailer, product, city, HQ, route, stockist |
| Transactions | RTP, DCR, Weekly Plan, POB |
| Mobile | Offline DCR, GPS check-in, sync, push, FS dashboard |
| Approvals | DCR, RTP, Weekly Plan, Leave, Expense (minimum) |
| Dashboards | FS, Manager, Management (basic KPIs) |
| Reports | **10–15 key** (DCR summary, missed calls, target achievement, attendance, POB, sales summary) |
| Admin | Role master, role permissions ([Phase 1.5](./22-ROLE-ACCESS-CONFIG-PLAN.md)), company info, DCR settings, leave policy |

### Phase 2 after go-live (Month 7–10)

| Phase | Focus |
|-------|--------|
| **7** | Remaining approvals & transactions |
| **8** | Reports batch — **sales P0 reports feed Phase 10B** |
| **9** | Communication (mail, e-detailing) |
| **10** | **AI Analytics Chatbot** (10A done → 10B–10F) — [25-AI-ANALYTICS-CHATBOT-PLAN.md](./25-AI-ANALYTICS-CHATBOT-PLAN.md) |
| **11** | Workflow & rules builder |

Also:

- Remaining ~45 reports
- All 15 approval types
- **Admin Role & Access UI** — configure menus/features per role ([22-ROLE-ACCESS-CONFIG-PLAN.md](./22-ROLE-ACCESS-CONFIG-PLAN.md)) — **Phase 1.5, pre go-live**
- Internal mail, e-detailing
- Infiltration, focused activity, input/sales plan
- Full parity with Salestrip (152 screens)

See [16-page-tree.md](./16-page-tree.md) for complete page list.

---

## 12. Full Parity Timeline (Optional Track)

| Track | Duration | Output |
|-------|----------|--------|
| **MVP (6 months)** | 6 months | 500 users, core SFA |
| **Full parity** | 9–10 months | All 152 screens, 327 APIs |

See [08-clone-roadmap.md](./08-clone-roadmap.md) for detailed full-parity phase breakdown.

---

## 13. Critical E2E Flow (Must Pass Every Release)

```
Login (compCode + user) → RTP plan → Mobile offline DCR → Sync
→ Manager approve → Report shows data
```

---

## 14. Pre-Build Checklist

Before Phase 0 code starts:

| # | Item | Status |
|---|------|--------|
| 1 | Final tech stack locked | ✅ Done |
| 2 | Multi-tenant SaaS model defined | ✅ Done |
| 3 | Scale targets (20→500 in 6 mo) | ✅ Done |
| 4 | Mobile confirmed (React Native) | ✅ Done |
| 5 | Monorepo + Docker plan | ✅ Done |
| 6 | MVP vs full parity defined | ✅ Done |
| 7 | Development standards + AI rules | ✅ Done — [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md), [AGENTS.md](../AGENTS.md) |
| 8 | OpenAPI v1 draft | ✅ Done — [openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml) |
| 9 | Prisma schema v1 draft | ✅ Done — [prisma/schema.prisma](../prisma/schema.prisma) |
| 10 | Offline sync protocol doc | ✅ Done — [20-OFFLINE-SYNC-PROTOCOL.md](./20-OFFLINE-SYNC-PROTOCOL.md) |
| 11 | MVP screen list (formal) | ✅ Done — [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) |
| 12 | CI/CD + security + migration standards | ✅ Done — [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md) §11–18 |
| 13 | Client MVP scope sign-off | ☐ Pending — [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) ready |
| 14 | Team size confirmed | ☐ Pending |
| 15 | Live Salestrip UAT access | ☐ Pending |
| 16 | Application code (Phase 0) | ☐ Not started |

---

## 15. What We Are NOT Building (Scope Guard)

| Not in scope | Reason |
|--------------|--------|
| Generic CRM | SFA is field-force specific |
| Hospital ERP | Different domain |
| Microservices day 1 | Overkill for 500 users |
| Next.js | Internal SPA — Vite sufficient |
| Flutter mobile | React Native — TS monorepo |
| Python backend (initial) | NestJS + AI APIs sufficient |
| Kubernetes MVP | Fly.io containers enough |
| All 60 reports in MVP | 10–15 first, rest batch |

---

## 16. Development Standards (Strict — All Code)

Every developer and AI agent **MUST** follow before and during coding:

| Doc | Purpose |
|-----|---------|
| **[AGENTS.md](../AGENTS.md)** | Short strict rules for AI agents |
| **[18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md)** | Full standards — modularity, DRY, naming, tests, transactions |

**Non-negotiable:** modular code · no duplicate logic · minimal diffs · tests required · `compCode` on every query · `$transaction` for multi-step writes · **ports/adapters for DB & libs** · **dev/uat/prod config** · **structured logging**.

Cursor rules: `.cursor/rules/sfa-development-standards.mdc` (always on) · `.cursor/rules/sfa-scalability-patterns.mdc` (API/infra)

---

## 17. Document Map

| Doc | Purpose |
|-----|---------|
| **[17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)** | **This file — master build decisions** |
| **[18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md)** | **Strict coding rules — modularity, tests, data safety** |
| [AGENTS.md](../AGENTS.md) | AI agent entry point |
| [14-enterprise-architecture.md](./14-enterprise-architecture.md) | Architecture diagrams & patterns |
| [15-mobile-stack.md](./15-mobile-stack.md) | Mobile app detail |
| [16-page-tree.md](./16-page-tree.md) | All 152 pages tree |
| [08-clone-roadmap.md](./08-clone-roadmap.md) | Full parity phase detail |
| [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) | MVP screens checklist |
| [20-OFFLINE-SYNC-PROTOCOL.md](./20-OFFLINE-SYNC-PROTOCOL.md) | Mobile sync protocol |
| [openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml) | OpenAPI v1 draft |
| [prisma/schema.prisma](../prisma/schema.prisma) | Prisma schema v1 draft |
| [12-MASTER-CLONE-BIBLE.md](./12-MASTER-CLONE-BIBLE.md) | Original system + live data |
| [modules/](./modules/) | Per-feature specs (146 screens) |

---

*Document version: 1.0 — June 2026*
