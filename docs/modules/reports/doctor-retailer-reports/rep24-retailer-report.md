# Retailer Report

> **Menu Code:** `REP24`  
> **Route:** `/app/report/retailer`  
> **Module:** Reports > Doctor/Retailer Reports > Retailer Report

---

## In Short (Simple English)

Report: Retailer Report.

## Real Example (Synchem Pharma)

All chemists with last visit and POB.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Retailer listing with visit stats

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
/app/report/retailer
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

- [ ] Build UI screen at route `/app/report/retailer`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `REP24`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
