# Designation

> **Menu Code:** `MAS20201`  
> **Route:** `/app/designation`  
> **Module:** Master Setup > General Setup > Designation

---

## In Short (Simple English)

Job titles like MR, Senior MR, Area Manager.

## Real Example (Synchem Pharma)

Employee designation "Medical Representative" is assigned to all field staff.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DesignationId
- DesignationName
- Active

---

## Step-by-Step Workflow (Clone This)

1. Add designation
2. Assign to employees in Employee Master

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
/app/designation
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/designation`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20201`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
