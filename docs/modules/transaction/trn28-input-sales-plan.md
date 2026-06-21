# Input & Sales Plan

> **Menu Code:** `TRN28`  
> **Route:** `/app/input-salesPlan`  
> **Module:** Transaction > Input & Sales Plan

---

## In Short (Simple English)

Forward plan for inputs (calls, camps) and expected sales.

## Real Example (Synchem Pharma)

July plan: 200 doctor calls, 3 camps, expected ₹5 lakh POB for Indore HQ.

---

## What Data Is Here?

This screen stores or shows these types of information:

- PlanId
- HQId
- Month
- InputMetrics[]
- SalesTarget
- Status

---

## Step-by-Step Workflow (Clone This)

1. Manager creates plan
2. Submits
3. HO approves
4. Tracked vs actual monthly

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
/app/input-salesPlan
```

## API Endpoints (Backend to Build)

- `api/input-salesPlan/pending`
- `api/input-salesPlan/product`
- `api/input-salesPlan/updateStatus`

## Clone Checklist

- [ ] Build UI screen at route `/app/input-salesPlan`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN28`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
