# Field Staff DashBoard

> **Menu Code:** `DSH01`  
> **Route:** `/app/fieldStaff/dashboard`  
> **Module:** Dashboard > Field Staff DashBoard

---

## In Short (Simple English)

Home screen for MR showing today's work, pending tasks, and targets.

## Real Example (Synchem Pharma)

Rahul (MR) logs in and sees: "Today you need 8 doctor calls, 3 pending DCRs, ₹45,000 POB this month." He clicks pending DCR to finish yesterday's report.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Daily call target vs done
- Pending RTP/DCR/weekly plan submissions
- POB vs target chart
- Tour calendar for the month
- Birthday list of doctors
- Unread message count

---

## Step-by-Step Workflow (Clone This)

1. MR logs in → lands here
2. Sees what is pending today
3. Clicks tile to complete work
4. Checks tour calendar before going to field

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
/app/fieldStaff/dashboard
```

## API Endpoints (Backend to Build)

- `api/dashboard/fieldstaff/`
- `api/doctor/fieldStaffWise/`

## Clone Checklist

- [ ] Build UI screen at route `/app/fieldStaff/dashboard`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `DSH01`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
