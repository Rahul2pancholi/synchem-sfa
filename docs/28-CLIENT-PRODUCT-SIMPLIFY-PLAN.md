# Client Product — Modern UX & Screen Simplification Plan

> **Status (June 2026):** Client-ready **full product** — not MVP deferrals. Fewer screens, same business outcomes. Chat + dashboard first; menus are fallback.

**Related:** [27-PLATFORM-SUPERADMIN-CHAT-DASHBOARD-PLAN.md](./27-PLATFORM-SUPERADMIN-CHAT-DASHBOARD-PLAN.md) · [24-MR-JOURNEY-SALES-PRIORITIES.md](./24-MR-JOURNEY-SALES-PRIORITIES.md) · [23-PHASE6-GO-LIVE.md](./23-PHASE6-GO-LIVE.md)

---

## 1. Product principle

| Old (Salestrip clone) | New (client product) |
|----------------------|----------------------|
| 56+ routes, menu maze | ~20 user experiences |
| Har cheez = alag screen | 1 hub + tabs / filters |
| Reports-first | Dashboard-first + export |
| Training doc required | Chat + Help + plain labels |
| MVP = cut features | Client path = **polish what they use** |

**Rule:** New screen only when workflow is genuinely different — not for another data table.

---

## 2. Screen consolidation map

| Area | Before | After | Status |
|------|--------|-------|--------|
| Home | 3 dashboards + empty fallback | **1** `/app/home` (role auto) | **Done** |
| Approvals | 6 routes | **1** `/app/approvals` (tabs) | **Done** |
| Bulk import | 7 routes | **1** `/app/import` | **Done** |
| MR menu | 8+ items incl. leave/expense | **5** core field actions | **Done** |
| Reports | 12 routes | 1 hub (S2) | Pending |
| LOV masters | 8 routes | 1 settings tabs (S2) | Pending |
| Setup masters | 11 menu items | 4 groups (S3) | Pending |
| Access admin | 2 routes | 1 page 2 tabs (S3) | Pending |

Old URLs **redirect** to new hubs — bookmarks and chat deep links keep working.

---

## 3. Role navigation targets

### MR (Field Staff) — mobile primary, web backup

```
Home
My Work → Daily Visit | Doctor Orders | Plans | Add Doctor
Chat | Help
```

No: masters tree, reports menu, approvals, bulk import, leave/expense in daily menu (feature-flag if client needs).

### Manager

```
Home (team KPIs + insights + pending count)
Pending Approvals
Team → Doctors | Employees | Hierarchy
Reports (optional — prefer dashboard drill-down)
Chat | Help
```

No: MR transaction screens, bulk import, 6 separate approval menus.

### Tenant Admin

```
Home
Setup → masters + Import Data
Pending Approvals (override)
Access Control (roles)
Settings → lookups, leave policy, AI
```

---

## 4. Implementation sprints

### Sprint S1 — Navigation simplify (Week 1) ✅ Done

- [x] Plan doc (`28-CLIENT-PRODUCT-SIMPLIFY-PLAN.md`)
- [x] Smart home `/app/home` + login redirect
- [x] Pending Approvals hub + legacy URL redirects
- [x] Import center + legacy bulk redirects
- [x] MR slim permissions (no leave/expense in default menu)
- [x] Manager: no bulk import, no MR txn menus
- [x] `NAV_HIDDEN_MENU_CODES` — permission menus hidden from sidebar
- [x] i18n en / hi / hinglish

### Sprint S2 — Reports & lookups (Week 2)

- [ ] `/app/reports` hub with report registry
- [ ] Dashboard KPI tiles → pre-filtered report links
- [ ] `/app/settings/lookups` — designation, dosage, division, etc. in tabs
- [ ] Manager reports menu trimmed to 4–6 items

### Sprint S3 — Setup & admin merge (Week 3)

- [ ] `/app/setup` — Geography | People | Customers | Products tabs
- [ ] Access Control — Role Master + Role Setting tabs
- [ ] Admin settings — AI + Login analytics tabs
- [ ] `/app/monthly` — Leave + Expense tabs (if client uses)

### Sprint S4 — Chat write + launch polish

- [ ] Chat submit DCR / POB with confirm
- [ ] Client data import (clean DB)
- [ ] Mobile FCM push
- [ ] Phase 6 go-live gates (`pnpm go-live:check`)

---

## 5. Client launch phases

| Phase | Duration | Goal |
|-------|----------|------|
| **A** | 2 weeks | S1 + S2 simplify, UAT start |
| **B** | 2 weeks | UAT fixes, prod deploy, data import |
| **C** | 2 weeks | MR mobile rollout + training |
| **D** | Ongoing | Chat write, white-label, billing |

### Client sign-off questions

1. MR primarily **mobile**?
2. **Leave + expense** needed Day 1? (feature flags)
3. Which **reports** used monthly?
4. **Salestrip data migration** or fresh setup?
5. Default UI language **Hindi**?

---

## 6. Success metrics

| Metric | Target |
|--------|--------|
| MR first DCR without trainer | < 10 min |
| Manager spots weak MR | < 20 sec (dashboard) |
| Sidebar items (MR) | ≤ 6 |
| Sidebar items (Manager) | ≤ 15 |
| Questions via chat vs menu hunt | 50%+ by Month 3 |

---

## 7. Technical notes

- **Permission codes** (`APP01`, `TRN03`, …) stay in DB for RBAC — hidden from nav via `NAV_HIDDEN_MENU_CODES` in `@synchem-sfa/shared-types`.
- **Routes** for old paths remain as redirects — no broken chat actions.
- **Tenant features** still gate modules (`leave_hr`, `expense_claims`, …).
- New tenants: use **`field` preset** (not `full`) unless client needs HR modules.

---

*Version 1.0 — June 2026*
