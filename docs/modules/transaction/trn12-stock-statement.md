# Stock Statement

> **Menu Code:** `TRN12`  
> **Route:** `/app/stockStatement/add`  
> **Module:** Transaction > Stock Statement

---

## In Short (Simple English)

Monthly survey of stock and sales at chemist level.

## Real Example (Synchem Pharma)

June stock statement for Chemist Sharma: opening 100, purchase 50, sales 80, closing 70 for SYNPAR.

---

## What Data Is Here?

This screen stores or shows these types of information:

- StatementId
- RetailerId
- Month
- Year
- ProductLines[]
- Opening
- Purchase
- Sales
- Closing

---

## Step-by-Step Workflow (Clone This)

1. MR visits chemists
2. Collects stock data
3. Enters stock statement
4. Submits monthly
5. Used in sales reports

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
/app/stockStatement/add
```

## API Endpoints (Backend to Build)

- `api/report/sales/salesAndStockStatement/`
- `api/report/stockist/pending-stockStatement`
- `api/stockStatement/checkIsDeadlineRequest/`
- `api/stockStatement/deadline-request`
- `api/stockStatement/deadline-request-pending`
- `api/stockStatement/detail/`
- `api/stockStatement/history-data`
- `api/stockStatement/invoices/`
- `api/stockStatement/isReviewed`
- `api/stockStatement/product`
- `api/stockStatement/revise-list`
- `api/stockStatement/revise-stock-statement`
- `api/stockStatement/unlock-request`
- `api/stockStatement/unlock-request-pending`

## Clone Checklist

- [ ] Build UI screen at route `/app/stockStatement/add`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN12`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
