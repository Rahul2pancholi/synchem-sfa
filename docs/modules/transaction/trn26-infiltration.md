# Infiltration

> **Menu Code:** `TRN26`  
> **Route:** `/app/infiltration`  
> **Module:** Transaction > Infiltration

---

## In Short (Simple English)

Track competitor products at chemist/doctor level.

## Real Example (Synchem Pharma)

Chemist Sharma stocks rival brand "CompetitorX Paracetamol" — MR logs infiltration report.

---

## What Data Is Here?

This screen stores or shows these types of information:

- InfiltrationId
- RetailerId/DoctorId
- CompetitorProduct
- Qty
- Date
- EmpId

---

## Step-by-Step Workflow (Clone This)

1. MR records competitor presence
2. Submits
3. Manager approves
4. Used in strategy reports

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
/app/infiltration
```

## API Endpoints (Backend to Build)

- `api/infiltration/approval`
- `api/infiltration/pending`

## Clone Checklist

- [ ] Build UI screen at route `/app/infiltration`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN26`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
