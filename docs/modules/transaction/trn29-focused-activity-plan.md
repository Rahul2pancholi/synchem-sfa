# Focused Activity Plan

> **Menu Code:** `TRN29`  
> **Route:** `/app/focusedActivityPlan`  
> **Module:** Transaction > Focused Activity Plan

---

## In Short (Simple English)

Special push plan for specific products in a period.

## Real Example (Synchem Pharma)

August focus on new launch "SYNHEART" — 50 cardiologists, 10 camps, 500 samples.

---

## What Data Is Here?

This screen stores or shows these types of information:

- FocusId
- ProductId
- Activities[]
- TargetDoctors
- Period
- Status

---

## Step-by-Step Workflow (Clone This)

1. Create focus plan
2. Set targets
3. Submit for approval
4. Track achievement in focused report

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
/app/focusedActivityPlan
```

## API Endpoints (Backend to Build)

- `api/focusedActivityPlan/GetChemFocusPrdAchVsPlan/`
- `api/focusedActivityPlan/GetFocusPrdAchVsPlan/`
- `api/focusedActivityPlan/list`
- `api/focusedActivityPlan/pending`
- `api/focusedActivityPlan/status`

## Clone Checklist

- [ ] Build UI screen at route `/app/focusedActivityPlan`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN29`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
