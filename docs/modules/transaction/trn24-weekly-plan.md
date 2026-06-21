# Weekly Plan

> **Menu Code:** `TRN24`  
> **Route:** `/app/weeklyPlan`  
> **Module:** Transaction > Weekly Plan

---

## In Short (Simple English)

Week-wise plan of which doctors to visit each day.

## Real Example (Synchem Pharma)

Week 2 June: Mon=Dr.Verma+Dr.Patel, Tue=Dr.Singh, Wed=Meeting, Thu=Dr.Verma follow-up.

---

## What Data Is Here?

This screen stores or shows these types of information:

- PlanId
- EmpId
- WeekStart
- DoctorPerDay[]
- Status

---

## Step-by-Step Workflow (Clone This)

1. MR plans week
2. Picks doctors per day
3. Submits
4. Manager approves
5. Compared with actual DCR in achievement report

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
/app/weeklyPlan
```

## API Endpoints (Backend to Build)

- `api/weeklyPlan-report/`
- `api/weeklyPlan-report/forManager`
- `api/weeklyPlan-report/territory`
- `api/weeklyPlan/`
- `api/weeklyPlan/doctor-list/`
- `api/weeklyPlan/pending`
- `api/weeklyPlan/unlock/`
- `api/weeklyPlan/update-status`

## Clone Checklist

- [ ] Build UI screen at route `/app/weeklyPlan`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN24`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
