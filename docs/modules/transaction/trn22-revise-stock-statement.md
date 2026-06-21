# Revise Stock Statement

> **Menu Code:** `TRN22`  
> **Route:** `/app/reviseStockStatement`  
> **Module:** Transaction > Revise Stock Statement

---

## In Short (Simple English)

Correct a submitted stock statement before final lock.

## Real Example (Synchem Pharma)

Manager asks Amit to revise Dewas chemist stock data before month close.

---

## What Data Is Here?

This screen stores or shows these types of information:

- OriginalStatementId
- RevisedLines[]
- RevisionReason

---

## Step-by-Step Workflow (Clone This)

1. Open submitted statement
2. Edit values
3. Save revision
4. Audit trail kept

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
/app/reviseStockStatement
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/reviseStockStatement`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN22`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
