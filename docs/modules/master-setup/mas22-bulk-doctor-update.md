# Bulk Doctor Update

> **Menu Code:** `MAS22`  
> **Route:** `/app/bulkDoctorUpdate`  
> **Module:** Master Setup > Bulk Doctor Update

---

## In Short (Simple English)

Upload Excel to update many doctors at once.

## Real Example (Synchem Pharma)

Admin uploads Excel changing visit frequency for 200 doctors from 2 to 3 per month.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Excel rows with DoctorId/Code and fields to update
- Upload result success/error per row

---

## Step-by-Step Workflow (Clone This)

1. Download template
2. Fill Excel
3. Upload
4. System validates
5. Shows success/failure report

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
/app/bulkDoctorUpdate
```

## API Endpoints (Backend to Build)

- `api/doctor/bulkDoctorUpdate`

## Clone Checklist

- [ ] Build UI screen at route `/app/bulkDoctorUpdate`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS22`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
