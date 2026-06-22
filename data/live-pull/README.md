# Live Salestrip data pull

Read-only JSON dumps from `https://synchem.salestrip.in/api/` for **local seed / parity testing**.

## Why some URLs failed before

Live Salestrip APIs often need **empId (and month/year) in the path**, not only in docs:

| Wrong (404) | Correct (200) |
|-------------|----------------|
| `dashboard/targetVsAchievement/` | `dashboard/targetVsAchievement/2` |
| `dashboard/dailyCalls/` | `dashboard/dailyCalls/2/6/2026` |
| `dashboard/unreadMessageCount/` | `dashboard/unreadMessageCount/536` |
| `notification/viewmore/` | `notification/viewmore/2/1/20` |
| `role` | `roles` (plural) |
| `report/sales/managerSalesSummary` GET | **POST** `{"month":6,"year":2026}` |

**Not available on live** (skipped — do not mutate): `fieldstaff/`, `tourProgram-calendar/`, `top-five-product`, POST `doctorFollowUpDone`, POST `wish-birth-anniversary`.

**Server bugs** (saved with `apiError` in `_meta`): `targetVsAchievement/{empId}` sometimes returns SQL error.

## Setup

```bash
export SALESTRIP_TOKEN='Bearer <admin-jwt-from-browser>'

# Optional — MR field APIs (auto-login if omitted)
export SALESTRIP_MR_USER='MRAligarh1,SYN'
export SALESTRIP_MR_PASSWORD='MR@12345'
```

Or `.env.live-pull` (gitignored) — see `.env.live-pull.example`.

## Seed local DB from pulled JSON

```bash
pnpm setup:local          # Colima + Postgres (first time)
pnpm db:migrate
pnpm live-pull:masters    # if raw/ missing or stale
pnpm live-pull:normalize  # repair role-list, notifications, stale 404s
pnpm db:seed:live         # import masters + employees into PostgreSQL
```

Prerequisite: schema migrated. `db:seed:live` creates menus + SYN company; run `db:seed` first only if you also want demo `mr1`/`rm1` users alongside live employees.

## Commands

```bash
pnpm live-pull:dashboard   # fix failed dashboard + notifications + roles
pnpm live-pull:quick       # dashboard + users (no huge masters)
pnpm live-pull:masters     # doctors, retailers, products…
pnpm live-pull:full        # everything (except skipped)
pnpm live-pull:retry       # re-pull only manifest failures
```

## Output

```
data/live-pull/raw/
  _manifest.json           # all runs + per-file ok/fail
  _skipped-endpoints.json  # deprecated / mutation endpoints
  dashboard/
  masters/
  …
```

Each JSON has `_meta` with `httpStatus`, `responseCode`, `apiError`, `tokenProfile`.

## Security

- `raw/` is **gitignored** (PII)
- Rotate JWT if exposed; never commit tokens
