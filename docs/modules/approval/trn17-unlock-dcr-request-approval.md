# Unlock DCR Request Approval

> **Menu Code:** `TRN17`  
> **Route:** `/app/unlockDCRRequest`  
> **Module:** Approval > Unlock DCR Request Approval

---

## In Short (Simple English)

Allow editing locked DCR.

## Real Example (Synchem Pharma)

Amit made mistake in DCR — requests unlock.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DCR date
- Reason

---

## Step-by-Step Workflow (Clone This)

1. Review request
2. Approve unlock
3. MR edits DCR
4. Resubmit

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
/app/unlockDCRRequest
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/unlockDCRRequest`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN17`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
