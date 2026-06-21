# Manager Day Allocation

> **Menu Code:** `TRN30`  
> **Route:** `/app/managerDayAllocation`  
> **Module:** Transaction > Manager Day Allocation

---

## In Short (Simple English)

Plan how many days manager spends in each territory.

## Real Example (Synchem Pharma)

Priya allocates: 8 days Indore, 6 days Dewas, 4 days Ujjain for June.

---

## What Data Is Here?

This screen stores or shows these types of information:

- AllocationId
- ManagerId
- Month
- HQDaySplit[]
- Status

---

## Step-by-Step Workflow (Clone This)

1. Manager plans days
2. Submits
3. Senior manager approves
4. Guides field coaching schedule

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
/app/managerDayAllocation
```

## API Endpoints (Backend to Build)

- `api/managerDayAllocation/generate/`
- `api/managerDayAllocation/pending`
- `api/managerDayAllocation/status`

## Clone Checklist

- [ ] Build UI screen at route `/app/managerDayAllocation`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN30`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
