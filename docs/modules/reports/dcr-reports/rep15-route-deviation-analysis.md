# Route Deviation Analysis

> **Menu Code:** `REP15`  
> **Route:** `/app/report/routeDeviationAnalysis`  
> **Module:** Reports > DCR Reports > Route Deviation Analysis

---

## In Short (Simple English)

Report: Route Deviation Analysis.

## Real Example (Synchem Pharma)

Amit has 15% route deviation — highest in team.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Deviation % by MR/route

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
/app/report/routeDeviationAnalysis
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

- [ ] Build UI screen at route `/app/report/routeDeviationAnalysis`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `REP15`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
