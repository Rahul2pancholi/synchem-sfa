# Unlock Stock Statement

> **Menu Code:** `TRN19`  
> **Route:** `/app/unlockStockStatementRequest`  
> **Module:** Transaction > Unlock Stock Statement

---

## In Short (Simple English)

Request permission to edit a locked stock statement.

## Real Example (Synchem Pharma)

Amit submitted stock statement but found error in SYNPAR qty. Requests unlock to fix.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RequestId
- StatementId
- Reason
- RequestedBy
- Status

---

## Step-by-Step Workflow (Clone This)

1. MR requests unlock
2. Admin approves
3. Statement becomes editable
4. MR fixes and resubmits

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
/app/unlockStockStatementRequest
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/unlockStockStatementRequest`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN19`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
