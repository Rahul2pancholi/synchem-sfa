# Leave Approval

> **Menu Code:** `TRN10`  
> **Route:** `/app/leave/approval`  
> **Module:** Approval > Leave Approval

---

## In Short (Simple English)

Approve leave applications.

## Real Example (Synchem Pharma)

Amit wants 2 days leave — manager approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Leave type
- Dates
- Balance
- Reason

---

## Step-by-Step Workflow (Clone This)

1. Open pending leaves
2. Check team coverage
3. Approve/reject
4. Balance updated

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
/app/leave/approval
```

## API Endpoints (Backend to Build)

- `api/employee/leave-accrual-report`
- `api/employee/leave-balance-report/`
- `api/leave-policy/data`
- `api/leave-policy/list`
- `api/leave-policy/save`
- `api/leave/accural`
- `api/leave/code`
- `api/leave/employee-leave-balance/`
- `api/leave/leaveType`
- `api/leave/leaveTypeWithBalance`
- `api/leave/status`
- `api/leave/status/`
- `api/report/leave`

## Clone Checklist

- [ ] Build UI screen at route `/app/leave/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN10`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
