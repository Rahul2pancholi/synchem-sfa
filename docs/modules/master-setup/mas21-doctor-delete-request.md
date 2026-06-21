# Doctor Delete Request

> **Menu Code:** `MAS21`  
> **Route:** `/app/doctorDeleteRequest`  
> **Module:** Master Setup > Doctor Delete Request

---

## In Short (Simple English)

Request to remove/deactivate a doctor (moved, retired, wrong entry).

## Real Example (Synchem Pharma)

Dr. Verma retired. MR submits delete request. Admin approves and doctor deactivated.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RequestId
- DoctorId
- Reason
- RequestedBy
- Status

---

## Step-by-Step Workflow (Clone This)

1. MR/Admin requests deletion
2. Pending in approval queue
3. Approve → doctor deactivated
4. Reject → stays active

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
/app/doctorDeleteRequest
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/doctorDeleteRequest`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS21`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
