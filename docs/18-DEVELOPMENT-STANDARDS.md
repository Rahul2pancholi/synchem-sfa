# Development Standards — Strict Rules for All Code

**Mandatory for every developer and AI agent writing code in this project.**

> **Purpose:** Modular code, zero duplicate logic, safe data, proper tests, no random changes.  
> **Enforcement:** PR review + CI must pass. Violations block merge.  
> **AI agents:** Read [AGENTS.md](../AGENTS.md) first, then follow this document exactly.

---

## 0. Golden Rules (Non-Negotiable)

| ID | Rule |
|----|------|
| **DEV-001** | **Modular only** — every feature lives in its own NestJS module / React feature folder. No god files. |
| **DEV-002** | **No duplicate logic** — if logic appears twice, extract to shared service/hook/util in the correct layer. |
| **DEV-003** | **Minimal diff** — change only what the task requires. No drive-by refactors, renames, or formatting unrelated files. |
| **DEV-004** | **Tests required** — every new service, API endpoint, or business rule gets tests before merge. |
| **DEV-005** | **Data safety** — multi-step writes use DB transactions. Tenant isolation on every query. |
| **DEV-006** | **Naming consistency** — follow conventions in Section 3. No invented synonyms for the same concept. |
| **DEV-007** | **Shared types** — DTOs/enums used by 2+ apps live in `packages/shared-types`, never copied. |
| **DEV-008** | **Ports & adapters** — business code depends on interfaces (ports), not Prisma/S3/Redis directly. |
| **DEV-009** | **Microservice-ready modules** — no cross-module DB access; communicate via exported services or events. |
| **DEV-010** | **Structured observability** — every request gets correlation ID; logs searchable by tenant/user/action. |
| **DEV-011** | **Config via environment** — no hardcoded URLs/keys; dev / uat / prod use same code, different env files. |
| **DEV-012** | **Health & readiness** — `/health` and `/ready` endpoints from Phase 0 for debugging deploys. |

---

## 1. Architecture & Modularity

### 1.1 Backend (NestJS) — one domain = one module

```
apps/api/src/modules/
├── auth/
├── tenant/
├── masters/
│   ├── doctor/
│   ├── product/
│   └── employee/
├── transactions/
│   ├── dcr/
│   ├── rtp/
│   └── pob/
└── approvals/
```

**MUST:**
- Each module has: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`, `ports/*.port.ts`, `adapters/prisma-*.repository.ts`
- Module exports only its public service — other modules import via module exports, not deep file paths
- Cross-module calls go through **exported services** or **domain events** — never import another module's internal files
- Business logic lives in **services**, not controllers
- DB access lives in **services or repositories** — never in controllers

**MUST NOT:**
- Put unrelated features in the same service file
- Create a `utils/` dump for domain logic — put it in the correct module or `packages/shared-types`
- Import from `../../../other-module/internal/` — use module boundary

### 1.2 Frontend (React) — feature folders

```
apps/web/src/features/
├── auth/
├── masters/doctor/
├── transactions/dcr/
└── shared/          # UI primitives only — no business rules
```

**MUST:**
- Page component = thin wrapper; logic in `hooks/` and `api/` within the feature
- Shared UI in `components/ui/` — shared API client in `packages/api-client`
- No API calls directly inside presentational components

### 1.3 Mobile (React Native) — same feature names as web/API

```
apps/mobile/src/features/dcr/
```

Keep feature names aligned across `api`, `web`, and `mobile`.

### 1.4 Shared packages

| Package | Contains | Must NOT contain |
|---------|----------|------------------|
| `packages/shared-types` | DTOs, enums, constants, Zod schemas | Business logic, DB calls |
| `packages/api-client` | Generated OpenAPI client | Hand-written fetch wrappers duplicating client |
| `packages/eslint-config` | Lint rules | — |

---

## 2. No Duplicate Logic (DRY)

### When to extract

| Situation | Extract to |
|-----------|------------|
| Same validation in 2+ endpoints | Zod schema in `shared-types` or module `dto/` |
| Same Prisma query in 2+ services | `*.repository.ts` in that module |
| Same HTTP error mapping | `common/filters/http-exception.filter.ts` |
| Same date/status formatting | `packages/shared-types` or module helper |
| Same React form logic | Custom hook `useXxxForm.ts` in feature folder |
| Same tenant filter | Prisma middleware or base repository — **never copy `where: { compCode }` by hand in every file** |

### DRY checklist before PR

- [ ] Searched codebase for similar logic (`grep`/semantic search)
- [ ] Reused existing service/hook if found
- [ ] If extracted new shared code, added tests for it

**MUST NOT:** Copy-paste a 10+ line block into another file "just for now".

---

## 3. Naming Conventions

### 3.1 Database (Prisma / PostgreSQL)

| Item | Convention | Example |
|------|------------|---------|
| Table | `snake_case`, plural | `doctors`, `daily_call_reports` |
| Column | `snake_case` | `comp_code`, `created_at`, `approve_status` |
| PK | `id` (UUID or bigint — pick one, stick to it) | `id` |
| FK | `{entity}_id` | `doctor_id`, `employee_id` |
| Tenant column | **`comp_code`** everywhere | `comp_code` |
| Timestamps | `created_at`, `updated_at`, `deleted_at` | soft delete where needed |
| Status fields | `{noun}_status` or match Salestrip | `approve_status` |
| Index | `idx_{table}_{columns}` | `idx_doctors_comp_code_hq_id` |

### 3.2 API (REST)

| Item | Convention | Example |
|------|------------|---------|
| Base path | `/api/{resource}` kebab-case plural | `/api/daily-call-reports` |
| Route params | camelCase in code, kebab in URL | `:doctorId` → `/doctors/:doctorId` |
| Query params | camelCase | `?headQuarterId=5` |
| JSON body keys | **camelCase** | `{ compCode, doctorId, workDate }` |
| Response wrapper | Match original Salestrip | `{ responseCode, errorObj, data }` |

### 3.3 TypeScript code

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `daily-call-report.service.ts` |
| Classes | PascalCase | `DailyCallReportService` |
| Interfaces/Types | PascalCase, no `I` prefix | `CreateDcrDto`, not `ICreateDcrDto` |
| Functions/methods | camelCase, verb-first | `submitDcr`, `findDoctorsByHq` |
| Constants | SCREAMING_SNAKE | `MAX_DCR_LINES`, `APPROVE_STATUS_PENDING` |
| Enums | PascalCase name, PascalCase members | `ApproveStatus.Pending` |
| React components | PascalCase file + export | `DoctorListPage.tsx` |
| React hooks | `use` prefix | `useDcrForm.ts` |
| Test files | `{name}.spec.ts` or `{name}.test.ts` | `dcr.service.spec.ts` |

### 3.4 Domain terms (use exactly — no synonyms)

| Use | Do NOT use |
|-----|------------|
| `compCode` | companyId, tenantId (in API/domain) |
| `dcr` / `DailyCallReport` | dailyReport, callLog |
| `rtp` / `TourProgramme` | tourPlan, routePlan |
| `pob` / `PersonalOrderBooking` | order, booking |
| `headQuarter` / `hq` | territory (unless UI label) |
| `fieldStaff` / `mr` | salesman, agent |
| `approveStatus` | status, approvalState |

---

## 4. Change Discipline (No Random Changes)

**AI agents and developers MUST:**

1. **Read** the task and relevant spec in `docs/modules/` before coding
2. **List** files to touch — only those files (+ tests + migrations if needed)
3. **Implement** the smallest change that satisfies the task
4. **Run** lint + tests for affected packages
5. **Document** migration steps if schema changed

**MUST NOT (without explicit request):**

- Reformat entire files or run repo-wide prettier/eslint "fixes"
- Rename variables/modules unrelated to the task
- Upgrade dependencies
- Refactor working code in the same PR as a feature
- Delete code/comments "for cleanup"
- Change API response shape from Salestrip contract without approval

### PR scope template

```
Task: [e.g. DEV-123 Create DCR submit endpoint]
Files changed: [list]
Out of scope: [what you intentionally did NOT change]
Tests added: [list]
```

---

## 5. Data Safety & Atomicity

### 5.1 Multi-tenant isolation (every read/write)

**MUST:**
- Every business table has `comp_code`
- JWT carries `compCode` — middleware validates on every request
- Every Prisma query includes tenant scope (middleware or repository base class)
- Integration test proves Tenant A cannot access Tenant B data

```typescript
// ❌ FORBIDDEN — unscoped query
await prisma.doctor.findMany({ where: { hqId } });

// ✅ REQUIRED — tenant scoped
await prisma.doctor.findMany({
  where: { compCode: ctx.compCode, hqId },
});
```

### 5.2 Transactions — when REQUIRED

Use `prisma.$transaction()` when an operation:

| Scenario | Atomic? |
|----------|---------|
| DCR submit + approval queue row + notification | **YES** |
| POB lines + stock deduction | **YES** |
| RTP day allocation + multiple route assignments | **YES** |
| Bulk upload — all rows or rollback with error report | **YES** |
| Approval status change + audit log | **YES** |
| Single master CRUD (one row) | Optional |
| Read-only report query | No |

```typescript
// ✅ Pattern — interactive transaction for business workflow
await this.prisma.$transaction(async (tx) => {
  const dcr = await tx.dailyCallReport.update({
    where: { id: dcrId, compCode },
    data: { approveStatus: 'PENDING' },
  });
  await tx.approvalQueue.create({
    data: { compCode, entityType: 'DCR', entityId: dcr.id, ... },
  });
  await tx.auditLog.create({ data: { ... } });
});
```

### 5.3 Concurrency

- Use DB unique constraints for idempotency keys (e.g. sync client UUID)
- Optimistic locking (`version` column) for edit conflicts on DCR/RTP
- Never rely on "read then write" outside a transaction for money/qty/status workflows

### 5.4 Soft delete & audit

- Masters: prefer `deleted_at` soft delete unless spec says hard delete
- Transactions after submit: **no hard delete** — status workflow only
- Sensitive actions: write `audit_logs` row in same transaction

### 5.5 Input validation

- **Zod** or `class-validator` on every input DTO
- Reject unknown fields where security matters
- Never trust client `compCode` — always from JWT context

---

## 6. Testing Standards

### 6.1 Required coverage by change type

| Change | Required tests |
|--------|----------------|
| New API endpoint | Integration/e2e test: happy path + auth + tenant isolation + validation error |
| New service method with business rules | Unit test: all branches + edge cases |
| Bug fix | Regression test that fails without fix |
| Prisma schema / migration | Migration applies cleanly + at least one test hitting new column |
| React form/page | Component test for critical validation OR e2e for happy path |
| Sync/offline logic | Unit tests for conflict resolution + idempotency |

### 6.2 Test structure

```
apps/api/src/modules/dcr/
├── dcr.service.ts
├── dcr.service.spec.ts      # unit
└── dcr.e2e-spec.ts          # optional per module, required for auth/tenant/dcr
```

**Naming:**
- `describe('DcrService')` → `describe('submitDcr')` → `it('should reject submit when already approved')`

### 6.3 Test data

- Use factories/builders — no copy-paste JSON blobs across tests
- Each test creates its own tenant (`compCode: 'TEST1'`) — never use production `SYN` data in tests
- Clean up or use transaction rollback in integration tests

### 6.4 CI gate

PR cannot merge unless:

- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (affected packages minimum)
- [ ] No decrease in coverage on touched modules (when coverage enabled)
- [ ] Tenant isolation test exists for new modules with data access

---

## 7. Error Handling, Logging & Debugging

### 7.1 Error response (API)

| Case | Pattern |
|------|---------|
| Validation error | `400` / `responseCode` + clear `errorObj.message` |
| Business rule violation | `417` (match Salestrip) + code enum |
| Unauthorized | `401` — no stack trace to client |
| Tenant mismatch | `403` — log security event |
| Not found | `404` — do not leak whether row exists in other tenant |

**MUST NOT:** Swallow errors in empty `catch {}`.

### 7.2 Structured logging (find breaks fast)

Use **JSON structured logs** (Pino recommended) — not `console.log`.

**Every log line MUST include when available:**

| Field | Purpose |
|-------|---------|
| `requestId` / `correlationId` | Trace one user action across services |
| `compCode` | Filter logs per tenant |
| `userId` / `empId` | Who triggered the action |
| `module` | e.g. `dcr`, `auth`, `sync` |
| `action` | e.g. `submitDcr`, `approveLeave` |
| `durationMs` | Slow query detection |
| `env` | `dev` \| `uat` \| `prod` |

```typescript
// ✅ GOOD — searchable in Datadog/CloudWatch
logger.info({
  requestId, compCode, empId, module: 'dcr', action: 'submitDcr',
  dcrId, durationMs: 42,
}, 'DCR submitted');

// ❌ BAD
console.log('DCR submitted', id);
```

### 7.3 Correlation ID flow

```
Client → X-Request-Id header (or generate UUID)
  → NestJS middleware attaches to AsyncLocalStorage / request context
  → All services/repositories log same requestId
  → Worker jobs inherit requestId from queue payload
  → Error tracker (Sentry) tags same requestId
```

**MUST:** Pass `requestId` into worker jobs and audit logs.

### 7.4 Error tracking (prod/uat)

| Environment | Tool |
|-------------|------|
| dev | Console + pretty Pino |
| uat | Sentry (or similar) + structured logs |
| prod | Sentry + log aggregation + alerts |

**MUST:** Capture unhandled exceptions with stack + `requestId` + `compCode` (never passwords/tokens).

### 7.5 Debug checklist when code breaks

1. Get `requestId` from API response header or error report
2. Search logs: `requestId + compCode`
3. Check `/ready` — DB + Redis up?
4. Check migration version matches env
5. Reproduce in uat with same tenant + payload
6. Run failing test locally: `pnpm test -- --testPathPattern=dcr`

---

## 8. Scalability & Microservice-Ready Design

**Day 1 = modular monolith.** Code MUST be written so modules can become separate `apps/` later **without rewrite**.

### 8.1 Layer model (inside each module)

```
Controller  →  Service (business rules)  →  Repository Port  →  Adapter (Prisma/S3/Queue)
     ↑              ↑                              ↑
  HTTP only    No HTTP/Prisma imports        Infrastructure only
```

**MUST:**
- Service layer has **zero** imports from `@nestjs/common` HTTP types, Express, or Prisma client types in method signatures exposed to other modules
- Other modules call **Service public methods** only — never call Repository directly
- Heavy read workloads (reports) go through dedicated `ReportQueryPort` — first implementation uses Prisma read replica; later extract to `apps/report-service`

### 8.2 Microservice extraction rules

| Rule | Why |
|------|-----|
| Module owns its tables | Clean DB boundary when splitting |
| No JOINs across module tables in one query | Use service call or denormalized read model |
| Cross-module async via **domain events** + queue | Notification/sync/report decoupled |
| Shared DB OK in monolith; shared **repositories** across modules forbidden | Prevents hidden coupling |
| OpenAPI contract per module prefix | Mobile/web unchanged when service splits |

**First extract candidates** (from [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)):

| Module | Trigger to extract |
|--------|-------------------|
| `reports/` | OLTP slow; move to read replica or `apps/report-service` |
| `sync/` | Mobile sync traffic dominates |
| `notifications/` | Push/email volume high |
| `ai/` | Custom Python ML needed |

### 8.3 Domain events (loose coupling)

```typescript
// ✅ GOOD — approval module emits; notification module listens
this.eventBus.publish(new DcrSubmittedEvent({ compCode, dcrId, managerId }));

// ❌ BAD — DCR service directly calls Firebase + email + SMS inline
await this.fcm.send(...); await this.mail.send(...);
```

Use **pg-boss** queue for async handlers — same queue interface whether monolith or split.

### 8.4 Read vs write separation (reports scale path)

| Phase | Pattern |
|-------|---------|
| MVP | Reports query OLTP DB with indexes |
| 500+ users | Read replica + report-specific repositories |
| Scale | Materialized views or extract report service |

Report code lives in `modules/reports/` — never mixed into `dcr.service.ts`.

---

## 9. Repository & Adapter Pattern (DB + Libraries)

**Goal:** Swap PostgreSQL → another DB, S3 → R2, pg-boss → SQS by changing adapter binding — **not** business logic.

### 9.1 Folder structure

```
apps/api/src/
├── modules/
│   └── transactions/dcr/
│       ├── dcr.service.ts              # business logic — injects ports
│       ├── dcr.controller.ts
│       ├── ports/
│       │   └── dcr.repository.port.ts  # interface
│       └── adapters/
│           └── prisma-dcr.repository.ts # Prisma implementation
├── infrastructure/
│   ├── persistence/
│   │   ├── prisma.service.ts           # Prisma client wrapper
│   │   └── base-tenant.repository.ts   # compCode filter helper
│   ├── storage/
│   │   ├── storage.port.ts
│   │   └── s3-storage.adapter.ts
│   ├── queue/
│   │   ├── queue.port.ts
│   │   └── pg-boss.adapter.ts
│   └── cache/
│       ├── cache.port.ts
│       └── redis-cache.adapter.ts
```

### 9.2 Port interface pattern (NestJS DI)

```typescript
// ports/dcr.repository.port.ts
export interface DcrRepositoryPort {
  findById(compCode: string, id: string): Promise<Dcr | null>;
  submit(compCode: string, input: SubmitDcrInput, tx?: TransactionClient): Promise<Dcr>;
}

export const DCR_REPOSITORY = Symbol('DCR_REPOSITORY');

// dcr.module.ts
providers: [
  { provide: DCR_REPOSITORY, useClass: PrismaDcrRepository },
  DcrService,
],
```

```typescript
// dcr.service.ts — depends on port, NOT Prisma
constructor(@Inject(DCR_REPOSITORY) private readonly dcrRepo: DcrRepositoryPort) {}
```

### 9.3 What gets a port (always)

| Dependency | Port name | Default adapter | Swappable to |
|------------|-----------|-----------------|--------------|
| Database per module | `{Entity}RepositoryPort` | `Prisma*Repository` | Another ORM / raw SQL / remote API |
| File storage | `StoragePort` | `S3StorageAdapter` | R2, local filesystem (dev) |
| Queue | `QueuePort` | `PgBossAdapter` | BullMQ, SQS |
| Cache | `CachePort` | `RedisCacheAdapter` | In-memory (dev/test) |
| Push notifications | `PushNotificationPort` | `FcmAdapter` | Another provider |
| Email | `EmailPort` | `SesAdapter` | SendGrid, SMTP |

### 9.4 Rules

**MUST:**
- Business services inject **ports** via NestJS tokens — never `new PrismaClient()` inside service
- Prisma types (`Prisma.DcrCreateInput`) stay inside **adapter** — port uses domain DTOs from `shared-types`
- One repository per aggregate (Dcr, Doctor) — not one giant `DatabaseService`

**MUST NOT:**
- Import `PrismaService` in controllers or cross-module services
- Spread Prisma-specific queries across 5 service files — consolidate in repository adapter

### 9.5 Testing benefit

```typescript
// Unit test — mock port, no DB needed
const mockRepo: DcrRepositoryPort = { submit: jest.fn(), findById: jest.fn() };
const service = new DcrService(mockRepo);
```

Integration tests use real `PrismaDcrRepository` against test DB.

---

## 10. Environment Configuration (Dev / UAT / Prod)

**Same codebase — different config.** No `if (prod)` scattered in business logic.

### 10.1 Environment names

| `APP_ENV` | Purpose | Data |
|-----------|---------|------|
| `dev` | Local development | Docker Postgres, seed data |
| `uat` | Staging / client UAT vs Salestrip | Anonymized or copy of prod schema |
| `prod` | Live users | Real tenant data |

Also use `NODE_ENV`: `development` | `test` | `production` (Node convention).

### 10.2 Config file layout

```
apps/api/
├── .env.example          # All keys documented — committed
├── .env.local            # dev secrets — gitignored
infra/docker/
├── .env.dev.example
├── .env.uat.example
└── .env.prod.example     # No secret values — reference vault keys
```

### 10.3 Config module (validate at startup)

```typescript
// config/env.schema.ts — Zod validates on boot; fail fast if missing
export const EnvSchema = z.object({
  APP_ENV: z.enum(['dev', 'uat', 'prod']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  S3_BUCKET: z.string(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});
```

**MUST:**
- All env access through `ConfigService` / typed config module — **never** `process.env.X` scattered in code
- App **refuses to start** if required env vars missing or invalid
- Secrets only from env / vault — never committed

**MUST NOT:**
- Hardcode API URLs, DB hosts, or bucket names in source
- Use production credentials in dev/uat files

### 10.4 Environment-specific behaviour

| Concern | dev | uat | prod |
|---------|-----|-----|------|
| Log level | `debug` | `info` | `info` |
| Error stack to client | yes (careful) | no | no |
| Sentry | off | on | on |
| CORS | localhost | uat domain | prod domain |
| Rate limiting | relaxed | normal | strict |
| Swagger/OpenAPI | enabled | enabled | disabled or auth-gated |

Use config flags — not inline `if (process.env.APP_ENV === 'prod')` in services:

```typescript
// ✅ GOOD
if (this.config.features.swaggerEnabled) { ... }

// ❌ BAD — scattered env checks in business code
if (process.env.APP_ENV !== 'prod') { ... }
```

### 10.5 Docker Compose environments

```yaml
# infra/docker/docker-compose.yml        — dev (default)
# infra/docker/docker-compose.uat.yml    — uat overrides
# infra/docker/docker-compose.prod.yml   — prod (reference — real prod uses managed DB)
```

Commands:

```bash
pnpm docker:dev    # docker compose -f docker-compose.yml up
pnpm docker:uat    # docker compose -f docker-compose.yml -f docker-compose.uat.yml up
```

### 10.6 Health endpoints (debug deploy issues)

| Endpoint | Checks | Use |
|----------|--------|-----|
| `GET /health` | Process alive | Load balancer ping |
| `GET /ready` | DB + Redis + migrations | Deploy gate — pod not ready until DB OK |

Return JSON: `{ status, version, env, checks: { db: 'ok', redis: 'ok' } }`

---

## 11. CI/CD Pipeline Standards

### 11.1 GitHub Actions pipeline (every PR)

```
lint → typecheck → unit tests → integration tests → build Docker image
```

| Stage | Command | Fail condition |
|-------|---------|----------------|
| Lint | `pnpm lint` | Any error |
| Typecheck | `pnpm typecheck` | TS errors |
| Test | `pnpm test` | Any failure |
| Build | `pnpm build` | Build error |
| Docker | `docker build -f infra/docker/Dockerfile.api .` | Image build fail |

### 11.2 Branch → environment mapping

| Branch | Deploy to | Auto? |
|--------|-----------|-------|
| `feature/*` | — | CI only |
| `develop` | **dev** | Auto on merge |
| `release/*` | **uat** | Auto on tag |
| `main` | **prod** | Manual approval gate |

### 11.3 Deploy checklist

- [ ] Migrations applied on target env (`prisma migrate deploy`)
- [ ] `/ready` returns 200 before traffic switch
- [ ] Smoke test: login + tenant isolation
- [ ] Rollback plan documented in PR

### 11.4 CI rules for AI agents

- **MUST** run lint + test locally before pushing
- **MUST NOT** disable CI checks or skip tests in PR
- **MUST** add migration file when `schema.prisma` changes

---

## 12. Security Standards

### 12.1 Authentication & authorization

| Rule | Implementation |
|------|----------------|
| JWT expiry | Access token ≤ 12h; refresh rotation on use |
| Password | bcrypt/argon2; rules 8–15 chars + number + special |
| RBAC | `@RequirePermission('TRN03', 'CanAdd')` guard on every endpoint |
| Platform admin | Separate `PlatformUser` — cannot access tenant data without audit |
| Impersonation | Admin login-as-user — full audit log row |

### 12.2 Rate limiting

| Endpoint | Limit |
|----------|-------|
| `POST /token` | 10/min per IP |
| `POST /api/v1/sync/push` | 60/min per device |
| Report export | 5/min per user |
| Bulk upload | 2 concurrent per tenant |

### 12.3 Input & files

- Max JSON body: 2 MB (10 MB bulk upload endpoints)
- File upload: whitelist MIME types; max 10 MB; scan in prod (ClamAV or cloud)
- Pre-signed URLs for S3/R2 — no public buckets
- SQL injection: Prisma parameterized queries only — no raw SQL without review

### 12.4 Secrets

- **Never** commit `.env`, keys, passwords
- Rotate JWT secret and DB creds on compromise
- UAT/prod secrets from vault (AWS Secrets Manager / Fly secrets)

### 12.5 Security tests (required)

- Tenant isolation test per new module
- Auth: 401 without token, 403 wrong permission
- Rate limit test on `/token` (optional in CI, required before prod)

---

## 13. Database Migrations

### 13.1 Rules

| Rule | Detail |
|------|--------|
| Tool | Prisma Migrate only — no manual prod SQL without migration file |
| Naming | `YYYYMMDDHHMMSS_description` e.g. `20260618120000_add_sync_batches` |
| Backward compatible | Add columns nullable first; backfill; then NOT NULL in next migration |
| Destructive changes | Require explicit approval + backup before prod |
| Rollback | Forward-fix preferred; `prisma migrate resolve` for failed deploys |

### 13.2 Migration workflow

```
1. Edit prisma/schema.prisma
2. pnpm prisma migrate dev --name add_feature_x
3. Commit migration SQL + schema
4. PR includes migration notes in description
5. UAT: prisma migrate deploy → smoke test
6. Prod: backup → migrate deploy → /ready check
```

### 13.3 Zero-downtime patterns

- Add new column (nullable) → deploy code reading both → backfill → deploy code using new only → drop old
- Rename: add new column + sync trigger/job — never `RENAME COLUMN` on hot tables in prod without plan
- Indexes: `CREATE INDEX CONCURRENTLY` for large tables in prod

### 13.4 Seed data

- `prisma/seed.ts` — dev/uat only (SYN tenant, admin user, sample menus)
- **Never** run seed on production
- Use `data/live-sample-data.json` as reference — redact passwords

---

## 14. API Standards

### 14.1 Versioning

- Base path: **`/api/v1/`** for all new endpoints
- Legacy Salestrip parity routes may alias without version during migration
- Breaking change → `/api/v2/` — v1 supported minimum 6 months

### 14.2 List endpoint pagination (standard)

```
GET /api/v1/doctors?page=1&pageSize=20&sort=doctorName&order=asc&headQuarterId=5
```

Response:

```json
{
  "responseCode": 200,
  "errorObj": null,
  "data": {
    "items": [],
    "page": 1,
    "pageSize": 20,
    "total": 33730,
    "totalPages": 1687
  }
}
```

**MUST:** Cap `pageSize` at 100. Default 20.

### 14.3 Idempotency

| Use case | Header / field |
|----------|----------------|
| Mobile sync push | `X-Idempotency-Key` = `syncBatchId` |
| DCR create from mobile | `clientId` UUID in body |
| Payment-like ops (future) | `Idempotency-Key` header |

Server stores result 24h — duplicate request returns same response.

### 14.4 OpenAPI contract

- Source: `openapi/sfa-api-v1.yaml`
- Client generated to `packages/api-client`
- **MUST** update OpenAPI when adding/changing public endpoints
- CI: validate OpenAPI schema on PR

---

## 15. Generic Approval Workflow Engine

**One engine — 15 queues.** Do not duplicate approval logic per entity.

### 15.1 States

```
DRAFT → SUBMITTED → PENDING → APPROVED | REJECTED → LOCKED
                                      ↓
                              UNLOCK_REQUEST → UNLOCK_APPROVED → editable
```

### 15.2 Engine responsibilities

| Component | Role |
|-----------|------|
| `ApprovalService.submit()` | Create `approval_queue_items` row + notification event |
| `ApprovalService.approve()` | Update entity status + queue + audit in **one transaction** |
| `ApprovalService.reject()` | Same with REJECTED |
| Entity services | Call engine — never insert queue rows directly |

### 15.3 Configuration per entity type

```typescript
// packages/shared-types/src/approval-config.ts
{
  entityType: 'DCR',
  menuCode: 'APP01',
  pendingStatus: 'PENDING',
  approvedStatus: 'APPROVED',
  approverResolver: 'reporting_manager', // or 'role:ADMIN'
}
```

### 15.4 MVP approval types

DCR, RTP, Weekly Plan, Leave, Expense, Doctor — all use same engine.

---

## 16. Performance & Load Testing

### 16.1 SLAs (MVP)

| Metric | Target |
|--------|--------|
| API p95 latency (CRUD) | < 500 ms |
| API p95 latency (reports) | < 3 s or async export |
| Login `/token` | < 300 ms |
| Sync push (50 changes) | < 2 s |
| Uptime | 99.5% MVP |

### 16.2 Load test gates (before 500-user go-live)

- [ ] 500 simulated users — 50 concurrent
- [ ] 100 concurrent mobile sync pushes
- [ ] Report query under read replica (if enabled)
- [ ] DB connection pool not exhausted

Tool: k6 or Artillery — scripts in `tests/load/`

---

## 17. Release & Branch Strategy

### 17.1 Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready |
| `develop` | Integration branch |
| `feature/{ticket}-{desc}` | Feature work |
| `fix/{ticket}-{desc}` | Bug fixes |
| `release/v1.x` | Release candidate for UAT |

### 17.2 Versioning

- Semantic versioning: `v1.0.0` at MVP go-live
- Tag every prod deploy: `v1.2.3`
- CHANGELOG.md updated per release

### 17.3 Feature flags

- Use `company_settings` or dedicated `feature_flags` table
- UAT: enable new feature for `compCode=SYN` only before global rollout
- **MUST NOT** use feature flags as permanent config — remove after stable

### 17.4 Backup & disaster recovery

| Environment | Backup |
|-------------|--------|
| dev | Optional daily |
| uat | Daily + PITR |
| prod | Daily + PITR + cross-region copy |

**RTO:** 4 hours · **RPO:** 1 hour (prod)

Run restore drill once before go-live.

---

## 18. Localization & Timezone

| Setting | Value |
|---------|-------|
| Default timezone | `Asia/Kolkata` |
| Default locale | `en-IN` |
| Date display | `DD-MM-YYYY` (Salestrip parity) |
| API timestamps | ISO 8601 with offset |
| DB storage | UTC (`timestamptz`) |

**MVP UI:** English + Hindi labels for mobile field app (critical labels: DCR, Submit, Sync, Pending).

Use `company.timezone` for report date boundaries — never hardcode IST in queries.

---

## 19. Git & PR Workflow

1. Branch: `feature/dcr-submit`, `fix/tenant-leak-doctor-list`
2. One logical change per PR (small, reviewable)
3. Commit message: `feat(dcr): add submit endpoint with approval queue`
4. PR description: task link, test plan, migration notes
5. At least one human review before merge to `main`

---

## 20. AI Agent Checklist (Run Before Every Code Session)

When starting or finishing code, the AI agent MUST verify:

```
[ ] Read AGENTS.md and this file (18-DEVELOPMENT-STANDARDS.md)
[ ] Read relevant docs/modules/{feature}.md spec
[ ] Identified target module — not creating parallel structure
[ ] Searched for existing logic to reuse
[ ] Planned files to touch — no unrelated files
[ ] compCode / tenant scope on all data access
[ ] Transaction boundary identified for multi-step writes
[ ] Business logic uses repository PORT — not direct Prisma in service
[ ] External libs (S3, queue, cache) use adapter PORT if new integration
[ ] Structured log fields: requestId, compCode, module, action
[ ] Config via ConfigService — no hardcoded env-specific values in logic
[ ] OpenAPI updated if API changed (openapi/sfa-api-v1.yaml)
[ ] Prisma migration if schema changed
[ ] Lint + test commands run
[ ] PR scope is minimal
```

---

## 21. Quick Reference — Good vs Bad

### Modularity

```typescript
// ❌ BAD — everything in one file
// apps/api/src/dcr-everything.ts (800 lines)

// ✅ GOOD
// apps/api/src/modules/transactions/dcr/dcr.module.ts
// apps/api/src/modules/transactions/dcr/dcr.service.ts
// apps/api/src/modules/transactions/dcr/dcr.controller.ts
```

### Duplicate logic

```typescript
// ❌ BAD — same validation in controller and mobile sync handler

// ✅ GOOD — packages/shared-types/src/schemas/dcr.schema.ts
export const SubmitDcrSchema = z.object({ ... });
```

### Atomicity

```typescript
// ❌ BAD — partial failure leaves inconsistent state
await updateDcr(id);
await createApproval(id); // fails → DCR updated but no approval

// ✅ GOOD — single transaction
await prisma.$transaction(async (tx) => { ... });
```

### Random changes

```
❌ BAD PR: "Added DCR submit" + reformatted 40 files + upgraded React
✅ GOOD PR: "Added DCR submit" — 6 files, all DCR-related + tests
```

### Adapter pattern

```typescript
// ❌ BAD — business service tied to Prisma
async submitDcr(id: string) {
  return this.prisma.dailyCallReport.update({ ... });
}

// ✅ GOOD — port injected; Prisma hidden in adapter
async submitDcr(ctx: TenantContext, id: string) {
  return this.dcrRepo.submit(ctx.compCode, { id, ... });
}
```

### Microservice-ready coupling

```typescript
// ❌ BAD — DCR module queries approval table directly
await this.prisma.approvalQueue.create({ ... }); // inside DcrService without port

// ✅ GOOD — emit event or call ApprovalService.submitQueueItem()
this.eventBus.publish(new DcrSubmittedEvent({ ... }));
```

### Environment config

```typescript
// ❌ BAD
const bucket = 'synchem-prod-files';

// ✅ GOOD
const bucket = this.config.storage.bucket; // from validated env schema
```

---

## 22. Document Map

| Doc | Purpose |
|-----|---------|
| [AGENTS.md](../AGENTS.md) | AI agent entry point (short strict rules) |
| [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md) | This file — full standards |
| [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) | MVP screens checklist (~52 web + 8 mobile) |
| [20-OFFLINE-SYNC-PROTOCOL.md](./20-OFFLINE-SYNC-PROTOCOL.md) | Mobile sync specification |
| [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) | What to build |
| [openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml) | OpenAPI v1 draft |
| [prisma/schema.prisma](../prisma/schema.prisma) | Database schema v1 draft |
| [docs/modules/](./modules/) | Per-feature specs |

---

*Version 1.2 — June 2026. All code in this monorepo MUST comply.*
