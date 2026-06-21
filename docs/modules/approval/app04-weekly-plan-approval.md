# Weekly Plan Approval

> **Menu Code:** `APP04`  
> **Route:** `/app/pendingWeeklyPlan`  
> **Module:** Approval > Weekly Plan Approval

---

## In Short (Simple English)

Approve weekly doctor plans.

## Real Example (Synchem Pharma)

Amit's week 2 plan — manager approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Doctors per day

---

## Step-by-Step Workflow (Clone This)

1. Review plan
2. Approve
3. Compared in achievement report

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
/app/pendingWeeklyPlan
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/pendingWeeklyPlan`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP04`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
