# DCR Approval

> **Menu Code:** `APP01`  
> **Route:** `/app/dcrRecord/approval/admin`  
> **Module:** Approval > DCR Approval

---

## In Short (Simple English)

Admin approves submitted DCRs.

## Real Example (Synchem Pharma)

Bulk DCR approval for compliance.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DCR list
- MR
- Date
- Status

---

## Step-by-Step Workflow (Clone This)

1. Filter pending DCRs
2. Review
3. Approve/reject

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
/app/dcrRecord/approval/admin
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/dcrRecord/approval/admin`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP01`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
