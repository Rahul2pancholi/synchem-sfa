# Stockist Master

> **Menu Code:** `MAS04`  
> **Route:** `/app/stockist`  
> **Module:** Master Setup > Stockist Master

---

## In Short (Simple English)

Distributors who supply medicines to chemists.

## Real Example (Synchem Pharma)

Stockist "Indore Pharma Distributors" supplies retailers in Indore zone.

---

## What Data Is Here?

This screen stores or shows these types of information:

- StockistId
- StockistName
- Address
- HQId
- Contact
- Active

---

## Step-by-Step Workflow (Clone This)

1. Add stockist
2. Link to HQ
3. Used in stock statement and sales analysis

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
/app/stockist
```

## API Endpoints (Backend to Build)

- `api/dcr/retailer-stockist`
- `api/report/sales/stockist-product/`
- `api/report/stockist/`
- `api/report/stockist/pending-stockStatement`
- `api/report/stockist/salesSummary/monthly`
- `api/stockist/`
- `api/stockist/bulkStockistDelete`
- `api/stockist/bulkStockistList`
- `api/stockist/bulkUpload`
- `api/stockist/headQuarter/`
- `api/stockist/stockist-list/`
- `api/stockist/team`

## Clone Checklist

- [ ] Build UI screen at route `/app/stockist`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS04`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
