# AGENTS.md — Instructions for AI Coding Agents

**Read this file before writing any code in this repository.**

Full details: [docs/18-DEVELOPMENT-STANDARDS.md](docs/18-DEVELOPMENT-STANDARDS.md)

Build context: [docs/17-FINAL-BUILD-PLAN.md](docs/17-FINAL-BUILD-PLAN.md)

**Current P0 focus:** [docs/24-MR-JOURNEY-SALES-PRIORITIES.md](docs/24-MR-JOURNEY-SALES-PRIORITIES.md) — MR journey + sales; **leave = P3 (defer)**.

**AI chatbot:** [docs/25-AI-ANALYTICS-CHATBOT-PLAN.md](docs/25-AI-ANALYTICS-CHATBOT-PLAN.md) — **Phase 10 only** (10A done; 10B+ after sales P0). Do not build chat UI or semantic layer ahead of roadmap.

Feature specs: [docs/modules/](docs/modules/)

---

## Project

Multi-tenant **Pharma SFA SaaS** — NestJS API + React web + React Native mobile. Monorepo (pnpm + Turborepo). First tenant: `compCode: SYN`.

---

## Strict Rules (MUST follow)

### Modularity
- One domain = one NestJS module under `apps/api/src/modules/{domain}/`
- One feature = one folder under `apps/web/src/features/{feature}/`
- Business logic in **services**, not controllers or React components
- Cross-module access only via **exported module services** — no deep imports

### No duplicate logic
- Before writing new code, **search** for existing implementation
- Shared validation/DTOs → `packages/shared-types`
- Shared queries → module `*.repository.ts` or Prisma middleware
- **Never copy-paste** the same block into two files

### Minimal scope — no random changes
- Change **only** files required by the task
- **Do NOT:** repo-wide format, unrelated refactors, dependency upgrades, rename drive-bys
- Match existing code style in touched files

### Naming (consistent)
- DB: `snake_case` tables/columns, tenant column always `comp_code`
- API JSON: `camelCase`; routes: kebab-case plural (`/api/daily-call-reports`)
- TS files: `kebab-case.ts`; classes `PascalCase`; functions `camelCase` verb-first
- Domain terms: `compCode`, `dcr`, `rtp`, `pob`, `headQuarter`, `approveStatus` — no synonyms

### Data safety & atomicity
- **Every query** must filter by `compCode` from JWT — never trust client tenant id
- Multi-step writes (submit + approval + audit, POB + lines, bulk upload) → **`prisma.$transaction()`**
- Use unique constraints + idempotency keys for mobile sync
- Soft delete on masters; no hard delete on submitted transactions

### Tests (required)
- New endpoint → integration test: success + 401 + tenant isolation + validation error
- New business rule in service → unit test all branches (mock repository **ports**)
- Bug fix → regression test
- **i18n:** every new user-facing string → add keys to `packages/shared-i18n` for **English, Hindi, and Hinglish**; run `@synchem-sfa/shared-i18n` parity tests
- Run `pnpm lint` and `pnpm test` in affected packages before finishing

### Languages (English + Hindi + Hinglish)
- Product supports **3 UI languages:** `en` (English), `hi` (Hindi/Devanagari), `hinglish` (Roman Hinglish)
- **Never hardcode** user-visible labels in components or API error messages — use `@synchem-sfa/shared-i18n` keys
- Web: `useI18n()` + `LanguageSwitcher`; persist choice in `localStorage` key `appLanguage`
- API: read `X-App-Language` (or `Accept-Language`) and return localized auth/validation messages where applicable
- Phase 1+ features: add message keys in the same PR as the UI/API change

### UI design (web)
- **Mobile-friendly + desktop** — responsive shell (drawer menu on phone), `PageLayout` / `PageSection` / `ResponsiveTable`
- Modern simple palette via `apps/web/src/theme/sfa-theme.ts` — teal primary, slate neutrals
- Loading / empty / error states on every list; dates `DD-MM-YYYY`; touch targets ≥ 40px
- Reuse `apps/web/src/components/ui/` — page = thin wrapper, logic in hooks
- Full rules: `.cursor/rules/sfa-ui-design.mdc` (always apply)

### Library-first (speed + standards)
- **Do not reinvent** tables, forms, date pickers, CSV parse, API caching if a stable OSS lib fits
- **Preferred web stack for new/touched UI:** Ant Design + TanStack Query + react-hook-form + Zod + dayjs
- Search repo first; add dependency only when it clearly saves time vs custom code
- Full approved list: `.cursor/rules/sfa-library-first.mdc`

### Scalable architecture (microservice-ready)
- **Ports & adapters:** services inject `*RepositoryPort`, `StoragePort`, `QueuePort` — never Prisma/S3 directly in business logic
- **Module boundaries:** no cross-module DB queries; use exported services or domain events + queue
- **Reports/sync/notifications** in separate modules — extractable to `apps/` later without rewrite

### Logging & debugging
- Structured JSON logs (Pino): always include `requestId`, `compCode`, `module`, `action`
- Pass `X-Request-Id` through API → workers → Sentry
- Never `console.log` in production code paths

### Environments (dev / uat / prod)
- `APP_ENV=dev|uat|prod` — same code, config via validated env schema (Zod at startup)
- All config through `ConfigService` — no hardcoded URLs/buckets/secrets
- `.env.example` committed; secrets gitignored
- `/health` + `/ready` endpoints from Phase 0
- Branches: `develop`→dev, `release/*`→uat, `main`→prod

### Future: Admin Workflow Builder (Phase 11)
- Planned **after Phase 4** — see [docs/21-WORKFLOW-BUILDER-PLAN.md](docs/21-WORKFLOW-BUILDER-PLAN.md)
- Drag-and-drop approval flows + business validation rules per tenant (`compCode`)
- Runtime uses generic `ApprovalService` — designer is config UI, not duplicate engine logic
- Do **not** start workflow builder until core transactions + hardcoded approvals exist

### Planned: Role & Access Configuration (Phase 1.5)
- **Before Phase 4 go-live** — see [docs/22-ROLE-ACCESS-CONFIG-PLAN.md](docs/22-ROLE-ACCESS-CONFIG-PLAN.md)
- Admin UI: Role Master (`ADM01`) + Role Setting permission matrix (`ADM04`)
- Controls sidebar visibility, button actions (Add/Edit/Delete), API guards, mobile feature tiles
- Do **not** ship production MR rollout without AD/MAN/FS permission templates (seed fix in 1.5E)

### CI/CD & migrations
- PR must pass: lint → typecheck → test → build
- Schema change → Prisma migration file required
- OpenAPI change → update `openapi/sfa-api-v1.yaml`
- Approvals → use generic `ApprovalService` engine, not per-entity duplicate logic

---

## Before coding

1. Read relevant `docs/modules/{feature}.md`
2. Identify target module — do not invent parallel structure
3. List files you will touch
4. Check [18-DEVELOPMENT-STANDARDS.md](docs/18-DEVELOPMENT-STANDARDS.md) Section 9 checklist

## After coding

1. Tests added/updated
2. No unrelated file changes
3. Transaction boundaries correct for multi-step operations
4. Tenant scope on all data access
5. New DB/external access uses port + adapter (not direct Prisma/lib in service)
6. Logs include requestId + compCode on key actions
7. User-facing text uses `@synchem-sfa/shared-i18n` (en / hi / hinglish) — no hardcoded labels
8. Web UI uses design-system / approved libs (antd, TanStack Query) — no new hand-built tables/forms unless justified

---

## Stack (locked — do not substitute)

| Layer | Tech |
|-------|------|
| API | NestJS + Prisma + PostgreSQL |
| Web | React 18 + Vite + TypeScript |
| Mobile | React Native + Expo + WatermelonDB |
| Shared | `packages/shared-types`, `packages/api-client` |
| AI analytics (later) | `apps/insights-service` — separate microservice; see [docs/25-AI-ANALYTICS-CHATBOT-PLAN.md](docs/25-AI-ANALYTICS-CHATBOT-PLAN.md) |

---

## Response format for Salestrip API parity

```json
{ "responseCode": 200, "errorObj": null, "data": {} }
```

Business validation errors: `responseCode: 417`

---

*Violations of these rules block merge. When in doubt, choose smaller diff + more tests.*
