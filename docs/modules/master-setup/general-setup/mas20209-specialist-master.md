# Specialist Master

> **Menu Code:** `MAS20209`  
> **Route:** `/app/specialist`  
> **Module:** Master Setup > General Setup > Specialist Master

---

## In Short (Simple English)

Doctor specialty: Cardiologist, Pediatrician, GP.

## Real Example (Synchem Pharma)

Dr. Patel is specialist "Cardiologist" — reports show cardiology call coverage.

---

## What Data Is Here?

This screen stores or shows these types of information:

- SpecialistId
- SpecialistName

---

## Step-by-Step Workflow (Clone This)

1. Add specialty
2. Tag doctors
3. Used in speciality-wise call reports

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
/app/specialist
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/specialist`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20209`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
