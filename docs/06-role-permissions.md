# Role & Permissions (RBAC)

## Permission Model

Salestrip uses **menu-level RBAC**. Each role is assigned permissions per menu item:

| Permission | Description |
|------------|-------------|
| `CanView` | See the menu and list data |
| `CanAdd` | Create new records |
| `CanEdit` | Modify existing records |
| `CanDelete` | Delete/deactivate records |
| `CanPreview` | View detail/read-only |
| `CanPrint` | Export PDF/Excel/print |

Permissions are returned in the `menuList` JSON at login and stored in `localStorage`.

## Role Types

| roleType | Description | Dashboard |
|----------|-------------|-----------|
| `AD` | Admin / Management / HO | Management Dashboard |
| `MAN` | Manager (RM, ZM, etc.) | Manager Dashboard |
| `FS` | Field Staff (MR) | Field Staff Dashboard |

## Admin Role (Observed)

The `admin` user with `roleType: AD` and `RoleName: ADMIN` has **full permissions** on all 146 menu items:

- CanView: `true` on all menus
- CanAdd: `true` on all menus
- CanEdit: `true` on all menus
- CanDelete: `true` on all menus

## Menu Structure

Each menu item has:

```json
{
  "MenuId": 303,
  "MenuName": "Daily Call Report",
  "MenuCode": "TRN03",
  "MenuType": "T",
  "MenuLevel": 1,
  "MenuBehaviour": "FILE",
  "MenuUrl": "#/app/dcrRecord",
  "CanView": true,
  "CanAdd": true,
  "CanEdit": true,
  "CanDelete": true,
  "CanPreview": true,
  "CanPrint": false,
  "ChildMenus": null
}
```

### Menu Types

| MenuType | Meaning |
|----------|---------|
| `T` | Transaction |
| `R` | Report |

### Menu Behaviour

| Value | Meaning |
|-------|---------|
| `FOLDER` | Parent menu (no direct page) |
| `FILE` | Leaf menu (actual screen) |

## Admin Screens for RBAC

| Screen | Route | Purpose |
|--------|-------|---------|
| Role Master | `/app/roles` | CRUD roles |
| Role Setting | `/app/role-permission` | Assign menu permissions to roles |

API: `role-menu-permissions/`

## Hierarchy-Based Data Access

Beyond menu permissions, data is filtered by:

1. **Employee hierarchy** — managers see their team's data
2. **HeadQuarter** — data scoped to assigned HQ
3. **Reporting manager chain** — `users/myTeam/`, `users/reportedUsers`

APIs:
- `users/hierarchy-chart/`
- `users/allLevelHierarchyEmp/`
- `users/reporting-manager/`
- `users/headQuater-role/`

## Clone Implementation

> **Implementation plan:** [22-ROLE-ACCESS-CONFIG-PLAN.md](./22-ROLE-ACCESS-CONFIG-PLAN.md) — Phase 1.5 admin UI for Role Master + Role Setting.

### Database Tables

```sql
roles (role_id, role_name, role_type, active)
menus (menu_id, menu_name, menu_code, menu_url, parent_menu_id, menu_type)
role_menu_permissions (role_id, menu_id, can_view, can_add, can_edit, can_delete, can_preview, can_print)
```

### Backend Middleware

```typescript
// Pseudo-code
function checkPermission(menuCode: string, action: 'view'|'add'|'edit'|'delete') {
  const perms = getUserMenuPermissions(req.user.roleId);
  const menu = perms.find(m => m.menuCode === menuCode);
  if (!menu || !menu[`can${action}`]) throw ForbiddenException();
}
```

### Frontend Guard

```typescript
// Hide menu items where CanView = false
// Disable buttons where CanAdd/CanEdit/CanDelete = false
```

## Menu Codes Reference

Top-level menu codes:

| Code | Module |
|------|--------|
| DSH | Dashboard |
| MAS | Master Setup |
| TRN | Transaction |
| REP | Reports |
| ADM | Admin |
| SET | Setting |
| APP | Approval |

Full per-feature codes are in each feature doc under `docs/modules/`.
