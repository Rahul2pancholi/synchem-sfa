# Brand Master

> **Menu Code:** `MAS19`  
> **Route:** `/app/brand`  
> **Module:** Master Setup > Brand Master

---

## In Short (Simple English)

Product brands under Synchem portfolio.

## Real Example (Synchem Pharma)

Brand "Synpar" has products SYNPAR-500, SYNPAR-650, etc.

---

## What Data Is Here?

This screen stores or shows these types of information:

- BrandId
- BrandName
- DivisionId
- Active

---

## Step-by-Step Workflow (Clone This)

1. Create brand
2. Link products
3. Used in brand-wise reporting

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
/app/brand
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/brand`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS19`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
