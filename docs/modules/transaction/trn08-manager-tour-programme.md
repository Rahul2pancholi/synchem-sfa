# Manager Tour Programme

> **Menu Code:** `TRN08`  
> **Route:** `/app/tourProgramme`  
> **Module:** Transaction > Manager Tour Programme

---

## In Short (Simple English)

Manager's own field visit plan (joint work with team).

## Real Example (Synchem Pharma)

Manager Priya plans joint field day with MR Amit on Route IND-R-05 every Tuesday.

---

## What Data Is Here?

This screen stores or shows these types of information:

- TourId
- ManagerId
- Date
- RouteId
- JointWithEmpId
- Purpose

---

## Step-by-Step Workflow (Clone This)

1. Manager creates tour plan
2. Submits
3. Executes joint work
4. Logged in manager DCR

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
/app/tourProgramme
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/tourProgramme`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN08`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
