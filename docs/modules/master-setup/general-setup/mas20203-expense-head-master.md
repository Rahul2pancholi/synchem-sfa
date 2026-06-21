# Expense Head Master

> **Menu Code:** `MAS20203`  
> **Route:** `/app/expenseHead`  
> **Module:** Master Setup > General Setup > Expense Head Master

---

## In Short (Simple English)

Expense categories: travel, food, lodging, postage.

## Real Example (Synchem Pharma)

MR claims ₹200 food allowance under expense head "Daily Allowance".

---

## What Data Is Here?

This screen stores or shows these types of information:

- ExpenseHeadId
- ExpenseHeadName
- ExpenseType
- MaxLimit

---

## Step-by-Step Workflow (Clone This)

1. Define expense head
2. Set limits if any
3. Used in DCR daily expense and expense statement

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
/app/expenseHead
```

## API Endpoints (Backend to Build)

- `api/expensehead/expenseTypeWise/`

## Clone Checklist

- [ ] Build UI screen at route `/app/expenseHead`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20203`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
