# Synchem SFA — Pharma SFA SaaS Platform

**Repository:** [github.com/Rahul2pancholi/synchem-sfa](https://github.com/Rahul2pancholi/synchem-sfa)

Specification and **final build plan** for a **multi-tenant Pharma Sales Force Automation (SFA)** platform — blueprinted from [Synchem Salestrip](https://synchem.salestrip.in/).

## What This Project Is

This repository is the **specification + build plan** for a SaaS SFA platform:

- **Product:** Pharma Sales Force Automation (web + mobile)
- **Model:** Multi-tenant SaaS — onboard multiple pharma companies
- **First tenant:** Synchem Pharmaceuticals (`compCode: SYN`)
- **Scale:** 20–40 users Day 1 → **500 users in 6 months**
- **Reference:** Salestrip feature parity (152 screens, 327 APIs) over 9–10 months

**Build status:** Phase 0 started — API + web scaffold on `develop` branch. See [DEVELOPMENT.md](./DEVELOPMENT.md).

## ⭐ Final Build Plan

| Document | Purpose |
|----------|---------|
| **[17-FINAL-BUILD-PLAN.md](./docs/17-FINAL-BUILD-PLAN.md)** | **Master doc — locked stack, phases, multi-tenant, Docker, 500-user plan** |
| **[18-DEVELOPMENT-STANDARDS.md](./docs/18-DEVELOPMENT-STANDARDS.md)** | **Strict coding rules — modularity, tests, data safety** |
| [19-MVP-SCREEN-LIST.md](./docs/19-MVP-SCREEN-LIST.md) | MVP screens checklist |
| [20-OFFLINE-SYNC-PROTOCOL.md](./docs/20-OFFLINE-SYNC-PROTOCOL.md) | Mobile sync protocol |
| [openapi/sfa-api-v1.yaml](./openapi/sfa-api-v1.yaml) | OpenAPI v1 draft |
| [prisma/schema.prisma](./prisma/schema.prisma) | Database schema v1 |
| [AGENTS.md](./AGENTS.md) | AI coding instructions |
| [14-enterprise-architecture.md](./docs/14-enterprise-architecture.md) | Architecture diagrams |
| [15-mobile-stack.md](./docs/15-mobile-stack.md) | React Native mobile (confirmed) |
| [16-page-tree.md](./docs/16-page-tree.md) | All 152 pages — tree sitemap |
| [08-clone-roadmap.md](./docs/08-clone-roadmap.md) | 6-month MVP + full parity phases |

### Locked Tech Stack

| Layer | Choice |
|-------|--------|
| Repo | Monorepo (pnpm + Turborepo) |
| Backend | NestJS + Prisma + PostgreSQL |
| Web | React + Vite (not Next.js) |
| Mobile | React Native + Expo + WatermelonDB |
| Infra | Docker (local + CI + prod) |
| Multi-tenant | `compCode` on every row |
| AI (later) | NestJS module + OpenAI/Gemini APIs |

## Source Application (Reference)

| Property | Value |
|----------|-------|
| URL | https://synchem.salestrip.in/ |
| Product | Salestrip SFA |
| Company | Synchem Pharmaceuticals Pvt. Ltd. |
| Company Code | `SYN` |
| Industry Type | Pharmaceutical (SYN) |
| Address | 38, S.R. Compound, Dewas Naka, Indore |

## Documentation Index

## ⭐ START HERE — Build vs Reference

| Document | Purpose |
|----------|---------|
| **[17-FINAL-BUILD-PLAN.md](./docs/17-FINAL-BUILD-PLAN.md)** | **Build the SaaS platform — locked stack, phases, 500 users** |
| **[12-MASTER-CLONE-BIBLE.md](./docs/12-MASTER-CLONE-BIBLE.md)** | Original Salestrip reference + live sample data |
| **[diagrams/synchem-all-flows.drawio](./diagrams/synchem-all-flows.drawio)** | 25 flowcharts + class diagram in ONE draw.io file |
| **[13-FINAL-MASTER-FLOWCHART.md](./docs/13-FINAL-MASTER-FLOWCHART.md)** | Mermaid flowcharts (markdown preview) |
| **[data/live-sample-data.json](./data/live-sample-data.json)** | Real data copied from production (passwords redacted) |

Also see: [10-simple-guide](./docs/10-simple-guide-with-examples.md) | [00-index](./docs/00-index.md)

Every feature doc now includes:
- **In Short** — one-line simple English explanation
- **Real Example** — Synchem pharma scenario
- **What Data Is Here** — fields/records stored
- **Step-by-Step Workflow** — exact clone steps

### Core Docs

| # | Document | Description |
|---|----------|-------------|
| 00 | [Index](./docs/00-index.md) | Master navigation to all docs |
| 01 | [Platform Overview](./docs/01-platform-overview.md) | What the app does, user roles, modules |
| 02 | [Tech Stack & Architecture](./docs/02-tech-stack-architecture.md) | Original stack + **locked clone stack** |
| 14 | [Enterprise Architecture](./docs/14-enterprise-architecture.md) | **Production-ready target architecture + flowcharts** |
| 16 | [Page Tree](./docs/16-page-tree.md) | **All screens — tree sitemap with one-line descriptions** |
| 15 | [Mobile Stack](./docs/15-mobile-stack.md) | **React Native mobile stack (final)** |
| 03 | [Authentication & Security](./docs/03-authentication-and-security.md) | Login, JWT, roles, permissions |
| 04 | [Data Model & Entities](./docs/04-data-model-entities.md) | Core database entities |
| 05 | [API Reference](./docs/05-api-reference.md) | Full REST API catalog |
| 06 | [Role & Permissions](./docs/06-role-permissions.md) | RBAC model |
| 07 | [Configuration Settings](./docs/07-configuration-settings.md) | System config keys |
| 08 | [Clone Roadmap](./docs/08-clone-roadmap.md) | 6-month MVP + full parity phases |
| 17 | **[Final Build Plan](./docs/17-FINAL-BUILD-PLAN.md)** | **Locked decisions — start here to build** |
| 18 | **[Development Standards](./docs/18-DEVELOPMENT-STANDARDS.md)** | **Strict rules — modularity, DRY, tests, atomicity** |
| 19 | [MVP Screen List](./docs/19-MVP-SCREEN-LIST.md) | 6-month go-live screens (~52 web + 8 mobile) |
| 20 | [Offline Sync Protocol](./docs/20-OFFLINE-SYNC-PROTOCOL.md) | Mobile sync specification |
| — | [openapi/sfa-api-v1.yaml](./openapi/sfa-api-v1.yaml) | OpenAPI v1 draft |
| — | [prisma/schema.prisma](./prisma/schema.prisma) | Prisma schema v1 draft |
| — | [AGENTS.md](./AGENTS.md) | AI coding instructions |

### Module Docs (146 features)

All feature docs live under **[docs/modules/](./docs/modules/)**:

- [Dashboard](./docs/modules/dashboard/)
- [Master Setup](./docs/modules/master-setup/)
- [Transaction](./docs/modules/transaction/)
- [Reports](./docs/modules/reports/)
- [Admin](./docs/modules/admin/)
- [Setting](./docs/modules/setting/)
- [Approval](./docs/modules/approval/)
- [Bulk Upload](./docs/modules/bulk-upload/)
- [Additional Features](./docs/modules/additional-features/)

## User Roles

| Code | Role | Default Landing |
|------|------|-----------------|
| `AD` | Admin / Management | `/app/management/dashboard` |
| `MAN` | Manager | `/app/manager/dashboard` |
| `FS` | Field Staff (MR) | `/app/fieldStaff/dashboard` |

## Build Strategy (Summary)

1. **Month 1–2** — Foundation + masters (multi-tenant from day 0)
2. **Month 3–4** — DCR, RTP, POB + **mobile offline** (parallel)
3. **Month 5** — Approvals, expense, leave, key reports
4. **Month 6** — **500 users go-live** (MVP)
5. **Month 7–10** — Full parity (remaining reports, mail, AI)

See **[docs/17-FINAL-BUILD-PLAN.md](./docs/17-FINAL-BUILD-PLAN.md)** for complete plan.

## Important Notes

- Documentation was generated via **read-only** analysis (no data modifications).
- Credentials used for analysis should be rotated after clone work begins.
- This is a specification project — application source code is not included yet.

---
*Project created: June 2026*
