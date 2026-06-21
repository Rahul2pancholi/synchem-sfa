# Management Dashboard

> **Menu Code:** `DSH03`  
> **Route:** `/app/management/dashboard`  
> **Module:** Dashboard > Management Dashboard

---

## In Short (Simple English)

Top-level company dashboard for admin/HO with best doctors, products, and KPIs.

## Real Example (Synchem Pharma)

Admin opens dashboard and sees top 5 doctors by business, top 5 products by sales, and company-wide call averages.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Top doctors/retailers
- Top products
- Company-wide KPIs
- Regional summaries

---

## Step-by-Step Workflow (Clone This)

1. Admin logs in
2. Views company snapshot
3. Identifies weak territories
4. Jumps to detailed reports

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
/app/management/dashboard
```

## API Endpoints (Backend to Build)

- `api/management-dashboard/top-five-doctorRetailer/`
- `api/management-dashboard/top-five-product`
- `api/taskManagement/updateTaskStatus`
- `api/users/except-management`

## Clone Checklist

- [ ] Build UI screen at route `/app/management/dashboard`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `DSH03`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
