# MVP Screen List — 6-Month Go-Live (500 Users)

Formal checklist of screens and APIs for **Month 6 production MVP**.  
Full platform = 152 screens. **MVP = ~52 web screens + 8 mobile screens.**

> **Sign-off:** Client / PM to approve before Phase 2 coding starts.  
> **Reference:** [16-page-tree.md](./16-page-tree.md) · [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) Section 11

---

## Summary

| Category | MVP | Full parity | MVP % |
|----------|-----|-------------|-------|
| Auth & shell | 4 | 4 | 100% |
| Dashboards | 3 | 3 | 100% |
| Masters | 22 | 35 | 63% |
| Bulk upload | 7 | 7 | 100% |
| Transactions | 6 | 20 | 30% |
| Approvals | 6 | 15 | 40% |
| Reports | 12 | 60 | 20% |
| Admin & settings | 5 | 6 | 83% |
| Mobile-only | 8 | — | — |
| **Web total** | **~52** | **146 menu** | **~36%** |

**Out of MVP (Month 7+):** Mail, e-detailing, **analytics chat UI (Phase 10D)**, GPS map, infiltration, focused activity, input/sales plan, manager DCR, remaining 48 reports, 9 approval types.  
**Phase 10A + 10B in repo:** Admin chatbot **config** (`ADM05`) + semantic layer v0 — **Done**. Chat UI = **10D** (pending).

**Build status (June 2026):** MVP web screens below marked **Done ✅** where implemented in repo. **Next:** Phase 6 UAT (`docs/23-PHASE6-GO-LIVE.md`).

**Current build focus:** Phase 6 UAT + pilot — see [24-MR-JOURNEY-SALES-PRIORITIES.md](./24-MR-JOURNEY-SALES-PRIORITIES.md).  
**Low priority (P3):** Leave mobile, leave UI polish, advanced leave policy — minimal API already exists.

---

## Phase 0 — Foundation (Month 1)

| # | Screen | Code | Route | Priority |
|---|--------|------|-------|----------|
| 1 | Login | — | `#/app/login` | P0 |
| 2 | Forgot Password | — | `#/app/forgotPassword/{userType}` | P0 |
| 3 | App shell (sidebar + header) | — | `#/app/*` | P0 |
| 4 | Platform: Create tenant (super admin) | — | `/platform/tenants` | P0 |

**APIs:** `POST /token`, `POST /api/auth/refresh`, `GET /health`, `GET /ready`, `GET /api/menus`, `CRUD /api/platform/companies`

---

## Dashboards (Month 5–6)

| # | Screen | Code | Route | Role |
|---|--------|------|-------|------|
| 5 | Field Staff Dashboard | DSH01 | `/app/fieldStaff/dashboard` | FS | **Done ✅** |
| 6 | Manager Dashboard | DSH02 | `/app/manager/dashboard` | MAN | **Done ✅** |
| 7 | Management Dashboard | DSH03 | `/app/management/dashboard` | AD | **Done ✅** |

**APIs:** `dashboard/fieldstaff/`, `manager-dashboard/pending-count`, `dashboard/pending-submittion`, `dashboard/targetVsAchievement/`

---

## Masters — MVP subset (Month 2)

### Area & geography

| # | Screen | Code | Route |
|---|--------|------|-------|
| 8 | City Master | MAS20102 | `/app/city` |
| 9 | HeadQuarter Master | MAS20103 | `/app/headQuarter` |
| 10 | Route Master | MAS20104 | `/app/route` |

### Customers, products, people

| # | Screen | Code | Route |
|---|--------|------|-------|
| 11 | Hierarchy Master | MAS06 | `/app/hierachy` |
| 12 | Employee Master | MAS07 | `/app/employees` |
| 13 | Doctor Master | MAS09 | `/app/doctor` |
| 14 | Retailer Master | MAS03 | `/app/retailer` |
| 15 | Stockist Master | MAS04 | `/app/stockist` |
| 16 | Product Master | MAS05 | `/app/product` |
| 17 | Brand Master | MAS19 | `/app/brand` |

### Key LOVs (minimum)

| # | Screen | Code | Route |
|---|--------|------|-------|
| 18 | Designation | MAS20201 | `/app/designation` |
| 19 | Dosage Master | MAS20202 | `/app/dosage` |
| 20 | Product Division | MAS20206 | `/app/division` |
| 21 | Specialist Master | MAS20209 | `/app/specialist` |
| 22 | Qualification Master | MAS20208 | `/app/qualification` |
| 23 | Holiday Master | MAS20204 | `/app/holiday` |
| 24 | Expense Head | MAS20203 | `/app/expenseHead` |
| 25 | Expense Template | MAS08 | `/app/expenseTemplate` |

**Deferred post-MVP:** Pool master, route distance, color code, doctor visit preference, doctor MR linking, monthly target, bulk doctor/retailer update screens.

---

## Bulk upload (Month 2)

| # | Screen | Route |
|---|--------|-------|
| 26 | Bulk Doctor Upload | `/app/bulkDoctorUpload` |
| 27 | Bulk Retailer Upload | `/app/bulkRetailerUpload` |
| 28 | Bulk Product Upload | `/app/bulkProductUpload` |
| 29 | Bulk HQ Upload | `/app/bulkHQUpload` |
| 30 | Bulk Route Upload | `/app/bulkRouteUpload` |
| 31 | Bulk City Upload | `/app/bulkCityUpload` |
| 32 | Bulk Stockist Upload | `/app/bulkStockistUpload` |

---

## Core transactions (Month 3)

| # | Screen | Code | Route | Platform |
|---|--------|------|-------|----------|
| 33 | Tour Programme (RTP) | TRN01 | `/app/monthlyRTP` | Web |
| 34 | Weekly Plan | TRN24 | `/app/weeklyPlan` | Web |
| 35 | Daily Call Report | TRN03 | `/app/dcrRecord` | Web + **Mobile** | **Done ✅** |
| 36 | Personal Order Booking | TRN04 | `/app/pob/add` | Web | **Done ✅** |
| 37 | Leave Application | TRN09 | `/app/leaveApplication` | Web | **P3** — MVP only |
| 38 | Expense Statement | TRN20 | `/app/expenseStatement` | Web | **Done ✅** |
| — | Doctor Creation Request | MAS10 | `/app/doctor-creation-request` | Web | **Done ✅** |

**Deferred:** Gift/sample, stock statement, infiltration, manager RTP, pool distribution, unlock/revise flows (except unlock DCR approval if needed).

---

## Approvals — MVP minimum (Month 4–5)

| # | Screen | Code | Route |
|---|--------|------|-------|
| 39 | DCR Approval | APP01 | `/app/dcrRecord/approval/admin` | **Done ✅** |
| 40 | Tour Programme Approval | TRN02 | `/app/monthlyRTP/approval` | **Done ✅** |
| 41 | Weekly Plan Approval | APP04 | `/app/pendingWeeklyPlan` | **Done ✅** |
| 42 | Leave Approval | TRN10 | `/app/leave/approval` | **P3** — MVP only |
| 43 | Expense Approval | TRN21 | `/app/expenseStatement/approval` | **Done ✅** |
| 44 | Doctor Approval | MAS11 | `/app/doctor-approval` | **Done ✅** |

**Deferred:** Retailer approval (P1 if retailer creation in MVP), unlock DCR, gift/sample, infiltration, delete requests, focused activity, manager day allocation.

---

## Reports — 12 key reports (Month 5–6)

| # | Screen | Code | Route |
|---|--------|------|-------|
| 45 | DCR Summary | REP01 | `/app/report/dcr-summary` | **Done ✅** |
| 46 | Visit Summary | REP02 | `/app/report/visit-summary` | **Done ✅** |
| 47 | Missed Calls | REP22 | `/app/report/missedCallReport` | **Done ✅** |
| 48 | Monthly Covered Doctor | REP23 | `/app/report/monthlyCoveredDoctor` | **Done ✅** |
| 49 | Tour Programme Summary | REP10 | `/app/report/rtp-summary` | **Done ✅** |
| 50 | Employee Analysis | REP04 | `/app/report/employee-analysis` | **Done ✅** |
| 51 | Employee Attendance | REP13 | `/app/report/employee-attendance` | **Done ✅** |
| 52 | Monthly Target Achievement | REP20 | `/app/report/employeeTargetAchievement` | **Done ✅** |
| 53 | Employee POB | REP12 | `/app/report/employee-pob` | **Done ✅** |
| 54 | Sales Summary | REP41712 | `/app/report/salesSummary` | **Done ✅** |
| 55 | Monthly Expense Summary | REP05 | `/app/report/monthlyExpenseSummary` | **Done ✅** |
| 56 | Doctor Report | REP18 | `/app/report/doctors` | **Done ✅** |

**All reports:** filters + grid + Excel export minimum.

---

## Admin & settings (Month 1–2)

| # | Screen | Code | Route |
|---|--------|------|-------|
| 57 | Role Master | ADM01 | `/app/roleMaster` | **Done ✅** |
| 58 | Role Setting (permissions) | ADM04 | `/app/roleSetting` | **Done ✅** |
| 59 | AI Chatbot Settings | ADM05 | `/app/insightsChatConfig` | **Done ✅** (10A) |
| 60 | Login & Device Analytics | ADM06 | `/app/security/loginAnalytics` | **Done ✅** |
| — | Analytics chat UI (modal) | — | Manager/Admin dashboard | **10D** pending |
| 61 | Leave Policy | SET03 | `/app/leavePolicy` | **P3** — MVP only |

---

## Mobile app screens (Month 3–4)

| # | Screen | Priority | Offline? | Status |
|---|--------|----------|----------|--------|
| M1 | Login (EMPLOYEE + compCode) | P0 | No | **Done ✅** |
| M2 | MPIN / biometric unlock | P0 | No | **Done ✅** |
| M3 | Field Staff Dashboard | P0 | Cached | **Done ✅** |
| M4 | DCR create / edit / submit | P0 | **Yes** | **Done ✅** |
| M5 | RTP calendar view | P0 | Cached | **Done ✅** |
| M6 | Doctor list (beat) | P0 | Cached | Partial |
| M7 | GPS check-in / check-out | P0 | Queue offline | **Done ✅** |
| M8 | Push notification inbox | P1 | No | Pending |

**Deferred mobile:** POB offline, **leave (P3)**, expense, manager approvals, e-detailing.

---

## MVP API count estimate

| Area | Endpoints (approx) |
|------|-------------------|
| Auth + tenant | 12 |
| Masters | 80 |
| Transactions | 45 |
| Approvals | 25 |
| Reports | 15 |
| Sync (mobile) | 5 |
| Dashboard | 10 |
| **Total MVP** | **~190** |
| Full parity | 327 |

OpenAPI draft: [../openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml)

---

## Sign-off checklist

| Item | Owner | Date | Status |
|------|-------|------|--------|
| MVP screen list approved | Client / PM | | ☐ |
| MVP reports list approved | HO / Admin | | ☐ |
| Mobile scope approved | Field ops | | ☐ |
| Deferred items acknowledged | All | | ☐ |

---

*Version 1.0 — June 2026*
