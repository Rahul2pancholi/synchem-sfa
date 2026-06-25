# Expense Statement

> **Menu Code:** `TRN20`  
> **Route:** `app/expenseStatement`  
> **Module:** Transaction > Expense Statement

---

## In Short (Simple English)

Monthly expense claim combining DCR expenses + fixed allowances.

## Real Example (Synchem Pharma)

June expense for Amit: ₹9000 fixed allowance + ₹4500 daily travel from DCRs = ₹13,500 claim.

---

## What Data Is Here?

This screen stores or shows these types of information:

- ExpenseId
- EmpId
- Month
- Year
- LineItems[]
- TotalAmount
- Status

---

## Step-by-Step Workflow (Clone This)

1. System auto-generates from DCR + template
2. MR reviews
3. Submits
4. Manager approves in Expense Approval
5. Sent to accounts

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
app/expenseStatement
```

## API Endpoints (Backend to Build)

- `api/dcr/dcr-approval`
- `api/dcr/dcr-approval-admin/`
- `api/doctor/doctor-approval`
- `api/infiltration/approval`
- `api/managerDailyReport/dcr-approval`
- `api/retailer/de-activate/approval`
- `api/unlockDCR/approve`

## Clone Checklist

- [x] Build UI screen at route `app/expenseStatement`
- [x] Create database tables for data listed above
- [x] Implement API endpoints
- [x] Add role permission check (menu code `TRN20`)
- [x] Implement workflow steps exactly as above (create + submit; auto-gen from DCR deferred)
- [x] Add validation rules
- [x] Connect notifications on submit/approve/reject
- [ ] Test with real example scenario (UAT)

---
*Part of Synchem Salestrip 100% clone documentation.*
