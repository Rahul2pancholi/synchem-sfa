# Focused Activity Plan Approval

> **Menu Code:** `APP11`  
> **Route:** `/app/focusedActivityPlan/approval`  
> **Module:** Approval > Focused Activity Plan Approval

---

## In Short (Simple English)

Approve product focus campaigns.

## Real Example (Synchem Pharma)

SYNHEART launch plan — approve.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Product
- Targets

---

## Step-by-Step Workflow (Clone This)

1. Review
2. Approve
3. Track achievement

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
/app/focusedActivityPlan/approval
```

## API Endpoints (Backend to Build)

- `api/focusedActivityPlan/GetChemFocusPrdAchVsPlan/`
- `api/focusedActivityPlan/GetFocusPrdAchVsPlan/`
- `api/focusedActivityPlan/list`
- `api/focusedActivityPlan/pending`
- `api/focusedActivityPlan/status`

## Clone Checklist

- [ ] Build UI screen at route `/app/focusedActivityPlan/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP11`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
