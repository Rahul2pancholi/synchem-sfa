# Manager Day Allocation Approval

> **Menu Code:** `APP12`  
> **Route:** `/app/managerDayAllocation/approval`  
> **Module:** Approval > Manager Day Allocation Approval

---

## In Short (Simple English)

Approve manager field day plan.

## Real Example (Synchem Pharma)

Priya's June day split — senior approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Days per HQ

---

## Step-by-Step Workflow (Clone This)

1. Review
2. Approve

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
/app/managerDayAllocation/approval
```

## API Endpoints (Backend to Build)

- `api/managerDayAllocation/generate/`
- `api/managerDayAllocation/pending`
- `api/managerDayAllocation/status`

## Clone Checklist

- [ ] Build UI screen at route `/app/managerDayAllocation/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP12`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
