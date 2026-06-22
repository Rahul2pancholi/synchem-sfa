# Role Setting

> **Menu Code:** `ADM04`  
> **Route:** `/app/role-permission`  
> **Module:** Admin > Role Setting

---

## In Short (Simple English)

Set menu permissions per role.

## Real Example (Synchem Pharma)

MR can view DCR but not delete; Admin can do everything.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RoleId
- MenuId
- CanView/Add/Edit/Delete

---

## Step-by-Step Workflow (Clone This)

1. Select role
2. Check/uncheck menu permissions
3. Save

---

## Who Uses It?

| Role | Typical use |
|------|-------------|
| **Admin** | Full setup, approve, view all data |
| **Manager** | Approve team submissions, view team reports |
| **Field Staff (MR)** | Create daily records, view own data |

## Permissions (Admin)

| View | Add | Edit | Delete |
|------|-----|------|--------|
| True | True | True | True |

## UI Route

```
/app/role-permission
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] See [22-ROLE-ACCESS-CONFIG-PLAN.md](../../22-ROLE-ACCESS-CONFIG-PLAN.md) — Phase 1.5
- [ ] Build UI screen at route `/app/roleSetting`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `ADM04`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
