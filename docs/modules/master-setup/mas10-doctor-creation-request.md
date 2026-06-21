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

- [ ] Build UI screen at route `/app/doctor-creation-request`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS10`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
