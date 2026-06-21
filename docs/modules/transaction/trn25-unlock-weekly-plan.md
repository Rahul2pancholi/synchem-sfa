# Unlock Weekly Plan

> **Menu Code:** `TRN25`  
> **Route:** `/app/unlockWeeklyPlan`  
> **Module:** Transaction > Unlock Weekly Plan

---

## In Short (Simple English)

Request to edit a locked weekly plan.

## Real Example (Synchem Pharma)

Doctor unavailable Wednesday — MR requests unlock to reshuffle weekly plan.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RequestId
- PlanId
- Reason
- Status

---

## Step-by-Step Workflow (Clone This)

1. Request unlock
2. Manager approves
3. Edit plan
4. Resubmit

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
/app/unlockWeeklyPlan
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/unlockWeeklyPlan`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN25`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
