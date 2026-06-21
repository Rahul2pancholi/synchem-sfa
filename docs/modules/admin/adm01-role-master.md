# Role Master

> **Menu Code:** `ADM01`  
> **Route:** `/app/roles`  
> **Module:** Admin > Role Master

---

## In Short (Simple English)

Define roles like Admin, MR, Manager.

## Real Example (Synchem Pharma)

Create role "Senior MR" with specific access.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RoleId
- RoleName
- RoleType

---

## Step-by-Step Workflow (Clone This)

1. Create role
2. Set type AD/MAN/FS
3. Configure permissions in Role Setting

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
/app/roles
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/roles`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `ADM01`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
