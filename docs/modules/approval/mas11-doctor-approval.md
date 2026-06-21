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

- [ ] Build UI screen at route `/app/doctor-approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS11`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
