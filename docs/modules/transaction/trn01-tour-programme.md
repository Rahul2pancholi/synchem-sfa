# Tour Programme

> **Menu Code:** `TRN01`  
> **Route:** `/app/monthlyRTP`  
> **Module:** Transaction > Tour Programme

---

## In Short (Simple English)

Monthly plan of which routes/MRs will work each day (RTP).

## Real Example (Synchem Pharma)

Amit's June RTP: Mon=Route A, Tue=Route B, Wed=Meeting at HO, Thu=Route A, Fri=Route C.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RTPId
- EmpId
- Month
- Year
- DailyRouteMapping
- WorkType per day
- Status

---

## Step-by-Step Workflow (Clone This)

1. MR opens RTP for next month
2. Assigns route per day on calendar
3. Submits
4. Manager approves in Tour Programme Approval
5. Approved RTP guides daily work

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
/app/monthlyRTP
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/monthlyRTP`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN01`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
