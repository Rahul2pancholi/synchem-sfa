# Personal Order Booking

> **Menu Code:** `TRN04`  
> **Route:** `/app/pob/add`  
> **Module:** Transaction > Personal Order Booking

---

## In Short (Simple English)

Record orders from doctors/chemists during visits (POB).

## Real Example (Synchem Pharma)

Chemist Sharma orders 50 strips SYNPAR-500 and 30 SYNCOLD — total ₹8500 order booked.

---

## What Data Is Here?

This screen stores or shows these types of information:

- POBId
- PartyType
- PartyId
- Date
- ProductLines[]
- Qty
- Amount
- EmpId

---

## Step-by-Step Workflow (Clone This)

1. MR opens POB
2. Selects doctor/retailer
3. Adds products and qty
4. Saves
5. Links to DCR optionally
6. Counts toward target

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
/app/pob/add
```

## API Endpoints (Backend to Build)

- `api/dashboard/sampleVsPOB`
- `api/dcr/linked-pob/miscExpense/`
- `api/manager-dashboard/employeeWisePOBAmount`
- `api/pob/doctor-retailer/`
- `api/pob/number`
- `api/pob/partyData/`
- `api/report/employee/pob`

## Clone Checklist

- [ ] Build UI screen at route `/app/pob/add`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN04`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
