# Delete DCR

> **Menu Code:** `TRN23`  
> **Route:** `/app/dcrRecord/delete/admin`  
> **Module:** Transaction > Delete DCR

---

## In Short (Simple English)

Admin removes wrong/duplicate DCR records.

## Real Example (Synchem Pharma)

Amit accidentally created 2 DCRs for same day. Admin deletes duplicate.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DCRId
- DeletedBy
- DeleteReason

---

## Step-by-Step Workflow (Clone This)

1. Admin searches DCR
2. Confirms delete
3. Record removed
4. Logged in audit

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
/app/dcrRecord/delete/admin
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/dcrRecord/delete/admin`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN23`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
