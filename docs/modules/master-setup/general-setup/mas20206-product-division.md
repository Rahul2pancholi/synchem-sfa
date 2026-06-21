# Product Division

> **Menu Code:** `MAS20206`  
> **Route:** `/app/division`  
> **Module:** Master Setup > General Setup > Product Division

---

## In Short (Simple English)

Business line — Synchem uses "Ethical" division.

## Real Example (Synchem Pharma)

All prescription products sit under Ethical division; employees also mapped to division.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DivisionId
- DivisionName

---

## Step-by-Step Workflow (Clone This)

1. Create division
2. Link products and employees

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
/app/division
```

## API Endpoints (Backend to Build)

- `api/product/divisionWise/`
- `api/users/linked-division`

## Clone Checklist

- [ ] Build UI screen at route `/app/division`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20206`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
