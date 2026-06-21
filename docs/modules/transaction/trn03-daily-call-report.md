# Daily Call Report

> **Menu Code:** `TRN03`  
> **Route:** `/app/dcrRecord`  
> **Module:** Transaction > Daily Call Report

---

## In Short (Simple English)

Daily log of field work — visits, detailing, samples, expenses.

## Real Example (Synchem Pharma)

June 12: Amit visited Dr. Verma (detailed SYNPAR 10 min, gave 2 samples), Chemist Sharma (POB ₹5000), claimed ₹350 travel.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DCRId
- Date
- EmpId
- WorkType
- Transport
- DoctorVisits[]
- RetailerVisits[]
- Samples[]
- Expenses[]
- Status

---

## Step-by-Step Workflow (Clone This)

1. MR creates DCR for date
2. Adds each doctor/retailer visit
3. Logs products and samples
4. Adds expenses
5. Submits EOD
6. Manager approves
7. Feeds expense statement and reports

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
/app/dcrRecord
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/dcrRecord`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN03`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
