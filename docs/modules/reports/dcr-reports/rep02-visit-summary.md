# Visit Summary

> **Menu Code:** `REP02`  
> **Route:** `/app/report/visit-summary`  
> **Module:** Reports > DCR Reports > Visit Summary

---

## In Short (Simple English)

Report: Visit Summary.

## Real Example (Synchem Pharma)

June visits: 800 doctor + 300 retailer calls company-wide.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Visit counts by type
- Doctor vs retailer split

---

## Step-by-Step Workflow (Clone This)

1. Select filters (date, employee, HQ, product)
2. Click Generate/Search
3. View grid/chart
4. Export Excel/PDF if needed

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
/app/report/visit-summary
```

## API Endpoints (Backend to Build)

- `api/activity-performance-report/coveredDoctorWithManager`
- `api/activity-performance-report/docAccPlanedFocusedActivity`
- `api/activity-performance-report/doctor-bussiness`
- `api/activity-performance-report/freeMedicineCampDoctorList`
- `api/activity-performance-report/partyListDCRCRMWise`
- `api/activity-performance-report/visitDoctorList`
- `api/employee/leave-accrual-report`
- `api/employee/leave-balance-report/`
- `api/employee/login-report`
- `api/hierachy/reporting/`
- `api/manager-activity-performance-report/partyList`
- `api/managerDailyReport/dcr-approval`
- `api/managerDailyReport/dcrListMR`
- `api/managerDailyReport/list/`
- `api/managerDailyReport/managerEmpCommonData`
- `api/report/CallListByDcrId`
- `api/report/attendance`
- `api/report/dcr-trend/`
- `api/report/dcr-trend/doctor-detail`
- `api/report/dcr/doctor-detail/`

## Clone Checklist

- [x] Build UI screen at route `/app/report/visit-summary`
- [ ] Create database tables for data listed above
- [x] Implement API endpoints
- [x] Add role permission check (menu code `REP02`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
