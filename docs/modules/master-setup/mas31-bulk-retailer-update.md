# Bulk Retailer Update

> **Menu Code:** `MAS31`  
> **Route:** `/app/bulkRetailerUpdate`  
> **Module:** Master Setup > Bulk Retailer Update

---

## In Short (Simple English)

Upload Excel to update many retailers at once.

## Real Example (Synchem Pharma)

Bulk update phone numbers for 150 chemists after survey.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Excel with RetailerId and updated fields

---

## Step-by-Step Workflow (Clone This)

1. Download template
2. Fill and upload
3. Review results

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
/app/bulkRetailerUpdate
```

## API Endpoints (Backend to Build)

- `api/retailer/bulkRetailerUpdate`

## Clone Checklist

- [ ] Build UI screen at route `/app/bulkRetailerUpdate`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS31`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
