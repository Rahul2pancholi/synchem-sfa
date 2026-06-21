# Monthly Work Report

> **Menu Code:** `REP27`  
> **Route:** `app/report/monthly-work-report`  
> **Module:** Reports > Employee Reports > Monthly Work Report

---

## In Short (Simple English)

Report: Monthly Work Report.

## Real Example (Synchem Pharma)

Full month work summary for management review.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Monthly activity summary per MR

---

## Step-by-Step Workflow (Clone This)

1. Select filters (date, employee, HQ, product)
2. Click Generate/Search
3. View grid/chart
4. Export Excel/PDF if needed

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
app/report/monthly-work-report
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `app/report/monthly-work-report`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `REP27`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
