# Gift/Sample Requisition Approval

> **Menu Code:** `TRN06`  
> **Route:** `/app/requisition/approval`  
> **Module:** Approval > Gift/Sample Requisition Approval

---

## In Short (Simple English)

Approve sample requests.

## Real Example (Synchem Pharma)

Amit wants 100 samples — manager checks budget and approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Products
- Qty
- MR
- Budget

---

## Step-by-Step Workflow (Clone This)

1. Review requisition
2. Check pool balance
3. Approve
4. Dispatch to MR

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
/app/requisition/approval
```

## API Endpoints (Backend to Build)

- `api/gs-receive/requisition`
- `api/gs-receive/update-requisition`
- `api/requisition/number`
- `api/requisition/pending`
- `api/requisition/status`
- `api/requisition/status/`

## Clone Checklist

- [ ] Build UI screen at route `/app/requisition/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN06`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
