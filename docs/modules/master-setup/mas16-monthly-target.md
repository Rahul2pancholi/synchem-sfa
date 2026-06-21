# Monthly Target

> **Menu Code:** `MAS16`  
> **Route:** `/app/monthlyTarget`  
> **Module:** Master Setup > Monthly Target

---

## In Short (Simple English)

Set sales/call targets per MR per product per month.

## Real Example (Synchem Pharma)

June target for Amit: SYNPAR 500 units, 160 doctor calls, ₹2 lakh POB.

---

## What Data Is Here?

This screen stores or shows these types of information:

- TargetId
- EmpId
- ProductId
- Month
- Year
- CallTarget
- POBTarget
- AmountTarget

---

## Step-by-Step Workflow (Clone This)

1. Select month/employee
2. Enter product-wise targets
3. Save
4. Dashboard shows target vs achievement

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
/app/monthlyTarget
```

## API Endpoints (Backend to Build)

- `api/monthly-target/monthlyTarget-Detail`

## Clone Checklist

- [ ] Build UI screen at route `/app/monthlyTarget`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS16`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
