# Expense Template

> **Menu Code:** `MAS08`  
> **Route:** `/app/expenseTemplate`  
> **Module:** Master Setup > Expense Template

---

## In Short (Simple English)

Fixed monthly allowance structure per employee grade.

## Real Example (Synchem Pharma)

MR grade gets ₹8000 fixed + ₹300 daily travel. Template auto-fills expense statement.

---

## What Data Is Here?

This screen stores or shows these types of information:

- TemplateId
- TemplateName
- ExpenseHead lines with amounts
- Assigned employees

---

## Step-by-Step Workflow (Clone This)

1. Create template with heads/amounts
2. Assign to employees
3. Auto-populates monthly expense statement

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
/app/expenseTemplate
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/expenseTemplate`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS08`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
