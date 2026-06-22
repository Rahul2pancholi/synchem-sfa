# Admin Role & Access Configuration (Planned)

> **Status:** Implemented (Phase 1.5 complete).  
> **Related:** [06-role-permissions.md](./06-role-permissions.md) · [08-clone-roadmap.md](./08-clone-roadmap.md) Phase 1.5 · [modules/admin/adm01-role-master.md](./modules/admin/adm01-role-master.md) · [modules/admin/adm04-role-setting.md](./modules/admin/adm04-role-setting.md)

---

## Goal

Tenant **Admin** ko ek UI se control dena:

- **Kaun sa role** kya kar sakta hai (Admin / Manager / MR / custom roles)
- **Kaun sa menu / screen** dikhe (sidebar, mobile dashboard tiles)
- **Kitna access** ho — View / Add / Edit / Delete / Preview / Print **per menu**
- **Direct URL** ya API call bina permission ke fail ho

Bina code deploy ke naye tenant ya naye role ke liye access configure ho sake.

---

## Problem today (gap)

| Layer | Status |
|-------|--------|
| DB: `roles`, `menus`, `role_menu_permissions` | ✅ Exists |
| API: `@RequirePermission(menuCode, action)` guard | ✅ Exists |
| Login: `menuList` JSON → sidebar | ✅ Exists (web) |
| Seed: MR role gets **all** menus full access | ⚠️ Dev shortcut — not production-safe |
| **Admin UI: Role Master (ADM01)** | ❌ Not built |
| **Admin UI: Role Setting matrix (ADM04)** | ❌ Not built |
| Web: hide Add/Edit/Delete buttons by permission | ❌ Partial / missing |
| Web: route guard on direct URL | ❌ Missing |
| Mobile: feature tiles from permissions | ❌ Hardcoded dashboard |
| API: CRUD roles + bulk save permissions | ❌ List roles only |

**Phase 0** ne RBAC **engine** diya; **Phase 1.5** admin ko **configuration UI** degi.

---

## What admin configures (scope)

### L1 — Role Master (`ADM01`) — MVP of this feature

| Field | Purpose |
|-------|---------|
| `roleName` | e.g. ADMIN, MR, RM, Senior MR |
| `roleType` | `AD` \| `MAN` \| `FS` — drives default dashboard route |
| `active` | Soft-disable role |

**Workflow:** Create role → assign employees in Employee Master → configure permissions in Role Setting.

**Routes (Salestrip parity):**

- Web: `/app/roleMaster` (MVP screen list) — alias `/app/roles` OK
- Menu code: `ADM01`

### L2 — Role Permission Matrix (`ADM04`) — core deliverable

Matrix: **rows = menu tree**, **columns = 6 permission flags**

| Permission | UI effect | API guard |
|------------|-----------|-----------|
| `canView` | Menu in sidebar; page reachable | `view` |
| `canAdd` | Create / New button | `add` |
| `canEdit` | Edit / Submit button | `edit` |
| `canDelete` | Delete / Deactivate button | `delete` |
| `canPreview` | Read-only detail view | `preview` (extend guard) |
| `canPrint` | Export PDF/Excel | `print` (extend guard) |

**Workflow:**

1. Select role (dropdown)
2. Tree table with checkboxes (parent folder = indeterminate / cascade optional)
3. **Save** → bulk upsert `role_menu_permissions` for `compCode`
4. Audit log: who changed which role permissions when

**Routes:**

- Web: `/app/roleSetting` — alias `/app/role-permission` OK
- Menu code: `ADM04`

### L3 — Runtime enforcement (same phase, separate PRs OK)

| Surface | Behaviour |
|---------|-----------|
| **Web sidebar** | Already filters via `menuList` at login — refresh menu after permission save (re-login or `/api/v1/menus/me` refetch) |
| **Web pages** | `usePermission('TRN03', 'add')` → hide/disable buttons |
| **Web routes** | `PermissionRoute` wrapper → 403 page if `canView` false |
| **API** | Existing `MenuPermissionGuard` — no bypass |
| **Mobile dashboard** | Show DCR / RTP / Sync tiles only if employee role has `canView` on `TRN03`, `TRN01`, etc. |

### L4 — Optional later (not Phase 1.5)

- Per-employee permission override (exception for one MR)
- Field-level / column-level security
- Time-based access (office hours)
- Platform super-admin default templates per industry

---

## Default permission templates (seed)

Replace `seedAdminPermissions(all menus → true)` for non-admin roles with **templates**:

| roleType | Typical access |
|----------|----------------|
| `AD` | All menus, all actions |
| `MAN` | Dashboard, team transactions, approvals, reports — no master delete |
| `FS` | Field dashboard, DCR/RTP/Weekly/POB (view+add+edit), own data — no admin/masters |

Seed file: `apps/api/prisma/seed-data/role-permission-templates.ts` (TBD at implementation).

New tenant onboarding (platform): copy templates → tenant admin fine-tunes in ADM04.

---

## Phase 1.5 breakdown (git-friendly sub-phases)

| Sub-phase | Deliverable | Est. |
|-----------|-------------|------|
| **1.5A** | Role Master CRUD API + web page (`ADM01`) | 2–3 days |
| **1.5B** | Permission matrix API (get tree + bulk save) + web page (`ADM04`) | 3–5 days |
| **1.5C** | Web `usePermission` hook + button guards on master/txn pages | 2–3 days |
| **1.5D** | Route guard + menu refresh after save; mobile dashboard gating | 2 days |
| **1.5E** | Seed templates + i18n + tests + OpenAPI | 1–2 days |

**Total:** ~2 weeks — fits **Month 2–3** (between Phase 1 and Phase 2 production rollout).

### Dependencies

| Needs | From |
|-------|------|
| Menu catalog | Phase 0 seed + each phase adds menus |
| `@RequirePermission` | Phase 0 |
| Employee → role link | Phase 1 MAS07 |

### Blocks

| Without 1.5 | Risk |
|-------------|------|
| MR sees all admin menus | Security / UX confusion |
| Cannot onboard 2nd tenant with different roles | SaaS blocker |
| Phase 4 approvers | Needs MAN vs AD distinction configured |

---

## API design (to implement)

```
GET    /api/v1/roles                    # list (exists)
POST   /api/v1/roles                    # create role
PATCH  /api/v1/roles/:id                # update role
DELETE /api/v1/roles/:id                # soft-deactivate

GET    /api/v1/roles/:id/permissions     # menu tree + flags for role
PUT    /api/v1/roles/:id/permissions     # bulk replace permissions (transaction)

GET    /api/v1/menus/me                  # current user menu tree (refresh without re-login)
GET    /api/v1/menus/permission-check    # ?menuCode=TRN03&action=add → boolean (optional)
```

All endpoints: `@RequireActor('tenant')`, mutating endpoints `@RequirePermission('ADM04', ...)`.

**Bulk save rules:**

- `prisma.$transaction()` — delete removed + upsert all rows for role
- Cannot remove own `ADM04` `canEdit` from ADMIN role (guardrail)
- At least one role must retain `ADM01` + `ADM04` access

---

## Web UI (library-first)

| Screen | Components |
|--------|------------|
| Role Master | antd `Table` + `Form` + `Modal` (same pattern as Employee Master) |
| Role Setting | antd `Table` with tree data + row of `Checkbox` per permission column |
| Shared hook | `usePermission(menuCode, action)` reading from `menuList` or React context |

**i18n keys (prefix `access.`):**

- `access.role.title`, `access.role.create`, `access.permission.title`, `access.permission.save`
- `access.permission.canView`, … `canPrint`
- `access.denied.title`, `access.denied.message`

Add to `packages/shared-i18n` — en / hi / hinglish.

---

## Mobile (Phase 1.5D)

- After login, store compact permission map from API (or derive from future mobile menu endpoint)
- `DashboardScreen`: conditionally render New DCR, RTP, Sync based on `TRN03`/`TRN01` `canView`
- No separate mobile admin UI in 1.5 — admin uses web only

---

## Database

**No new tables required** — uses existing:

```sql
roles (comp_code, role_name, role_type, active)
menus (menu_code, menu_name, menu_url, parent_menu_id, …)
role_menu_permissions (comp_code, role_id, menu_id, can_view, can_add, …)
```

Optional audit (recommended):

```sql
-- extend audit_logs or new role_permission_audit
```

---

## Seed / menu updates (with 1.5A)

Add to `apps/api/prisma/seed-data/menus.ts`:

```text
ADM  → Admin (folder)
ADM01 → Role Master      #/app/roleMaster
ADM04 → Role Setting     #/app/roleSetting
```

Only `ADMIN` role gets `ADM01`/`ADM04` by default in template.

---

## Tests (required before merge)

| Area | Tests |
|------|-------|
| API | Create role, bulk save permissions, tenant isolation, cannot strip last admin |
| API | MR role denied `MAS07` delete when template applied |
| Web | Permission hook hides Add button when `canAdd` false |
| E2E | Admin sets MR → DCR only → MR login sees TRN03 not MAS07 |

---

## Relationship to other phases

| Phase | Relationship |
|-------|--------------|
| **Phase 0** | RBAC engine — 1.5 completes the admin-facing half |
| **Phase 1** | Masters + Employee role assignment |
| **Phase 2** | Transaction menus (`TRN*`) appear in matrix as menus are added |
| **Phase 4** | Approver roles (MAN) need ADM04 configured before go-live |
| **Phase 11** | Workflow builder configures **rules**; ADM04 configures **who sees what** — complementary |

---

## Out of scope (Phase 1.5)

- Drag-and-drop org chart permissions
- OAuth / SSO role mapping
- Platform super-admin editing tenant menus globally (separate platform feature)
- Workflow / approval chain designer → [21-WORKFLOW-BUILDER-PLAN.md](./21-WORKFLOW-BUILDER-PLAN.md)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Admin locks themselves out | Guardrail: always keep ADMIN role full ADM* access |
| Menu catalog grows each phase | Matrix loads all menus; paginate/filter by module |
| Stale `menuList` in localStorage | Refetch `/api/v1/menus/me` after ADM04 save + prompt re-login |
| MR seed with full access | Fix templates in 1.5E before UAT |

---

## Clone checklist (implementation)

- [x] Add ADM01, ADM04 to seed menus
- [x] Role CRUD API + Role Master page
- [x] Permission get/save API + Role Setting matrix page
- [x] Default permission templates in seed (AD / MAN / FS)
- [x] `usePermission` hook + route guards + Employee page gates
- [x] Mobile dashboard feature gating
- [x] i18n (`phase1.5-access.ts`)
- [ ] OpenAPI full schemas (endpoints documented partially)
- [ ] Integration tests (E2E MR-only login)

---

*Document version: 1.0 — June 2026 — Planned for Phase 1.5 (pre–Phase 4 go-live).*
