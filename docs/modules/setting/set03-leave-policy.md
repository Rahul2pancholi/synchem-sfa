# Leave Policy

> **Menu Code:** `SET03`  
> **Route:** `/app/leavePolicy`  
> **Module:** Setting > Leave Policy

---

## In Short (Simple English)

Define leave types and rules.

## Real Example (Synchem Pharma)

CL=12/year, SL=6/year, carry forward 3 CL.

---

## What Data Is Here?

This screen stores or shows these types of information:

- LeaveType
- AnnualQuota
- CarryForward
- Rules

---

## Step-by-Step Workflow (Clone This)

1. Define policy
2. Save
3. Applied in leave applications

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
/app/leavePolicy
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/leavePolicy`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `SET03`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
