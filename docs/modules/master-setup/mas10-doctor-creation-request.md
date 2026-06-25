# Doctor Creation Request

> **Menu Code:** `MAS10`  
> **Route:** `/app/doctor-creation-request`  
> **Module:** Master Setup > Doctor Creation Request

---

## In Short (Simple English)

MR requests to add a new doctor not in system.

## Real Example (Synchem Pharma)

MR finds new cardiologist in area, submits request with name and clinic. Manager approves → doctor added.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RequestId
- DoctorName
- Specialty
- Address
- RequestedBy
- Status
- ApproverComments

---

## Step-by-Step Workflow (Clone This)

1. MR fills request form
2. Submits
3. Manager/Admin reviews in Doctor Approval
4. Approve → creates doctor master record
5. Reject → MR notified

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
/app/doctor-creation-request
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [x] Build UI screen at route `/app/doctor-creation-request`
- [x] Extend `doctors` table (`submitted_by`, `submitted_at`)
- [x] Implement API endpoints (`/api/v1/doctor-requests`)
- [x] Add role permission check (menu code `MAS10`)
- [x] Implement workflow steps exactly as above
- [x] Add validation rules
- [x] Connect notifications on submit/approve/reject
- [ ] Test with real example scenario (UAT)

---
*Part of Synchem Salestrip 100% clone documentation.*
