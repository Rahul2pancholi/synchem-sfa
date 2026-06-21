# Company Info

> **Menu Code:** `SET02`  
> **Route:** `/app/companyInfo`  
> **Module:** Setting > Company Info

---

## In Short (Simple English)

Company profile and branding.

## Real Example (Synchem Pharma)

Update Synchem logo and Indore office address.

---

## What Data Is Here?

This screen stores or shows these types of information:

- CompanyName
- Address
- Logo
- Email

---

## Step-by-Step Workflow (Clone This)

1. Edit company details
2. Upload logo
3. Save

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
/app/companyInfo
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/companyInfo`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `SET02`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
