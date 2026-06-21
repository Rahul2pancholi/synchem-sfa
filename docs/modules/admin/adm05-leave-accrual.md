# Leave Accrual

> **Menu Code:** `ADM05`  
> **Route:** `/app/leaveAccrual`  
> **Module:** Admin > Leave Accrual

---

## In Short (Simple English)

Run monthly leave credit for all staff.

## Real Example (Synchem Pharma)

Credit 1.5 CL to every employee for June.

---

## What Data Is Here?

This screen stores or shows these types of information:

- EmpId
- LeaveType
- DaysCredited
- Period

---

## Step-by-Step Workflow (Clone This)

1. Select period
2. Run accrual
3. Balances updated

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
/app/leaveAccrual
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/leaveAccrual`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `ADM05`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
