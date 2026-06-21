# Page Tree — Synchem Salestrip SFA

Tree structure of every page/screen with a one-line explanation. Use as **sitemap** for routing, navigation, and MVP planning.

> **Total:** 152 pages (146 menu + ~6 extra routes) · **MVP (6 months):** ~40–50 core screens — see [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md) Section 6  
> **Legend:** `MenuCode` Page Name — `route` — what it does

---

## 0. Auth & Public

```
Auth
├── Login ........................ #/app/login
│   └── Sign in with username + password + company code (SYN); USER (web) or EMPLOYEE (mobile)
├── Forgot Password .............. #/app/forgotPassword/{userType}
│   └── Reset password via OTP sent to registered mobile/email
└── Login History Report ......... employee/login-report
    └── Admin audit — who logged in, when, from where
```

## 1. Dashboard

```
Dashboard
├── `DSH01` Field Staff DashBoard — `/app/fieldStaff/dashboard` — Home screen for MR showing today's work, pending tasks, and targets.
├── `DSH02` Manager DashBoard — `/app/manager/dashboard` — Manager's home showing team performance and items waiting for approval.
├── `DSH03` Management Dashboard — `/app/management/dashboard` — Top-level company dashboard for admin/HO with best doctors, products, and KPIs.
```

## 2. Master Setup

```
Master Setup
├── Area & Geography
│   ├── `MAS20102` CityMaster — `/app/city` — List of cities used in addresses for doctors, retailers, and employees.
│   ├── `MAS20103` HeadQuarter Master — `/app/headQuarter` — Sales territories — each MR belongs to one HQ like "Indore-1".
│   ├── `MAS20104` Route Master — `/app/route` — Beat routes within an HQ — a group of doctors/retailers an MR visits.
│   ├── `MAS20105` Set Color Code — `/app/workColorCode` — Colors for calendar/work types so tour plan is easy to read.
│   ├── `MAS20106` Route Distance Master — `/app/routeDistance` — Distance between routes/towns for travel expense calculation.
│   ├── `MAS20107` Pool Master — `/app/poolMaster` — Promotional budget pools for gifts and samples.
├── Customers, Products & People
│   ├── `MAS03` Retailer Master — `/app/retailer` — Chemist/pharmacy database — where products are sold.
│   ├── `MAS04` Stockist Master — `/app/stockist` — Distributors who supply medicines to chemists.
│   ├── `MAS05` Product Master — `/app/product` — Full medicine/SKU catalog with brand, price, division.
│   ├── `MAS06` Hierarchy Master — `/app/hierachy` — Org chart levels: Admin → RM → ZM → MR.
│   ├── `MAS07` Employee Master — `/app/employees` — All system users — MRs, managers, admins.
│   ├── `MAS08` Expense Template — `/app/expenseTemplate` — Fixed monthly allowance structure per employee grade.
│   ├── `MAS09` Doctor Master — `/app/doctor` — Doctor database — the people MRs visit daily.
│   ├── `MAS10` Doctor Creation Request — `/app/doctor-creation-request` — MR requests to add a new doctor not in system.
│   ├── `MAS12` Retailer Creation Request — `/app/retailer-creation-request` — MR requests to add new chemist.
│   ├── `MAS14` Update Reporting Manager — `/app/updateReportingManager` — Change which manager an employee reports to.
│   ├── `MAS16` Monthly Target — `/app/monthlyTarget` — Set sales/call targets per MR per product per month.
│   ├── `MAS17` Doctor Visit Preference Setting — `/app/doctorVisitSetting` — Set which days doctor prefers visits (Mon/Wed/Fri).
│   ├── `MAS18` Doctor MR Linking — `/app/doctorMRLinking` — Assign specific doctors to specific MRs.
│   ├── `MAS19` Brand Master — `/app/brand` — Product brands under Synchem portfolio.
│   ├── `MAS21` Doctor Delete Request — `/app/doctorDeleteRequest` — Request to remove/deactivate a doctor (moved, retired, wrong entry).
│   ├── `MAS22` Bulk Doctor Update — `/app/bulkDoctorUpdate` — Upload Excel to update many doctors at once.
│   ├── `MAS31` Bulk Retailer Update — `/app/bulkRetailerUpdate` — Upload Excel to update many retailers at once.
├── General LOV Lists
│   ├── `MAS20201` Designation — `/app/designation` — Job titles like MR, Senior MR, Area Manager.
│   ├── `MAS20202` Dosage Master — `/app/dosage` — Medicine forms: tablet, capsule, syrup, injection.
│   ├── `MAS20203` Expense Head Master — `/app/expenseHead` — Expense categories: travel, food, lodging, postage.
│   ├── `MAS20204` Holiday Master — `/app/holiday` — Company holidays when field work is not expected.
│   ├── `MAS20205` Product Category — `/app/product-category` — Product grouping like Antibiotics, Cardiology, Pain Management.
│   ├── `MAS20206` Product Division — `/app/division` — Business line — Synchem uses "Ethical" division.
│   ├── `MAS20207` Packing Type — `/app/packingType` — Pack size description: 10x10, 30ml bottle, etc.
│   ├── `MAS20208` Qualification Master — `/app/qualification` — Doctor degrees: MBBS, MD, BAMS, etc.
│   ├── `MAS20209` Specialist Master — `/app/specialist` — Doctor specialty: Cardiologist, Pediatrician, GP.
│   ├── `MAS20210` Visit Purpose — `/app/visitPurpose` — Reason for visit: regular call, follow-up, sample drop, camp.
```

## 3. Transaction

```
Transaction
├── `TRN01` Tour Programme — `/app/monthlyRTP` — Monthly plan of which routes/MRs will work each day (RTP).
├── `TRN24` Weekly Plan — `/app/weeklyPlan` — Week-wise plan of which doctors to visit each day.
├── `TRN03` Daily Call Report — `/app/dcrRecord` — Daily log of field work — visits, detailing, samples, expenses.
├── `TRN04` Personal Order Booking — `/app/pob/add` — Record orders from doctors/chemists during visits (POB).
├── `TRN05` Gift/Sample Requisition — `/app/requisition` — MR requests promotional samples/gifts from company stock.
├── `TRN07` Gift/Sample Receive — `/app/receivingGS` — MR confirms receipt of approved samples/gifts.
├── `TRN09` Leave Application — `/app/leaveApplication` — Employee applies for leave (CL/SL/PL).
├── `TRN12` Stock Statement — `/app/stockStatement/add` — Monthly survey of stock and sales at chemist level.
├── `TRN20` Expense Statement — `app/expenseStatement` — Monthly expense claim combining DCR expenses + fixed allowances.
├── `TRN08` Manager Tour Programme — `/app/tourProgramme` — Manager's own field visit plan (joint work with team).
├── `TRN26` Infiltration — `/app/infiltration` — Track competitor products at chemist/doctor level.
├── `TRN28` Input & Sales Plan — `/app/input-salesPlan` — Forward plan for inputs (calls, camps) and expected sales.
├── `TRN29` Focused Activity Plan — `/app/focusedActivityPlan` — Special push plan for specific products in a period.
├── `TRN30` Manager Day Allocation — `/app/managerDayAllocation` — Plan how many days manager spends in each territory.
├── `TRN18` Allocate Gift/Sample — `/app/allocateGiftSample` — Admin assigns sample stock from central pool to MRs.
├── `TRN19` Unlock Stock Statement — `/app/unlockStockStatementRequest` — Request permission to edit a locked stock statement.
├── `TRN22` Revise Stock Statement — `/app/reviseStockStatement` — Correct a submitted stock statement before final lock.
├── `TRN23` Delete DCR — `/app/dcrRecord/delete/admin` — Admin removes wrong/duplicate DCR records.
├── `TRN25` Unlock Weekly Plan — `/app/unlockWeeklyPlan` — Request to edit a locked weekly plan.
├── `TRN27` Pool Distribution — `/app/poolDistribution` — Split promotional budget pool among team members.
```

## 4. Approval Queues

```
Approval Queues
├── `APP01` DCR Approval — `/app/dcrRecord/approval/admin` — Admin approves submitted DCRs.
├── `APP03` Doctor Delete Request Approval — `/app/pendingDoctorDeleteRequest` — Approve doctor removal.
├── `APP04` Weekly Plan Approval — `/app/pendingWeeklyPlan` — Approve weekly doctor plans.
├── `APP05` Infiltration Approval — `/app/infiltration/approval` — Approve competitor reports.
├── `APP06` Input & Sales Plan Approval — `/app/input-salesPlan/pending` — Approve territory plans.
├── `APP10` Retailer Delete Approval — `/app/retailerDeleteRequest/approval` — Approve chemist removal.
├── `APP11` Focused Activity Plan Approval — `/app/focusedActivityPlan/approval` — Approve product focus campaigns.
├── `APP12` Manager Day Allocation Approval — `/app/managerDayAllocation/approval` — Approve manager field day plan.
├── `MAS11` Doctor Approval — `/app/doctor-approval` — Approve new doctor requests from MRs.
├── `MAS13` Retailer Approval — `/app/retailer-approval` — Approve new chemist requests.
├── `TRN02` Tour Programme Approval — `/app/monthlyRTP/approval` — Approve monthly RTP from MRs.
├── `TRN06` Gift/Sample Requisition Approval — `/app/requisition/approval` — Approve sample requests.
├── `TRN10` Leave Approval — `/app/leave/approval` — Approve leave applications.
├── `TRN17` Unlock DCR Request Approval — `/app/unlockDCRRequest` — Allow editing locked DCR.
├── `TRN21` Expense Approval — `/app/expenseStatement/approval` — Approve monthly expense claims.
```

## 5. Reports

```
Reports
├── DCR & Field Activity
│   ├── `REP01` DCR Summary — `/app/report/dcr-summary` — Total DCR calls and field days per MR
│   ├── `REP02` Visit Summary — `/app/report/visit-summary` — Doctor and chemist visit counts summary
│   ├── `REP03` Visit Frequrency — `/app/report/doctor-retailer/visitFrequency` — Visit frequency per doctor and retailer
│   ├── `REP09` Route Deviation Detail — `/app/report/routeDeviationDetail` — Day-wise detail of planned vs actual route
│   ├── `REP10` Tour Programme Summary — `/app/report/rtp-summary` — Monthly tour plan (RTP) adherence summary
│   ├── `REP14` Manager DCR Summary — `/app/report/managerDCRSummary` — Total DCR calls and field days per MR
│   ├── `REP15` Route Deviation Analysis — `/app/report/routeDeviationAnalysis` — Analysis of RTP plan vs actual field route
│   ├── `REP16` Monthly Covered Route — `/app/report/monthlyCoveredRoute` — Routes covered at least once in month
│   ├── `REP29` Doctor DCR Detail — `/app/report/doctor-dcr-detail` — Detailed DCR line items per doctor
│   ├── `REP33` Joint Work Report — `/app/report/jointWorkReport` — Manager joint field visits with MRs
│   ├── `REP35` Speciality Wise Doctor Calls — `/app/report/specialityWiseDoctorCall` — Doctor calls grouped by medical specialty
│   ├── `REP36` Weekly Acheivement Report — `/app/report/weeklyDoctorCallPlanAchievement` — Weekly doctor plan vs actual achievement
│   ├── `REP39` Manager Wise Focused Report — `/app/report/managerWiseFocusedList` — Focused activity list by manager
│   ├── `REP64` DCR Trend — `/app/report/dcrTrend` — DCR submission trend over time
├── Doctor & Retailer
│   ├── `REP18` Doctor Report — `/app/report/doctors` — Doctor list with visit and coverage stats
│   ├── `REP22` Missed Calls — `/app/report/missedCallReport` — Doctors planned but not visited in the period
│   ├── `REP23` Monthly Covered Doctor — `/app/report/monthlyCoveredDoctor` — Doctors visited at least once in month
│   ├── `REP24` Retailer Report — `/app/report/retailer` — Chemist list with visit stats
│   ├── `REP38` Territory Report — `/app/report/territory` — Territory-wise coverage and performance
│   ├── `REP62` Call Average Trend — `/app/report/callAverageTrend` — Average calls per day trend over time
│   ├── `REP75` Territory At Glance (New) — `/app/report/territoryAtGlance-new` — Territory snapshot — doctors, chemists, coverage
├── Employee & Attendance
│   ├── `REP04` Employee Analysis — `/app/report/employee-analysis` — MR performance and activity analysis
│   ├── `REP12` Employee POB — `/app/report/employee-pob` — Order booking (POB) totals per MR
│   ├── `REP26` User Activity — `/app/report/userYearlyActivity` — Yearly login and activity per user
│   ├── `REP27` Monthly Work Report — `app/report/monthly-work-report` — Monthly field work summary per MR
│   ├── `REP28` Leave Report — `/app/report/leave` — Leave taken history
│   ├── `REP37` Activity & Performance Report — `/app/report/activity-performance-report` — Combined activity and KPI performance
│   ├── `REP40` Manager Activity Report — `/app/report/managerActivityReport` — Manager field and office activity log
│   ├── `REP41` Attendance Report — `/app/report/attendanceReport` — Field working days and attendance
│   ├── `REP61` Leave Balance Report — `/app/report/leaveBalance` — Remaining leave balance per employee
│   ├── `REP74` Leave Accrual Report — `/app/report/leaveAccrual` — Leave credits earned per period
├── Expense
│   ├── `REP05` Monthly Expense Summary — `/app/report/monthlyExpenseSummary` — Monthly expense totals and breakdown
│   ├── `REP11` Monthly Expense Statement — `/app/report/monthlyExpenseStatement` — Monthly expense totals and breakdown
├── GPS Tracking
│   ├── `REP32` Current Location — `/app/report/current-location` — Live GPS location of field staff on map
├── Gift & Sample
│   ├── `REP07` Monthly Gift/Sample Distribution — `/app/report/monthlySampleDistribution` — Monthly promotional sample distribution totals
│   ├── `REP19` Product Wise Gift/Sample Distribution — `/app/report/productWiseSampleDistribution` — Samples distributed per product
│   ├── `REP25` Employee Wise Gift/Sample — `/app/report/employee/gift-sample` — Samples distributed per MR
├── Sales & Stock
│   ├── `REP41702` Sales Product Wise — `/app/report/productWiseSalesSummary` — Read-only analytics — Sales Product Wise
│   ├── `REP41703` Sales Head Quater Wise — `/app/report/headQuarterWiseSalesSummary` — Sales broken down by HQ territory
│   ├── `REP41704` Stockist-Product Sales Analysis — `/app/report/stockistProductSalesAnalysis` — Sales analysis by stockist and product
│   ├── `REP41706` Monthly Sales Summary — `/app/report/monthlySalesSummary/0` — Overall secondary sales summary
│   ├── `REP41707` Monthly Stock Statement — `/app/report/monthlyStockStatement/0` — Month-wise chemist stock statement report
│   ├── `REP41708` Product-Head Quarter Sales  Analysis — `/app/report/productHeadQuarterSalesAnalysis` — Product sales by HQ territory
│   ├── `REP41709` Product-State Sales Analysis — `/app/report/productStateSalesAnalysis` — Product sales analysis by state
│   ├── `REP41710` Pending Stock Statement — `/app/report/pendingStockStatement` — Stock statements not yet submitted
│   ├── `REP41711` Sales Trend — `/app/report/salesTrend` — Sales trend over selected period
│   ├── `REP41712` Sales Summary — `/app/report/salesSummary` — Overall secondary sales summary
│   ├── `REP41713` Sales & Stock Statement — `/app/report/salesAndStockStatement` — Combined sales and stock statement view
│   ├── `REP41714` Manager Sales Trend — `/app/report/salesTrendManager` — Sales trend over selected period
│   ├── `REP41715` Manager Sales Summary — `/app/report/managerSalesSummary` — Overall secondary sales summary
├── Target & Achievement
│   ├── `REP20` Monthly Target Achievement — `/app/report/employeeTargetAchievement` — MR target vs actual achievement percentage
│   ├── `REP21` Product Wise Target Vs Achievement — `/app/report/productTargetAchievement` — Product-level target vs achievement
```

## 6. Admin

```
Admin
├── `ADM01` Role Master — `/app/roles` — Define roles like Admin, MR, Manager.
├── `ADM04` Role Setting — `/app/role-permission` — Set menu permissions per role.
├── `ADM05` Leave Accrual — `/app/leaveAccrual` — Run monthly leave credit for all staff.
```

## 7. Setting

```
Setting
├── `SET01` DCR Setting — `/app/dcrSetting` — Configure DCR business rules.
├── `SET02` Company Info — `/app/companyInfo` — Company profile and branding.
├── `SET03` Leave Policy — `/app/leavePolicy` — Define leave types and rules.
```

## 8. Bulk Upload

```
Bulk Upload
├── Bulk City Upload — `/app/bulkCityUpload` — Upload 50 new cities for MP expansion.
├── Bulk Doctor Upload — `/app/bulkDoctorUpload` — Upload 200 new doctors from market survey.
├── Bulk HQ Upload — `/app/bulkHQUpload` — Add 10 new HQs for expansion.
├── Bulk Product Upload — `/app/bulkProductUpload` — Upload 30 new SKUs from R&D.
├── Bulk Retailer Upload — `/app/bulkRetailerUpload` — Upload 500 chemists from census.
├── Bulk Route Upload — `/app/bulkRouteUpload` — Create 20 new beats in Dewas.
├── Bulk Stockist Upload — `/app/bulkStockistUpload` — Add 15 distributors.
```

## 9. Additional Features

```
Additional Features
├── Alert bell for pending work. — `/app/Notifications` — Notification bell — pending approvals and tasks waiting for action
├── Chat/messages between employees. — `/app/Internal Messages` — Internal chat messages between employees
├── Internal email system. — `/app/Mail Inbox` — Internal email — inbox, compose, sent, draft (HO to field staff)
├── Log of MR check-in/check-out. — `/app/Check-In History` — History log of MR GPS check-in and check-out times
├── Show digital product presentations to doctors. — `/app/e-detailing` — E-detailing — show digital product slides/PDF to doctors
├── Track MR GPS on map. — `/app/Location Tracking` — Live map showing current GPS location of all field staff
├── Update product prices in bulk. — `/app/Product Price Updation` — Bulk update product MRP/prices via Excel upload
```

---

## Mail Sub-Pages (nested under Internal Email)

```
Mail
├── Inbox — received internal emails from HO/managers
├── Compose — write and send email to employees
├── Sent — sent mail archive
├── Draft — saved unsent messages
├── Starred — flagged important mail
└── Trash — deleted mail
```

---

## Summary

| Category | Pages |
|----------|-------|
| Auth & Public | 3 |
| Dashboard | 3 |
| Master Setup › Area & Geography | 6 |
| Master Setup › General LOV Lists | 10 |
| Master Setup › Customers, Products & People | 17 |
| Transaction | 20 |
| Approval Queues | 15 |
| Reports › DCR & Field Activity | 14 |
| Reports › Employee & Attendance | 10 |
| Reports › Doctor & Retailer | 7 |
| Reports › Expense | 2 |
| Reports › Gift & Sample | 3 |
| Reports › Target & Achievement | 2 |
| Reports › Sales & Stock | 13 |
| Reports › GPS Tracking | 1 |
| Admin | 3 |
| Setting | 3 |
| Bulk Upload | 7 |
| Additional Features | 7 |
| Mail Sub-Pages | 6 |
| **Total** | **152** |

---

*Source: `docs/modules/` — one line per documented screen. See [00-index.md](./00-index.md) for feature doc links.*