# Set Color Code

> **Menu Code:** `MAS20105`  
> **Route:** `/app/workColorCode`  
> **Module:** Master Setup > Area Setup > Set Color Code

---

## In Short (Simple English)

Colors for calendar/work types so tour plan is easy to read.

## Real Example (Synchem Pharma)

Admin sets "Field Work = Blue, Meeting = Green, Leave = Red" on the tour calendar.

---

## What Data Is Here?

This screen stores or shows these types of information:

- ColorCodeId
- WorkType
- HexColor
- Description

---

## Step-by-Step Workflow (Clone This)

1. Define work type
2. Pick color
3. Save
4. Colors show on RTP/weekly plan calendar

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
/app/workColorCode
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/workColorCode`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20105`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
