# Input & Sales Plan Approval

> **Menu Code:** `APP06`  
> **Route:** `/app/input-salesPlan/pending`  
> **Module:** Approval > Input & Sales Plan Approval

---

## In Short (Simple English)

Approve territory plans.

## Real Example (Synchem Pharma)

July Indore plan — HO approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Plan metrics

---

## Step-by-Step Workflow (Clone This)

1. Review
2. Approve/reject

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
/app/input-salesPlan/pending
```

## API Endpoints (Backend to Build)

- `api/input-salesPlan/pending`
- `api/input-salesPlan/product`
- `api/input-salesPlan/updateStatus`

## Clone Checklist

- [ ] Build UI screen at route `/app/input-salesPlan/pending`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP06`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
