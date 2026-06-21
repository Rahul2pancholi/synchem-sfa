# Product Master

> **Menu Code:** `MAS05`  
> **Route:** `/app/product`  
> **Module:** Master Setup > Product Master

---

## In Short (Simple English)

Full medicine/SKU catalog with brand, price, division.

## Real Example (Synchem Pharma)

Product "SYNPAR-500" (Paracetamol 500mg), Brand Synpar, Division Ethical, MRP ₹30.

---

## What Data Is Here?

This screen stores or shows these types of information:

- ProductId
- ProductName
- BrandId
- DivisionId
- CategoryId
- DosageId
- PackingTypeId
- MRP
- PTS
- Active

---

## Step-by-Step Workflow (Clone This)

1. Create product
2. Set brand/division/category
3. Set price
4. Link to doctors for detailing
5. Used in POB, DCR, samples

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
/app/product
```

## API Endpoints (Backend to Build)

- `api/doctor/productLink`
- `api/employee/productWise-target-achievement`
- `api/gs-receive/product/`
- `api/input-salesPlan/product`
- `api/management-dashboard/top-five-product`
- `api/monthly-target/productWise`
- `api/monthly-target/productWise/all`
- `api/prdPriceUpdation/productDetail/`
- `api/product/bulkUpload`
- `api/product/divisionWise/`
- `api/product/linkWithDoctor/`
- `api/product/type/`
- `api/report/productWise-sample-distribution`
- `api/report/sales/product-headquarter/`
- `api/report/sales/product-state/`
- `api/report/sales/productWise/`
- `api/report/sales/stockist-product/`
- `api/report/visit/product/`
- `api/stockStatement/product`

## Clone Checklist

- [ ] Build UI screen at route `/app/product`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS05`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
