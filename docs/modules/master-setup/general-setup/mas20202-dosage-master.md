# Dosage Master

> **Menu Code:** `MAS20202`  
> **Route:** `/app/dosage`  
> **Module:** Master Setup > General Setup > Dosage Master

---

## In Short (Simple English)

Medicine forms: tablet, capsule, syrup, injection.

## Real Example (Synchem Pharma)

Product "Synpar Tablet" links to dosage form "Tablet".

---

## What Data Is Here?

This screen stores or shows these types of information:

- DosageId
- DosageName

---

## Step-by-Step Workflow (Clone This)

1. Create dosage type
2. Link in Product Master

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
/app/dosage
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/dosage`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20202`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
