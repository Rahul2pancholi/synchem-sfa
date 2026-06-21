# Hierarchy Master

> **Menu Code:** `MAS06`  
> **Route:** `/app/hierachy`  
> **Module:** Master Setup > Hierarchy Master

---

## In Short (Simple English)

Org chart levels: Admin → RM → ZM → MR.

## Real Example (Synchem Pharma)

MR Amit reports to ZM Priya who reports to RM Raj who reports to Admin.

---

## What Data Is Here?

This screen stores or shows these types of information:

- HierachyId
- HierachyCode
- HierachyType
- Level
- ParentHierarchy

---

## Step-by-Step Workflow (Clone This)

1. Define levels
2. Assign employees
3. Controls who sees whose data

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
/app/hierachy
```

## API Endpoints (Backend to Build)

- `api/hierachy/reporting/`

## Clone Checklist

- [ ] Build UI screen at route `/app/hierachy`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS06`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
