# Holiday Master

> **Menu Code:** `MAS20204`  
> **Route:** `/app/holiday`  
> **Module:** Master Setup > General Setup > Holiday Master

---

## In Short (Simple English)

Company holidays when field work is not expected.

## Real Example (Synchem Pharma)

Admin marks 26 Jan as Republic Day holiday — MR tour plan skips this day.

---

## What Data Is Here?

This screen stores or shows these types of information:

- HolidayId
- HolidayDate
- HolidayName
- ApplicableTo

---

## Step-by-Step Workflow (Clone This)

1. Add holiday date
2. Shows on calendar
3. Affects tour plan and leave

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
/app/holiday
```

## API Endpoints (Backend to Build)

- `api/dashboard/holiday-calender/`

## Clone Checklist

- [ ] Build UI screen at route `/app/holiday`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20204`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
