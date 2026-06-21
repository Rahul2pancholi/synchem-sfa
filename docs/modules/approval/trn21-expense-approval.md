# Expense Approval

> **Menu Code:** `TRN21`  
> **Route:** `/app/expenseStatement/approval`  
> **Module:** Approval > Expense Approval

---

## In Short (Simple English)

Approve monthly expense claims.

## Real Example (Synchem Pharma)

Amit's ₹13,500 June expense — manager verifies and approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Expense lines
- Total
- DCR link

---

## Step-by-Step Workflow (Clone This)

1. Review statement
2. Verify amounts
3. Approve
4. Forward to accounts

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
/app/expenseStatement/approval
```

## API Endpoints (Backend to Build)

- `api/report/expenseStatement`

## Clone Checklist

- [ ] Build UI screen at route `/app/expenseStatement/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN21`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
