# Doctor Approval

> **Menu Code:** `MAS11`  
> **Route:** `/app/doctor-approval`  
> **Module:** Approval > Doctor Approval

---

## In Short (Simple English)

Approve new doctor requests from MRs.

## Real Example (Synchem Pharma)

MR added Dr. New — manager checks details and approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Request details
- MR name
- Approve/Reject
- Comments

---

## Step-by-Step Workflow (Clone This)

1. Open pending list
2. Review doctor info
3. Approve or reject
4. MR gets notification

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
/app/doctor-approval
```

## API Endpoints (Backend to Build)

- `api/doctor/doctor-approval`

## Clone Checklist

- [x] Build UI screen at route `/app/doctor-approval`
- [x] Extend `doctors` table (`submitted_by`, `submitted_at`)
- [x] Implement API endpoints (`/api/v1/doctor-requests`, approval queue `DOCTOR`)
- [x] Add role permission check (menu codes `MAS10`, `MAS11`)
- [x] Implement workflow steps exactly as above
- [x] Add validation rules
- [x] Connect notifications on submit/approve/reject
- [ ] Test with real example scenario (UAT)

---
*Part of Synchem Salestrip 100% clone documentation.*
