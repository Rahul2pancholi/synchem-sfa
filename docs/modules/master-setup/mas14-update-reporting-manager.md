# Update Reporting Manager

> **Menu Code:** `MAS14`  
> **Route:** `/app/updateReportingManager`  
> **Module:** Master Setup > Update Reporting Manager

---

## In Short (Simple English)

Change which manager an employee reports to.

## Real Example (Synchem Pharma)

MR Amit transferred from Manager Priya to Manager Raj — admin updates reporting manager here.

---

## What Data Is Here?

This screen stores or shows these types of information:

- EmpId
- OldReportingManager
- NewReportingManager
- EffectiveDate

---

## Step-by-Step Workflow (Clone This)

1. Select employee
2. Pick new manager
3. Save
4. Approval hierarchy and team views update

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
/app/updateReportingManager
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/updateReportingManager`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS14`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
