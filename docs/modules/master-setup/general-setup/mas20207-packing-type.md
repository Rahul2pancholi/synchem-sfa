# Packing Type

> **Menu Code:** `MAS20207`  
> **Route:** `/app/packingType`  
> **Module:** Master Setup > General Setup > Packing Type

---

## In Short (Simple English)

Pack size description: 10x10, 30ml bottle, etc.

## Real Example (Synchem Pharma)

Product packed as "10 tablets per strip" uses packing type "10's".

---

## What Data Is Here?

This screen stores or shows these types of information:

- PackingTypeId
- PackingTypeName

---

## Step-by-Step Workflow (Clone This)

1. Define packing
2. Attach to product SKU

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
/app/packingType
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/packingType`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20207`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
