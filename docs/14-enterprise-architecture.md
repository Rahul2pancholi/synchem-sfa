# Enterprise Architecture — Production-Ready Clone Blueprint

Target architecture for rebuilding **Synchem Salestrip SFA** as a scalable, **multi-tenant Pharma SFA SaaS** platform.

> **⭐ Master build plan:** [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) — locked stack, 6-month MVP, 500 users  
> **Related:** [01-platform-overview](./01-platform-overview.md) · [02-tech-stack-architecture](./02-tech-stack-architecture.md) · [08-clone-roadmap](./08-clone-roadmap.md) · [15-mobile-stack](./15-mobile-stack.md)

---

## Executive Summary

| Decision | Recommendation |
|----------|----------------|
| Architecture style | **Modular monolith** first, extract services later |
| Backend | **NestJS (Node.js + TypeScript)** — final choice |
| Database | **PostgreSQL 16** (primary + read replica at scale) |
| Web | **React 18 + TypeScript** |
| Mobile | **React Native + Expo + WatermelonDB** (offline-first) |
| Multi-tenancy | Shared DB, shared schema, **`compCode` on every row** |
| Async | **pg-boss** (MVP) → BullMQ/SQS at scale |

### Final Stack — TypeScript Everywhere

```
Web      → React 18 + TypeScript + Vite
Mobile   → React Native + Expo + WatermelonDB
Backend  → NestJS + TypeScript + Prisma
Database → PostgreSQL (Supabase / Neon managed)
```

One language across web, mobile, and API — easier hiring, lower cost, faster delivery for a greenfield clone built from docs (no original source code to port).

### Mobile Stack (Final) — React Native

| Component | Choice | Purpose |
|-----------|--------|---------|
| Framework | **React Native + Expo SDK 55+** | Cross-platform (Android + iOS), New Architecture |
| Offline DB | **WatermelonDB** | Local SQLite, reactive UI, DCR offline-first |
| Sync | Custom delta API (NestJS) → PowerSync optional at scale | `{ lastSyncAt, changes[] }` pull/push |
| Location | **expo-location** + background tasks | GPS check-in, live tracking, geo-fencing |
| Auth | **expo-local-authentication** | MPIN, fingerprint, secure token storage |
| Push | **Firebase FCM** | Approval alerts, pending work bell |
| Maps | **Mapbox** | Route display, MR tracking (cheaper at scale) |
| State | TanStack Query + Zustand | Server state + local UI state |
| Shared code | `packages/shared-types`, `packages/api-client` | Same DTOs as web and NestJS |

**Why React Native (not Flutter):** Matches NestJS + React web stack (TypeScript everywhere), WatermelonDB is production-proven for field offline sync, and Indian pharma case studies (e.g. Bengal Remedis) use React Native + Node + PostgreSQL.

**Why modular monolith?** The platform has ~146 screens, 327+ APIs, and tightly coupled flows (RTP → DCR → Approval → Expense). A well-structured monolith ships faster and stays easier to operate than premature microservices.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph clients [Client Layer]
        WEB[Web App<br/>React + TypeScript]
        MOB[Mobile App<br/>React Native + Expo]
    end

    subgraph edge [Edge Layer]
        CDN[CDN<br/>Static Assets]
        WAF[WAF / DDoS Protection]
        GW[API Gateway / Load Balancer]
    end

    subgraph app [Application Layer — Modular Monolith]
        AUTH[Identity & Auth]
        MASTER[Master Data]
        TXN[Transactions<br/>RTP / DCR / POB]
        WF[Workflow & Approvals]
        RPT[Report Query]
        NOTIFY[Notifications]
        FILE[Files & E-Detailing]
    end

    subgraph async [Async & Integration]
        QUEUE[Message Queue<br/>RabbitMQ / SQS]
        WORKER[Background Workers]
        SCHED[Scheduler]
    end

    subgraph data [Data Layer]
        PG[(PostgreSQL Primary)]
        PGRO[(PostgreSQL Read Replica)]
        REDIS[(Redis<br/>Cache / Sessions)]
        S3[(Object Storage<br/>S3 / Azure Blob)]
    end

    subgraph external [External Services]
        MAPS[Google Maps]
        FCM[Firebase Push]
        SMS[SMS Gateway]
        EMAIL[Email Service]
    end

    subgraph ops [Observability]
        LOG[Centralized Logging]
        MET[Metrics & APM]
        TRACE[Distributed Tracing]
    end

    WEB --> CDN
    WEB --> GW
    MOB --> GW
    GW --> AUTH
    GW --> MASTER
    GW --> TXN
    GW --> WF
    GW --> RPT
    GW --> NOTIFY
    GW --> FILE

    AUTH --> PG
    MASTER --> PG
    TXN --> PG
    WF --> PG
    RPT --> PGRO
    NOTIFY --> QUEUE
    FILE --> S3

    TXN --> QUEUE
    WF --> QUEUE
    QUEUE --> WORKER
    WORKER --> PG
    WORKER --> FCM
    WORKER --> SMS
    WORKER --> EMAIL

    AUTH --> REDIS
    TXN --> REDIS
    MOB --> REDIS
    MAPS --> MOB
```

---

## 2. Request Flow (Web / Mobile → API)

```mermaid
sequenceDiagram
    participant C as Client (Web/Mobile)
    participant GW as API Gateway
    participant AUTH as Auth Middleware
    participant TEN as Tenant Guard
    participant RBAC as Permission Guard
    participant API as Domain Module
    participant DB as PostgreSQL
    participant R as Redis

    C->>GW: HTTPS Request + Bearer JWT
    GW->>AUTH: Validate JWT signature & expiry
    AUTH->>R: Check token blacklist (logout)
    AUTH->>TEN: Extract compCode, empId, roleType
    TEN->>RBAC: Check menu permission (CanView/Add/Edit...)
    RBAC->>API: Route to handler
    API->>DB: Query with comp_code filter
    DB-->>API: Result
    API-->>C: { responseCode, errorObj, data }
```

### API Response Contract (keep parity with original)

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

---

## 3. Authentication Flow

```mermaid
flowchart TD
    A[User opens login] --> B{User type?}
    B -->|USER| C[Web login form]
    B -->|EMPLOYEE| D[Mobile login / MPIN]

    C --> E["POST /token<br/>username={user},{compCode}&password={pass}"]
    D --> E

    E --> F{Valid credentials?}
    F -->|No| G[Return 401]
    F -->|Yes| H[Issue JWT access_token + refresh_token]

    H --> I[Load menuList, employeeObj, configurationSetting]
    I --> J[Store in client + Redis session cache]
    J --> K{roleType?}

    K -->|FS| L[Field Staff Dashboard]
    K -->|MAN| M[Manager Dashboard]
    K -->|AD| N[Management Dashboard]

    L --> O[All API calls: Authorization Bearer token]
    M --> O
    N --> O

    O --> P{Token expired?}
    P -->|Yes| Q[Refresh token rotation]
    P -->|No| R[Continue]
    Q --> O
```

See [03-authentication-and-security.md](./03-authentication-and-security.md) for full login, OTP, and impersonation details.

---

## 4. Multi-Tenancy Architecture

Every tenant is identified by **`compCode`** (e.g. `SYN` for Synchem).

```mermaid
flowchart LR
    subgraph tenants [Tenants on Same Platform]
        T1[SYN — Synchem]
        T2[TENANT_B]
        T3[TENANT_C]
    end

    subgraph enforcement [Enforcement Layers]
        JWT[JWT carries compCode]
        MW[Tenant Middleware]
        ORM[ORM auto-filter]
        RLS[PostgreSQL RLS]
    end

    subgraph storage [Shared Infrastructure]
        DB[(PostgreSQL<br/>comp_code on every row)]
        S3B["S3: /{compCode}/documents/"]
    end

    T1 --> JWT
    T2 --> JWT
    T3 --> JWT
    JWT --> MW --> ORM --> DB
    ORM --> RLS
    T1 --> S3B
    T2 --> S3B
    T3 --> S3B
```

### Rules

1. JWT always carries `compCode`, `empId`, `roleType`
2. Middleware injects tenant context into every request
3. Repository layer **never** queries without `WHERE comp_code = :tenant`
4. PostgreSQL Row-Level Security (RLS) as safety net
5. File storage uses tenant prefix: `s3://bucket/{compCode}/...`

---

## 5. Backend Module Map (Bounded Contexts)

```mermaid
flowchart TB
    subgraph identity [Identity & Access]
        M1[Auth & Sessions]
        M2[Tenant & Config SET001–SET131]
        M3[RBAC Roles & Menus]
    end

    subgraph masters [Master Data]
        M4[Geography City/State/HQ/Route]
        M5[Customers Doctor/Retailer/Stockist]
        M6[Products Brand/Division/SKU]
        M7[People Employee/Hierarchy]
    end

    subgraph core [Core Operations]
        M8[Planning RTP / Weekly Plan]
        M9[Field Execution DCR / POB]
        M10[GPS Check-in / Geo-fencing]
    end

    subgraph workflow [Workflow & HR]
        M11[Approvals 15 queues]
        M12[Leave & Accrual]
        M13[Expense Statements]
        M14[Gift/Sample Flow]
        M15[Stock Statements & Targets]
    end

    subgraph support [Support Services]
        M16[Reports 60+ screens]
        M17[Internal Mail & Chat]
        M18[Notifications & Alerts]
        M19[Bulk Upload 7 types]
        M20[Files E-Detailing]
    end

    identity --> masters
    masters --> core
    core --> workflow
    workflow --> support
```

| Module | Key Entities | API Prefix Examples |
|--------|--------------|---------------------|
| Identity & Auth | User, Session, Company | `/token`, `/api/users/*` |
| Master Data | Doctor, Retailer, Product, HQ, Route | `/api/doctor/*`, `/api/product/*` |
| Transactions | RTP, DCR, POB, WeeklyPlan | `/api/dcr/*`, `/api/tourProgramme/*` |
| Workflow | ApprovalRequest | `/api/approval/*` |
| Reporting | Report views, exports | `/api/reports/*` |
| Communication | Mail, Message, Notification | `/api/mail/*`, `/api/notification/*` |

---

## 6. Approval Workflow Engine

Do **not** hardcode 15 separate approval flows. Use a generic, config-driven engine.

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Submitted: Employee submits
    Submitted --> PendingApproval: Route to approver chain
    PendingApproval --> Approved: Manager approves
    PendingApproval --> Rejected: Manager rejects
    PendingApproval --> Escalated: Timeout / hierarchy rule
    Escalated --> PendingApproval: Next approver
    Approved --> [*]
    Rejected --> Draft: Send back for correction
```

```mermaid
flowchart TD
    A[Transaction submitted<br/>DCR / RTP / Leave / Expense] --> B[Create ApprovalRequest]
    B --> C[Resolve approver chain from Hierarchy]
    C --> D[Publish event to Queue]
    D --> E[Worker: Send push + email + alert bell]
    E --> F{Approver action?}
    F -->|Approve| G[Update entity status]
    F -->|Reject| H[Notify submitter with reason]
    G --> I[Audit log entry]
    H --> I
```

Supported approval types (from spec): DCR, RTP, Weekly Plan, Doctor/Retailer create-delete, Leave, Expense, Gift/Sample, Stock unlock, Infiltration, and more — see [modules/approval/](./modules/approval/).

---

## 7. Data Architecture (OLTP vs Analytics)

```mermaid
flowchart LR
    subgraph oltp [OLTP — Write Path]
        API[API Modules]
        PG[(PostgreSQL Primary)]
        API --> PG
    end

    subgraph replication [Replication]
        PG -->|Streaming replication| REPLICA[(Read Replica)]
    end

    subgraph olap [Analytics — Read Path]
        REPLICA --> MV[Materialized Views]
        MV --> RPT[Report APIs]
        RPT --> EXPORT[Async Excel/PDF Export]
    end

    subgraph mobile [Mobile Offline]
        PG --> SYNC[Sync API]
        SYNC --> SQLITE[Device SQLite]
    end
```

### Database Design Principles

| Principle | Implementation |
|-----------|----------------|
| Normalization | OLTP tables for DCR, RTP, POB, approvals |
| Tenant isolation | `comp_code` column + index on every table |
| Performance indexes | `(comp_code, emp_id, date)`, `(comp_code, route_id)` |
| Heavy reports | Read replica — never crush primary DB |
| Dashboards | Materialized views (refresh 15–60 min or on event) |
| Large tables | Monthly partitioning (`dcr_visits_2026_06`) at scale |
| Bulk uploads | Validate in worker, not HTTP thread |
| Audit | `entry_by`, `update_by`, `delete_by` + immutable audit log |

See [04-data-model-entities.md](./04-data-model-entities.md) for entity relationships.

---

## 8. Mobile Offline Sync Flow

Field staff (FS) must submit DCR when network is unreliable.

```mermaid
sequenceDiagram
    participant MR as Field Staff (Mobile)
    participant LOCAL as SQLite (Device)
    participant SYNC as Sync API
    participant API as Transaction Module
    participant DB as PostgreSQL

    MR->>LOCAL: Create DCR offline
    MR->>LOCAL: Save GPS check-in points
    Note over MR,LOCAL: Works without network

    MR->>SYNC: POST /sync/push { lastSyncAt, changes[] }
    SYNC->>API: Validate + merge changes
    API->>DB: Upsert with comp_code + emp_id
    DB-->>API: Confirmed
    API-->>SYNC: Server changes since lastSyncAt
    SYNC-->>MR: Delta response
    MR->>LOCAL: Apply server delta
```

| Concern | Strategy |
|---------|----------|
| Local storage | **WatermelonDB** (SQLite on native thread) |
| Sync model | Delta sync — `{ lastSyncAt, changes[] }` via NestJS Sync API |
| Sync fallback | **PowerSync** (optional) if custom sync grows complex |
| Master data conflicts | Server wins |
| DCR draft conflicts | Last-write-wins or manual merge |
| GPS | Batch location pings; geofencing from employee settings |
| Push | Firebase Cloud Messaging (`PushToken` on employee) |
| Local auth | MPIN / biometric via Expo; refresh token in secure storage |

---

## 9. Async Processing Pipeline

```mermaid
flowchart LR
    subgraph triggers [Triggers]
        T1[Bulk CSV Upload]
        T2[Report Export Request]
        T3[OTP / Email / SMS]
        T4[Approval Notification]
        T5[Leave Accrual Cron]
        T6[GPS Batch Ingestion]
    end

    subgraph pipeline [Pipeline]
        API[API returns 202 Accepted + jobId]
        Q[Message Queue]
        W[Worker Process]
    end

    subgraph outputs [Outputs]
        DB[(PostgreSQL)]
        S3[(S3 Pre-signed URL)]
        PUSH[Firebase Push]
        MAIL[Email / SMS]
    end

    T1 --> API --> Q --> W
    T2 --> API --> Q --> W
    T3 --> API --> Q --> W
    T4 --> API --> Q --> W
    T5 --> SCHED[Scheduler] --> Q --> W
    T6 --> API --> Q --> W

    W --> DB
    W --> S3
    W --> PUSH
    W --> MAIL
```

Long-running tasks must **never** block HTTP request threads.

---

## 10. Field Force Daily Flow (Business Context)

```mermaid
flowchart TD
    A[Login — Field Staff FS] --> B[Dashboard KPIs + Pending Tasks]
    B --> C[View Today's RTP / Weekly Plan]
    C --> D[Visit Doctor / Retailer]
    D --> E[GPS Check-in optional]
    E --> F[Submit DCR]
    F --> G{POB Order?}
    G -->|Yes| H[Create POB]
    G -->|No| I[Next Visit]
    H --> I
    I --> J{More visits?}
    J -->|Yes| D
    J -->|No| K[End of Day — Final DCR Submit]
    K --> L[Manager Reviews & Approves DCR]
    L --> M[Monthly — Expense + Stock Statement]
```

---

## 11. RBAC & Authorization Flow

```mermaid
flowchart TD
    A[Login success] --> B[menuList loaded from DB]
    B --> C[Stored in client + Redis cache]
    C --> D[Sidebar renders permitted menus only]
    D --> E[User opens screen e.g. TRN03 DCR]
    E --> F{CanView?}
    F -->|No| G[403 Forbidden]
    F -->|Yes| H[Render screen]
    H --> I{User action?}
    I -->|Add| J{CanAdd?}
    I -->|Edit| K{CanEdit?}
    I -->|Delete| L{CanDelete?}
    I -->|Export| M{CanPrint?}
    J -->|No| G
    K -->|No| G
    L -->|No| G
    M -->|No| G
```

Permissions: `CanView`, `CanAdd`, `CanEdit`, `CanDelete`, `CanPreview`, `CanPrint` — see [06-role-permissions.md](./06-role-permissions.md).

---

## 12. Infrastructure & Deployment

```mermaid
flowchart TB
    subgraph devops [CI/CD]
        GH[GitHub]
        CI[GitHub Actions]
        GH --> CI
    end

    subgraph envs [Environments]
        DEV[Dev]
        STG[Staging — UAT vs live Salestrip]
        PROD[Production]
    end

    subgraph aws [Cloud — AWS Example]
        ALB[Application Load Balancer]
        ECS[ECS Fargate — API + Workers]
        RDS[(RDS PostgreSQL Multi-AZ)]
        REPLICA[(Read Replica)]
        ELASTICACHE[(ElastiCache Redis)]
        SQS[SQS Queue]
        S3B[S3 Bucket]
        CF[CloudFront CDN]
        SM[Secrets Manager]
    end

    CI --> DEV
    CI --> STG
    CI --> PROD

    PROD --> ALB --> ECS
    ECS --> RDS
    ECS --> REPLICA
    ECS --> ELASTICACHE
    ECS --> SQS
    ECS --> S3B
    CF --> ALB
    ECS --> SM
```

### Environment Matrix

| Component | Dev | Staging | Production |
|-----------|-----|---------|------------|
| API instances | 1 | 2 | 2+ (autoscale) |
| PostgreSQL | Single | Multi-AZ | Multi-AZ + read replica |
| Redis | Single | Cluster | Cluster mode |
| Backups | Daily | Daily + PITR | Daily + PITR + cross-region |
| Monitoring | Basic | Full | Full + alerting |

### High Availability Checklist

- [ ] Min 2 API instances behind load balancer
- [ ] PostgreSQL Multi-AZ with automated backups (PITR)
- [ ] Redis cluster mode
- [ ] Health endpoints: `/health`, `/ready`
- [ ] WAF + HTTPS only (ACM certificates)
- [ ] Secrets in vault — never in source code

---

## 13. Observability

```mermaid
flowchart LR
    APP[API + Workers] --> LOG[Structured JSON Logs]
    APP --> MET[Metrics]
    APP --> TRACE[OpenTelemetry Traces]

    LOG --> CW[CloudWatch / Datadog]
    MET --> CW
    TRACE --> CW

    CW --> ALERT[Alerts → Slack / PagerDuty]
    CW --> DASH[Dashboards]
```

| Pillar | What to track |
|--------|---------------|
| Logs | Request ID, compCode, empId, action, latency |
| Metrics | Error rate, p95 latency, queue depth, DB connections |
| Tracing | Cross-service request paths |
| Audit | Immutable log: who changed doctor/DCR/approval |
| Alerts | Error spike, DB CPU > 80%, queue backlog |

---

## 14. Monorepo Structure

```
synchem-sfa/
├── apps/
│   ├── web/                    # React web app
│   ├── mobile/                 # React Native app
│   ├── api/                    # NestJS modular monolith
│   └── worker/                 # Background job processor
├── packages/
│   ├── shared-types/           # DTOs, enums (RoleType, MenuCode)
│   ├── api-client/             # Generated from OpenAPI
│   └── ui-components/          # Shared design system
├── infra/
│   ├── terraform/              # Infrastructure as Code
│   └── docker/
├── docs/                       # This specification repo
└── openapi/
    └── sfa-api.yaml            # Contract-first API definition
```

---

## 15. Recommended Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Web frontend | React 18 + TypeScript + Vite | 146 screens; TanStack Query for server state |
| UI grids | AG Grid or MUI DataGrid | Replaces DevExtreme; export + virtualization |
| Mobile | **React Native + Expo + WatermelonDB** | Offline DCR, GPS, push |
| Backend | **NestJS** | Modular monolith with bounded contexts |
| Database | PostgreSQL 16 | Primary; read replica at scale |
| ORM | **Prisma** | Migrations + type safety |
| Cache | Redis | Sessions, menu cache, rate limiting |
| Queue | SQS or RabbitMQ | Async jobs |
| File storage | S3 / Azure Blob | E-detailing, bulk uploads, logos |
| Auth | OAuth2 + JWT + refresh rotation | Keep `/token` endpoint pattern |
| Maps | Google Maps Platform | Routes, geo-fencing, live tracking |
| Push | Firebase Cloud Messaging | Mobile notifications |
| Email/SMS | SES / SendGrid + SMS gateway | OTP, alerts |
| IaC | Terraform | Reproducible environments |
| CI/CD | GitHub Actions | Build → test → deploy |

---

## 16. Scalability Roadmap

```mermaid
flowchart LR
    subgraph phase1 [Phase 1 — MVP]
        P1A[1 tenant]
        P1B[~500 users]
        P1C[Modular monolith]
        P1D[Single region]
    end

    subgraph phase2 [Phase 2 — Growth]
        P2A[5–10 tenants]
        P2B[~5K users]
        P2C[Read replica]
        P2D[Queue workers]
        P2E[CDN + autoscale]
    end

    subgraph phase3 [Phase 3 — Enterprise]
        P3A[50+ tenants]
        P3B[50K+ users]
        P3C[Extract report service]
        P3D[Extract sync service]
        P3E[Multi-region DR]
    end

    phase1 --> phase2 --> phase3
```

### When to Extract Microservices

| Service | Extract when… |
|---------|---------------|
| Report service | Report queries slow OLTP or block writes |
| Notification service | Push/email volume exceeds worker capacity |
| Sync service | Mobile traffic dominates API load |
| Search service | Mail/chat search needs OpenSearch/Elasticsearch |

---

## 17. Security Checklist

| Area | Requirement |
|------|-------------|
| Transport | HTTPS only, TLS 1.2+ |
| Auth | Short-lived JWT + refresh token rotation |
| Tenant isolation | Middleware + ORM filter + PostgreSQL RLS |
| RBAC | Permission guard on every endpoint |
| Rate limiting | Per user/IP on `/token` and sensitive APIs |
| Password policy | 8–15 chars, number + special character |
| Impersonation | Audit every admin "login as user" action |
| Files | Pre-signed URLs, virus scan on upload |
| Secrets | AWS Secrets Manager / Azure Key Vault |
| Compliance | Immutable audit trail for data changes |

---

## 18. Implementation Priority

Aligned with [08-clone-roadmap.md](./08-clone-roadmap.md):

```mermaid
flowchart TD
    F0[Phase 0: Foundation<br/>Auth, RBAC, Tenant, OpenAPI] --> F1[Phase 1: Masters<br/>Doctor, Retailer, Product, HQ]
    F1 --> F2[Phase 2: Core Transactions<br/>RTP, DCR, POB, Weekly Plan]
    F2 --> F3[Phase 3: Approvals<br/>15 workflow queues]
    F3 --> F4[Phase 4: Secondary Txns<br/>Expense, Stock, Leave, Gift/Sample]
    F4 --> F5[Phase 5: Dashboards]
    F5 --> F6[Phase 6: Reports 60+]
    F6 --> F7[Phase 7: Mail, E-Detailing, Notifications]
    F7 --> F8[Phase 8: Mobile + Offline Sync]
    F8 --> F9[Phase 9: Admin & Settings]
```

**Enterprise foundations to build in Phase 0 (non-negotiable):**

1. Multi-tenant middleware (`compCode`)
2. JWT auth + refresh token rotation
3. RBAC permission guards
4. OpenAPI contract (shared by web + mobile)
5. Message queue + worker skeleton
6. Structured logging + health checks
7. Audit log table

---

## 19. Key Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Hidden business rules in legacy backend | UAT against live system; config-driven rules (SET001–SET131) |
| 60 reports crushing OLTP DB | Read replica + materialized views + async export |
| Mobile offline sync conflicts | Dedicated sync API — not generic REST CRUD |
| Multi-tenant data leak | Tenant middleware + RLS + integration tests per tenant |
| 15 approval flows duplicated | Generic workflow engine with config per entity type |
| Large team coordination | Monorepo + OpenAPI contract + modular backend folders |

---

## 20. Original vs Target Architecture

| Aspect | Original (Salestrip) | Target (Enterprise Clone) |
|--------|----------------------|---------------------------|
| Frontend | AngularJS 1.x + DevExtreme | React + TypeScript + modern grid |
| Backend | ASP.NET Web API on IIS | **NestJS** (Node.js + TypeScript) |
| Database | SQL Server | PostgreSQL (+ read replica at scale) |
| Deployment | Single IIS server | Fly.io Mumbai + Vercel (MVP) → AWS at scale |
| Files | Server filesystem | Cloudflare R2 / S3 |
| Async | Synchronous | pg-boss → queue + workers |
| Mobile | Android native | React Native + Expo + WatermelonDB |
| Observability | Limited | Full logs, metrics, tracing, audit |
| Multi-tenant | compCode (same pattern) | compCode + RLS + tenant middleware |

---

*Document version: 1.0 — June 2026*
