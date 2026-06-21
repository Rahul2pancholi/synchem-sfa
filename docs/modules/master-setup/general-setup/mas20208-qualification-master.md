# Qualification Master

> **Menu Code:** `MAS20208`  
> **Route:** `/app/qualification`  
> **Module:** Master Setup > General Setup > Qualification Master

---

## In Short (Simple English)

Doctor degrees: MBBS, MD, BAMS, etc.

## Real Example (Synchem Pharma)

Dr. Sharma tagged as qualification "MD" in doctor master.

---

## What Data Is Here?

This screen stores or shows these types of information:

- QualificationId
- QualificationName

---

## Step-by-Step Workflow (Clone This)

1. Add qualification
2. Select when creating doctor

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
/app/qualification
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/qualification`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20208`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
