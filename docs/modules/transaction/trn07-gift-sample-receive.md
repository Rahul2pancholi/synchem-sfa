# Gift/Sample Receive

> **Menu Code:** `TRN07`  
> **Route:** `/app/receivingGS`  
> **Module:** Transaction > Gift/Sample Receive

---

## In Short (Simple English)

MR confirms receipt of approved samples/gifts.

## Real Example (Synchem Pharma)

Amit receives 100 SYNPAR samples from warehouse, confirms in system.

---

## What Data Is Here?

This screen stores or shows these types of information:

- ReceiveId
- RequisitionId
- EmpId
- ProductsReceived[]
- ReceiveDate

---

## Step-by-Step Workflow (Clone This)

1. Approved requisition ready
2. MR records receipt
3. Stock added to MR inventory
4. MR distributes during DCR visits

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
/app/receivingGS
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/receivingGS`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN07`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
