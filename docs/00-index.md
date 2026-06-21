# Documentation Index — Synchem Salestrip Clone

## Quick Start

0. **⭐ BUILD PLAN:** [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) — locked stack, multi-tenant SaaS, 6-month / 500-user plan
0a. **⭐ CODING RULES:** [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md) + [AGENTS.md](../AGENTS.md) — strict modularity, tests, data safety (AI agents read first)
0b. **MVP screens:** [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) — formal 6-month go-live checklist
0c. **Mobile sync:** [20-OFFLINE-SYNC-PROTOCOL.md](./20-OFFLINE-SYNC-PROTOCOL.md)
0d. **OpenAPI v1:** [openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml)
0e. **Prisma schema v1:** [prisma/schema.prisma](../prisma/schema.prisma)
1. **Original system reference:** [12-MASTER-CLONE-BIBLE.md](./12-MASTER-CLONE-BIBLE.md) — live sample data + business rules
2. **Flowcharts:** [13-FINAL-MASTER-FLOWCHART.md](./13-FINAL-MASTER-FLOWCHART.md)
3. **Page tree:** [16-page-tree.md](./16-page-tree.md) — all screens with one-line descriptions
4. **Mobile stack:** [15-mobile-stack.md](./15-mobile-stack.md) — React Native (final)
5. **Live JSON data:** [../data/live-sample-data.json](../data/live-sample-data.json)
6. **Plain English:** [Simple Guide with Real Examples](./10-simple-guide-with-examples.md)
7. Read [End-to-End Workflows](./11-end-to-end-workflows.md) — all business processes in one place
8. Read [Platform Overview](./01-platform-overview.md) to understand the business domain
9. Read [Tech Stack](./02-tech-stack-architecture.md) for original + clone stack
10. Read [Enterprise Architecture](./14-enterprise-architecture.md) for production architecture
11. Read [Authentication](./03-authentication-and-security.md) before building login
12. Use [API Reference](./05-api-reference.md) while building backend
13. Pick a module from below and implement feature-by-feature

---

## Foundation Documents

| Document | Purpose |
|----------|---------|
| **[17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)** | **⭐ Master build plan — locked stack, SaaS, 500 users, Docker** |
| **[18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md)** | **⭐ Strict coding rules — modularity, DRY, tests, atomicity** |
| [19-MVP-SCREEN-LIST.md](./19-MVP-SCREEN-LIST.md) | **MVP screens — 6-month go-live checklist** |
| [20-OFFLINE-SYNC-PROTOCOL.md](./20-OFFLINE-SYNC-PROTOCOL.md) | **Mobile offline sync protocol** |
| [openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml) | OpenAPI v1 draft |
| [prisma/schema.prisma](../prisma/schema.prisma) | Prisma schema v1 draft |
| [AGENTS.md](../AGENTS.md) | AI agent instructions (read before coding) |
| [01-platform-overview.md](./01-platform-overview.md) | Business context, modules, workflows |
| [02-tech-stack-architecture.md](./02-tech-stack-architecture.md) | Original Salestrip stack (reference) |
| [14-enterprise-architecture.md](./14-enterprise-architecture.md) | **Production-ready target architecture + flowcharts** |
| [15-mobile-stack.md](./15-mobile-stack.md) | **React Native mobile stack (final decision)** |
| [16-page-tree.md](./16-page-tree.md) | **All pages — tree sitemap with one-line descriptions** |
| [08-clone-roadmap.md](./08-clone-roadmap.md) | **6-month MVP + full parity phases** |
| [03-authentication-and-security.md](./03-authentication-and-security.md) | Login, JWT, session, MPIN |
| [04-data-model-entities.md](./04-data-model-entities.md) | Entity relationships |
| [05-api-reference.md](./05-api-reference.md) | All API endpoints |
| [06-role-permissions.md](./06-role-permissions.md) | RBAC per menu |
| [07-configuration-settings.md](./07-configuration-settings.md) | SET001–SET131 config keys |
| [09-workflows-and-notifications.md](./09-workflows-and-notifications.md) | Approval flows and notifications |
| [10-simple-guide-with-examples.md](./10-simple-guide-with-examples.md) | Plain English guide with real examples |
| [11-end-to-end-workflows.md](./11-end-to-end-workflows.md) | All business process workflows |
| [12-MASTER-CLONE-BIBLE.md](./12-MASTER-CLONE-BIBLE.md) | Original system reference + live sample data |
| [13-FINAL-MASTER-FLOWCHART.md](./13-FINAL-MASTER-FLOWCHART.md) | Final flowcharts (Mermaid) |

---

## Every Feature Doc Contains

Each of the **146 feature files** in `modules/` includes:

| Section | What it tells you |
|---------|-------------------|
| **In Short** | One sentence — what this screen does |
| **Real Example** | Synchem pharma scenario in simple English |
| **What Data Is Here** | Exact fields/records stored |
| **Step-by-Step Workflow** | Numbered steps to clone the feature |
| **Clone Checklist** | Developer todo list |

---

## Module Documentation (146 Features)

### 1. Dashboard (3 screens)

| Code | Feature | Doc |
|------|---------|-----|
| DSH01 | Field Staff Dashboard | [dsh01-field-staff-dashboard.md](./modules/dashboard/dsh01-field-staff-dashboard.md) |
| DSH02 | Manager Dashboard | [dsh02-manager-dashboard.md](./modules/dashboard/dsh02-manager-dashboard.md) |
| DSH03 | Management Dashboard | [dsh03-management-dashboard.md](./modules/dashboard/dsh03-management-dashboard.md) |

### 2. Master Setup (35 screens)

See [modules/master-setup/README.md](./modules/master-setup/README.md)

Key masters: City, HQ, Route, Doctor, Retailer, Stockist, Product, Employee, Hierarchy, Brand, Targets

### 3. Transaction (20 screens)

See [modules/transaction/README.md](./modules/transaction/README.md)

Core: Tour Programme (RTP), DCR, POB, Weekly Plan, Stock Statement, Expense, Leave, Gift/Sample

### 4. Reports (60 screens)

See [modules/reports/README.md](./modules/reports/README.md)

Sub-groups: DCR, Employee, Doctor/Retailer, Expense, Gift/Sample, Achievement, Sales, Tracking

### 5. Admin (3 screens)

See [modules/admin/README.md](./modules/admin/README.md)

### 6. Setting (3 screens)

See [modules/setting/README.md](./modules/setting/README.md)

### 7. Approval (15 screens)

See [modules/approval/README.md](./modules/approval/README.md)

### 8. Bulk Upload (7 screens)

See [modules/bulk-upload/](./modules/bulk-upload/)

### 9. Additional Features (7 screens)

See [modules/additional-features/](./modules/additional-features/)

---

## Total File Count

| Category | Files |
|----------|-------|
| [AGENTS.md](../AGENTS.md) | AI agent instructions (read before coding) |
| Foundation docs | 20 |
| Feature docs (menu items) | 146 |
| Bulk upload docs | 7 |
| Additional feature docs | 7 |
| Module README indexes | ~15 |
| **Total** | **~184** |
