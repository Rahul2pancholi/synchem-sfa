# Manager DashBoard

> **Menu Code:** `DSH02`  
> **Route:** `/app/manager/dashboard`  
> **Module:** Dashboard > Manager DashBoard

---

## In Short (Simple English)

Manager's home showing team performance and items waiting for approval.

## Real Example (Synchem Pharma)

Area Manager Priya opens dashboard and sees 5 DCRs waiting for approval and her team did ₹12 lakh POB this month vs ₹15 lakh target.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Team POB total
- Pending approval count
- Subordinate list with status
- Team target vs achievement

---

## Step-by-Step Workflow (Clone This)

1. Manager logs in
2. Reviews pending approvals
3. Checks team numbers
4. Drills into individual MR performance

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
/app/manager/dashboard
```

## API Endpoints (Backend to Build)

- `api/activity-performance-report/coveredDoctorWithManager`
- `api/manager-activity-performance-report/partyList`
- `api/manager-dashboard/employeeWisePOBAmount`
- `api/manager-dashboard/pending-count`
- `api/managerDailyReport/dcr-approval`
- `api/managerDailyReport/dcrListMR`
- `api/managerDailyReport/list/`
- `api/managerDailyReport/managerEmpCommonData`
- `api/managerDayAllocation/generate/`
- `api/managerDayAllocation/pending`
- `api/managerDayAllocation/status`
- `api/monthly-rtp/manager`
- `api/monthly-rtp/manager-status`
- `api/report/manager-dcr/summary/`
- `api/report/sales/managerSalesSummary`
- `api/report/sales/managerTrend`
- `api/users/allReportingManager`
- `api/users/changeReportingManager`
- `api/users/reporting-manager/`
- `api/weeklyPlan-report/forManager`

## Clone Checklist

- [ ] Build UI screen at route `/app/manager/dashboard`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `DSH02`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
