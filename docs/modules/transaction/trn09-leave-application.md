# Leave Application

> **Menu Code:** `TRN09`  
> **Route:** `/app/leaveApplication`  
> **Module:** Transaction > Leave Application

---

## In Short (Simple English)

Employee applies for leave (CL/SL/PL).

## Real Example (Synchem Pharma)

Amit applies 2 days casual leave for wedding on 20-21 June.

---

## What Data Is Here?

This screen stores or shows these types of information:

- LeaveId
- EmpId
- LeaveType
- FromDate
- ToDate
- Reason
- Status
- BalanceBefore

---

## Step-by-Step Workflow (Clone This)

1. Employee applies
2. System checks leave balance
3. Submits
4. Manager approves in Leave Approval
5. Leave marked on calendar

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
/app/leaveApplication
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/leaveApplication`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN09`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
