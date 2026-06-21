# Product Category

> **Menu Code:** `MAS20205`  
> **Route:** `/app/product-category`  
> **Module:** Master Setup > General Setup > Product Category

---

## In Short (Simple English)

Product grouping like Antibiotics, Cardiology, Pain Management.

## Real Example (Synchem Pharma)

All pain relief products grouped under category "Analgesics".

---

## What Data Is Here?

This screen stores or shows these types of information:

- CategoryId
- CategoryName
- Active

---

## Step-by-Step Workflow (Clone This)

1. Create category
2. Assign products
3. Used in reports and targeting

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
/app/product-category
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/product-category`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20205`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
