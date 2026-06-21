# Doctor Delete Request Approval

> **Menu Code:** `APP03`  
> **Route:** `/app/pendingDoctorDeleteRequest`  
> **Module:** Approval > Doctor Delete Request Approval

---

## In Short (Simple English)

Approve doctor removal.

## Real Example (Synchem Pharma)

Dr. retired — approve deactivation.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Doctor
- Reason

---

## Step-by-Step Workflow (Clone This)

1. Review
2. Approve delete
3. Doctor deactivated

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
/app/pendingDoctorDeleteRequest
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/pendingDoctorDeleteRequest`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP03`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
