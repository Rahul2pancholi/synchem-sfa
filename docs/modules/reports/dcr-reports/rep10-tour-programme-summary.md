# Tour Programme Summary

> **Menu Code:** `REP10`  
> **Route:** `/app/report/rtp-summary`  
> **Module:** Reports > DCR Reports > Tour Programme Summary

---

## In Short (Simple English)

Report: Tour Programme Summary.

## Real Example (Synchem Pharma)

20 MRs submitted RTP, 18 approved, 2 pending.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RTP status per MR
- Approved vs pending

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
/app/report/rtp-summary
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

- [x] Build UI screen at route `/app/report/rtp-summary`
- [ ] Create database tables for data listed above
- [x] Implement API endpoints
- [x] Add role permission check (menu code `REP10`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
