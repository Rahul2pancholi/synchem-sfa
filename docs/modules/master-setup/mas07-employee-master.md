# Employee Master

> **Menu Code:** `MAS07`  
> **Route:** `/app/employees`  
> **Module:** Master Setup > Employee Master

---

## In Short (Simple English)

All system users — MRs, managers, admins.

## Real Example (Synchem Pharma)

Create employee "Amit Kumar", username amit, role MR, HQ Indore-1, reports to Manager Priya.

---

## What Data Is Here?

This screen stores or shows these types of information:

- EmpId
- UserName
- Password
- Name
- Email
- Mobile
- RoleId
- HQId
- HierarchyId
- ReportingManager
- Division
- JoiningDate
- Active
- ExpenseTemplate

---

## Step-by-Step Workflow (Clone This)

1. Create employee
2. Assign role, HQ, manager
3. Set expense template
4. Employee can login and work

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
/app/employees
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/employees`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS07`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
