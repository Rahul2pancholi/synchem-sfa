# Gift/Sample Requisition

> **Menu Code:** `TRN05`  
> **Route:** `/app/requisition`  
> **Module:** Transaction > Gift/Sample Requisition

---

## In Short (Simple English)

MR requests promotional samples/gifts from company stock.

## Real Example (Synchem Pharma)

Amit requests 100 SYNPAR samples and 20 pens for June field work.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RequisitionId
- EmpId
- ProductId
- QtyRequested
- Status
- ApproverId

---

## Step-by-Step Workflow (Clone This)

1. MR creates requisition
2. Submits
3. Admin/Manager approves
4. Warehouse dispatches
5. MR receives via Gift/Sample Receive

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
/app/requisition
```

## API Endpoints (Backend to Build)

- `api/gs-receive/requisition`
- `api/gs-receive/update-requisition`
- `api/requisition/number`
- `api/requisition/pending`
- `api/requisition/status`
- `api/requisition/status/`

## Clone Checklist

- [ ] Build UI screen at route `/app/requisition`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN05`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
