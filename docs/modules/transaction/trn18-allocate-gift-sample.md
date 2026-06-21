# Allocate Gift/Sample

> **Menu Code:** `TRN18`  
> **Route:** `/app/allocateGiftSample`  
> **Module:** Transaction > Allocate Gift/Sample

---

## In Short (Simple English)

Admin assigns sample stock from central pool to MRs.

## Real Example (Synchem Pharma)

Admin allocates 500 SYNPAR samples: Amit 100, Ravi 150, Sunil 250.

---

## What Data Is Here?

This screen stores or shows these types of information:

- AllocationId
- FromPool
- ToEmpId
- ProductId
- Qty
- Date

---

## Step-by-Step Workflow (Clone This)

1. Admin selects pool
2. Picks employees
3. Sets quantities
4. Saves
5. MR sees stock in inventory

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
/app/allocateGiftSample
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/allocateGiftSample`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN18`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
