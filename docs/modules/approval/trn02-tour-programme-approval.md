# Tour Programme Approval

> **Menu Code:** `TRN02`  
> **Route:** `/app/monthlyRTP/approval`  
> **Module:** Approval > Tour Programme Approval

---

## In Short (Simple English)

Approve monthly RTP from MRs.

## Real Example (Synchem Pharma)

Amit's June RTP — manager checks route coverage and approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RTP calendar
- MR name
- Month

---

## Step-by-Step Workflow (Clone This)

1. Open pending RTPs
2. Review daily plan
3. Approve/reject
4. MR notified

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
/app/monthlyRTP/approval
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/monthlyRTP/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN02`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
