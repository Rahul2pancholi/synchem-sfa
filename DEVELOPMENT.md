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
| Trilingual UI (English, Hindi, Hinglish) | Done — `packages/shared-i18n` |

**Next:** Phase 1 — Master data (Employee, Hierarchy, City, HQ, Route, Doctor, …)
