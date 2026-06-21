# Doctor MR Linking

> **Menu Code:** `MAS18`  
> **Route:** `/app/doctorMRLinking`  
> **Module:** Master Setup > Doctor MR Linking

---

## In Short (Simple English)

Assign specific doctors to specific MRs.

## Real Example (Synchem Pharma)

Dr. Verma linked only to MR Amit even though route has multiple MRs.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DoctorId
- EmpId (MR)
- LinkDate
- Active

---

## Step-by-Step Workflow (Clone This)

1. Select doctor
2. Assign MR
3. Save
4. Only linked MR sees doctor in their list

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
/app/doctorMRLinking
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/doctorMRLinking`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS18`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
