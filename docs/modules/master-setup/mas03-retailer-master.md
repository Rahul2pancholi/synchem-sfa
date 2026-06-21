# Retailer Master

> **Menu Code:** `MAS03`  
> **Route:** `/app/retailer`  
> **Module:** Master Setup > Retailer Master

---

## In Short (Simple English)

Chemist/pharmacy database — where products are sold.

## Real Example (Synchem Pharma)

Chemist "Sharma Medical Store, Vijay Nagar" linked to Route IND-R-05, run by Mr. Sharma.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RetailerId
- RetailerName
- OwnerName
- Phone
- Address
- RouteId
- HQId
- CityId
- Active
- GST optional

---

## Step-by-Step Workflow (Clone This)

1. Create retailer
2. Assign route and HQ
3. Approve if created by MR
4. Use in DCR visits and stock statement

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
/app/retailer
```

## API Endpoints (Backend to Build)

- `api/dashboard/visited-doctor-retailer`
- `api/dcr/retailer-stockist`
- `api/dcr/retailer/delete`
- `api/management-dashboard/top-five-doctorRetailer/`
- `api/monthly-rtp/employeeWise/doctorRetailerCount/`
- `api/pob/doctor-retailer/`
- `api/report/retailer/dcr-retailer-summary/`
- `api/report/retailer/details`
- `api/retailer-field-config/dictionary`
- `api/retailer/bulkRetailerDelete`
- `api/retailer/bulkRetailerList`
- `api/retailer/bulkRetailerUpdate`
- `api/retailer/bulkUpload`
- `api/retailer/de-activate`
- `api/retailer/de-activate/approval`
- `api/retailer/de-activate/pending`
- `api/retailer/employeeWise`
- `api/retailer/headquarter/`
- `api/retailer/hqWise`
- `api/retailer/pending`

## Clone Checklist

- [ ] Build UI screen at route `/app/retailer`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS03`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
