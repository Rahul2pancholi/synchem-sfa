# Tech Stack & Architecture

> **Original Salestrip stack** (reference for parity). **What we are building:** see **[17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)** and **[14-enterprise-architecture.md](./14-enterprise-architecture.md)**.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Web App)                     │
│  AngularJS 1.x + UI-Router + DevExtreme + AdminLTE      │
│  Hash-based routing (#/app/...)                        │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS REST (JSON)
                         │ Authorization: Bearer <JWT>
┌────────────────────────▼────────────────────────────────┐
│              ASP.NET Web API (IIS 10)                    │
│  OAuth2 Token Endpoint: POST /token                      │
│  API Base: /api/*                                        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              SQL Server Database                         │
│  Multi-tenant by compCode (SYN)                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Android Mobile App                          │
│  Same API, push via Firebase                             │
└─────────────────────────────────────────────────────────┘
```

## Frontend Stack

| Component | Technology | Notes |
|-----------|------------|-------|
| Framework | **AngularJS 1.x** (`ng-app="myApp"`) | Strict DI enabled |
| Routing | **UI-Router** | 317+ states under `app.sfa.*` |
| UI Grid/Forms | **DevExtreme** (`dx.all.js`) | Data grids, date pickers |
| CSS Framework | **AdminLTE** (`skin-blue sidebar-mini`) | Sidebar navigation |
| Maps | **Google Maps API** | Key embedded in HTML |
| Storage | **localStorage** | Token, menus, employee data |
| HTTP | **$http** with interceptors | Auto-redirect on 401 |
| Notifications | **Toastr** + **SweetAlert** | Toast and modal alerts |
| Block UI | **blockUI** | Loading overlays |
| Locale | **moment.js** (`en-IN`, `Asia/Kolkata`) | |

### Frontend File Structure (Original)

```
/
├── index.html                    # Shell page
├── app/
│   ├── scripts/
│   │   ├── vendor.min.js         # jQuery, Angular, Bootstrap, etc.
│   │   └── main.min.js           # All app logic (1.2MB minified)
│   ├── assets/
│   │   ├── styles/vendor.min.css
│   │   └── images/fav_icon.png
│   ├── components/plugins/devexpress/
│   │   ├── dx.all.js
│   │   ├── dx-intl.js
│   │   └── globalize.min.js
│   └── theme/master_style.css
```

### Key Angular Modules/Services

| Service | Purpose |
|---------|---------|
| `authService` | Login, logout, token refresh, login-as-user |
| `apiService` | HTTP GET/POST/PUT/DELETE wrapper for `api/*` |
| `commonServiceData` | Shared LOV/dropdown data cache |
| `tokenValidity` | Token expiry checking |
| `localStorageService` | Persist auth + menu data |

## Backend Stack

| Component | Technology |
|-----------|------------|
| Server | **Microsoft IIS 10.0** |
| Framework | **ASP.NET** (Web API) |
| Auth | **OAuth2** password grant + JWT bearer tokens |
| CORS | Enabled (`Access-Control-Allow-Methods: GET,PUT,POST,DELETE,OPTIONS`) |

### API Response Format

```json
{
  "responseCode": 200,
  "errorObj": null,
  "data": { }
}
```

| responseCode | Meaning |
|--------------|---------|
| 200 | Success |
| 401 | Unauthorized — redirect to login |
| 417 | Business validation error |

## Authentication Flow

```
1. POST /token
   Body: grant_type=password&username={user},{compCode}&password={pass}
   Content-Type: application/x-www-form-urlencoded

2. Response includes:
   - access_token (JWT)
   - refresh_token
   - menuList (JSON string of permitted menus)
   - employeeObj (JSON string)
   - configurationSetting (JSON string)
   - roleType (AD/MAN/FS)

3. Subsequent requests:
   Authorization: Bearer {access_token}

4. Token stored in localStorage as authorizationData
```

## Recommended Clone Stack (Final Decision — Locked)

For a **multi-tenant Pharma SFA SaaS** — TypeScript everywhere, modular monolith first:

| Layer | Original | Clone (Final) |
|-------|----------|---------------|
| **Repo** | Separate repos | **Monorepo** — pnpm + Turborepo |
| Frontend | AngularJS 1.x | **React 18 + TypeScript + Vite** |
| UI Components | DevExtreme | **TanStack Table + MUI DataGrid** (free tiers) |
| Backend | ASP.NET Web API | **NestJS + TypeScript + Prisma** (modular monolith) |
| Database | SQL Server | **PostgreSQL 16** (Supabase / Neon managed) |
| Auth | OAuth2 + JWT | **Same pattern** — keep `/token` endpoint |
| Mobile | Android native | **React Native + Expo + WatermelonDB** |
| Maps | Google Maps | **Mapbox** (tracking) + Google (geocoding) |
| Push | Firebase | Firebase Cloud Messaging |
| File Storage | Server filesystem | **Cloudflare R2 / S3** — `/{compCode}/` prefix |
| Queue (MVP) | — | **pg-boss** (PostgreSQL-based) |
| Cache | — | **Redis** |
| Docker | IIS | **Docker Compose** (local + CI + prod) — NOT K8s MVP |
| Hosting (MVP) | IIS single server | **Fly.io Mumbai + Vercel** |
| AI (later) | — | NestJS `ai` module → OpenAI/Gemini APIs |

> **Architecture:** Modular monolith day 1 — extract microservices inside same monorepo only if needed at scale. See [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md).

## Multi-Tenancy (SaaS)

Every API call is scoped by `compCode` (company code). Synchem uses `SYN`. The platform supports **multiple pharma companies** on one deployment:

- Platform Super Admin — onboard tenants, billing, global config
- Tenant Admin — per-company SET001–131 settings, masters, users
- Row-level isolation — `compCode` on every table + middleware

**Scale plan:** 20–40 users Day 1 → **500 users in 6 months** (MVP) → full 152-screen parity in 9–10 months.

## Deployment (Original)

- Hosted at `synchem.salestrip.in`
- HTTPS enabled
- Static assets cache-busted with `?t=timestamp`
