# MASTER CLONE BIBLE — Synchem Salestrip SFA

> **Original system reference** — business rules, live data, APIs.  
> **What we are building:** Multi-tenant **Pharma SFA SaaS** — see **[17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)** (locked stack, 6-month / 500-user MVP).  
> Live data fetched read-only from [https://synchem.salestrip.in/](https://synchem.salestrip.in/) on 2026-06-12.  
> Full JSON samples: [../data/live-sample-data.json](../data/live-sample-data.json)  
> Flowcharts: [13-FINAL-MASTER-FLOWCHART.md](./13-FINAL-MASTER-FLOWCHART.md)

---

## Build vs Reference

| Aspect | This document | Build plan |
|--------|---------------|------------|
| Purpose | Original Salestrip behaviour + live sample data | How to build the SaaS platform |
| Product | Single-tenant Synchem instance | **Multi-tenant SaaS** (first tenant: SYN) |
| Stack | ASP.NET + AngularJS + Android | **NestJS + React + React Native** |
| Timeline | Full 152 screens | **MVP in 6 months (500 users)**, full parity 9–10 months |
| Start here for build | — | **[17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)** |

---

# PART A — NON-TECHNICAL (Business)

## A1. What Is This Application?

**Synchem Salestrip** is a **Sales Force Automation (SFA)** system for pharmaceutical field teams.

| Plain English | Meaning |
|---------------|---------|
| Medical Representative (MR) | Sales person who visits doctors and chemists |
| Doctor (HCP) | Healthcare professional — main customer |
| Retailer / Chemist | Pharmacy where medicines are sold |
| Stockist | Distributor supplying chemists |
| DCR | Daily diary of what MR did today |
| RTP | Monthly calendar of which area to visit each day |
| POB | Orders booked from doctors/chemists |
| HQ | Sales territory (e.g., Satna, Neemuch, Indore) |
| Route / Beat | Sub-area within HQ with list of doctors |

**Company using it:** Synchem Pharmaceuticals Pvt. Ltd., Indore  
**Login company code:** `SYN`  
**Division:** Ethical (prescription medicines)

---

## A2. Live System Size (Real Numbers)

| Data | Count in Production |
|------|---------------------|
| Employees (MRs + Managers + Admin) | **533** |
| Doctors | **33,730** |
| Retailers (Chemists) | **40,260** |
| Products (SKUs) | **266** |
| Brands | **90** |
| Headquarters (Territories) | **155** |
| Routes (Beats) | **2,973** |
| Stockists | **386** |
| Menu screens | **146** |
| API endpoints | **327** |
| UI routes | **317** |

---

## A3. Who Logs In and What They See

| Role | Code | Count example | Lands on | Main job |
|------|------|---------------|----------|----------|
| Admin | AD | admin user | Management Dashboard | Setup masters, all reports, approvals |
| Manager | MAN | ASM, RSM, ZSM | Manager Dashboard | Approve team work, monitor performance |
| Field Staff | FS | MR | Field Staff Dashboard | Visit doctors, submit DCR daily |

### Real Admin User (from live system)

| Field | Value |
|-------|-------|
| Name | Admin User |
| Username | admin |
| Employee Code | 0002 |
| Email | info@synchem.co |
| Mobile | 8959911409 |
| City | INDORE, MADHYA PRADESH |
| HQ | H. Office |
| Hierarchy | ADMIN (MGT) |
| Role | ADMIN (roleId 1) |

### Real MR User (sample from live system)

| Field | Value |
|-------|-------|
| Name | Vacant Jabalpur3 |
| Username | MRJPR2 |
| Email | mrjabalpur3@synchem.co |
| HQ | Jabalpur 3 |
| Role | MR (Field Staff) |
| Reporting Manager | Santosh Kumar |
| Geo-fencing | Enabled |

---

## A4. Organization Chart (Live)

```
ADMIN (Head Office)
  └── MSD (Manager - Sales & Development)
        └── ZSM (Zonal Sales Manager)
              └── RSM (Regional Sales Manager)
                    └── ASM (Area Sales Manager)
                          └── MR (Medical Representative) ← visits field daily
```

**Designations in system:** MR, Sales Executive, ASM, RSM, ZSM

---

## A5. Real Sample Data — Doctor

```json
{
  "doctorId": 25791,
  "fullName": "(major) RAMCHANDRA TRIPATHI",
  "clincAddress": "near bus stand",
  "mobileNo": "9098710258",
  "cityName": "SATNA",
  "stateName": "MADHYA PRADESH",
  "headQuaterName": "Satna",
  "routeName": "SATNA-Bharhut Nagar(V)-1(S5)",
  "specialityName": "MD(Phy)",
  "employeeName": "Vibhav Gupta",
  "grade": "A",
  "class": "Rx",
  "approveStatus": "A",
  "statusType": "Deactivated"
}
```

**Simple English:** Dr. Ramchandra Tripathi is a physician in Satna city, on route SATNA-Bharhut Nagar, looked after by MR Vibhav Gupta. Grade A doctor. Currently deactivated in system.

---

## A6. Real Sample Data — Retailer (Chemist)

```json
{
  "retailerId": 11228,
  "shopName": "ZULFI MEDICAL2",
  "headQuaterName": "Neemuch",
  "routeName": "FOCUS NEEMUCH-SUP-CORE-(S3)",
  "code": "NeZU1823",
  "approveStatus": "A",
  "approveStatusName": "Approved",
  "statusType": "Deactivated"
}
```

**Simple English:** ZULFI MEDICAL2 is a chemist in Neemuch territory, on a focus route. Approved but currently deactivated.

---

## A7. Real Sample Data — Product

```json
{
  "productId": 291,
  "productName": "ACENOVA SR PLUS CAP",
  "prodCode": "107",
  "shortName": "A-SR CAP",
  "divisionName": "Ethical",
  "categoryName": "ACENOVA GROUP",
  "packingTypeName": "1*10",
  "mrp": 110.0,
  "price": 83.81,
  "priceToStockist": 75.43,
  "brandId": 89,
  "allowSample": true,
  "status": "Y"
}
```

```json
{
  "productId": 292,
  "productName": "FRUTOLYTE-Z LIQUID",
  "prodCode": "1925",
  "shortName": "FRUTO-Z",
  "categoryName": "FRUTOLYTE GROUP",
  "packingTypeName": "1*200 ML",
  "mrp": 37.0,
  "price": 28.19,
  "priceToStockist": 25.37
}
```

**Simple English:** Synchem sells products like ACENOVA SR PLUS CAP (₹110 MRP) and FRUTOLYTE-Z LIQUID (₹37 MRP). MRs detail these to doctors and book orders at chemists.

---

## A8. Real Sample Data — Route & HQ

```json
{
  "headQuaterId": 157,
  "headQuaterName": "Sagar 4",
  "cityName": "SAGAR",
  "stateName": "MADHYA PRADESH",
  "headQuaterTypeName": "Metro",
  "active": true
}
```

```json
{
  "routeId": 2999,
  "routeName": "Gangadtalai -(S2)",
  "headQuaterName": "Banswara",
  "cityName": "BANSWARA",
  "stateName": "RAJASTHAN",
  "routeTypeName": "Ex-Station",
  "setNo": 2,
  "status": "Y"
}
```

**Route types:** Ex-Station (travel route), base station routes  
**States in system:** MADHYA PRADESH, RAJASTHAN, CHHATISGARH, UTTAR PRADESH, etc.

---

## A9. Real Sample Data — Stockist

```json
{
  "stockistId": 387,
  "stockistName": "DHROOV MEDICAL AGENCY",
  "contactPerson": "ANKIT GUPTA",
  "headQuaterName": "Shahjahanpur",
  "cityName": "SHAHJAHANPUR",
  "stateName": "UTTAR PRADESH",
  "mobileNo": "9369124611",
  "linkedEmployee": " Shivam Verma",
  "statusType": "Activated"
}
```

---

## A10. Real Holidays (Live)

| Holiday | Date |
|---------|------|
| REPUBLIC DAY | 26/01/2024 |
| Holi | 25/03/2024 |
| 15 August | 15/08/2024 |
| Gandhi Jayanti | 02/10/2024 |
| Deepa Wali | 31/10/2024 |

---

## A11. Pending Work in System Right Now (Live)

| Pending Item | Count |
|--------------|-------|
| **DCR awaiting approval** | **1,512** |
| **Leave awaiting approval** | **113** |
| Tour Programme | 0 |
| Gift/Sample | 0 |
| Expense | 0 |
| Doctor/Retailer creation | 0 |

**Simple English:** Managers have 1,512 daily reports and 113 leave requests waiting for approval.

---

## A12. Complete Business Story (One Month)

### Week 0 (End of previous month)
1. MR **Vibhav Gupta** creates **June Tour Programme** — assigns routes to each day
2. Manager **Santosh Kumar** approves RTP
3. MR creates **Weekly Plan** — lists Dr. Tripathi on Monday, other doctors on other days

### Daily (June 12 example)
1. MR opens **Field Staff Dashboard** — sees pending tasks
2. Travels to Route `SATNA-Bharhut Nagar(V)-1(S5)` by **Bike**
3. Visits **Dr. Ramchandra Tripathi** — details **ACENOVA SR PLUS CAP** for 10 minutes
4. Gives 2 sample strips of ACENOVA
5. Visits chemist — books POB order
6. Opens **DCR** — logs both visits, samples, ₹350 travel expense
7. Submits DCR → goes to manager approval queue

### Month end
1. Collects **Stock Statement** from chemists (opening/closing stock)
2. System generates **Expense Statement** from DCR expenses + template
3. Manager approves expense
4. **Reports** show target vs achievement for MR and products

---

## A13. All 146 Screens Grouped (What Each Group Does)

| Module | Screens | Non-technical purpose |
|--------|---------|----------------------|
| Dashboard | 3 | Home page with pending work and KPIs |
| Master Setup | 35 | Setup lists: doctors, products, areas, people |
| Transaction | 20 | Daily/monthly work: DCR, orders, leave, expenses |
| Reports | 60 | View-only analysis and export |
| Admin | 3 | Roles and permissions |
| Setting | 3 | Company rules and policies |
| Approval | 15 | Manager yes/no queues |
| Bulk Upload | 7 | Excel import for mass data |
| Extra | 7 | Mail, e-detailing, GPS, notifications |

Each screen has its own `.md` file in `docs/modules/` with example + workflow.

---

# PART B — TECHNICAL (Build Reference)

## B1. URLs & Endpoints

| Item | Value |
|------|-------|
| Web URL | https://synchem.salestrip.in/ |
| Login route | `#/app/login` |
| Token endpoint | `POST https://synchem.salestrip.in/token` |
| API base | `https://synchem.salestrip.in/api/` |
| Company code | `SYN` |
| Server | Microsoft-IIS/10.0, ASP.NET |
| CORS | GET, PUT, POST, DELETE, OPTIONS |

### Login Request (Technical)

```http
POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=admin,SYN&password={password}
```

### Login Response (Key Fields)

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 43199,
  "refresh_token": "...",
  "empId": 2,
  "roleType": "AD",
  "compName": "Synchem Pharmaceuticals Pvt. Ltd.",
  "compCode": "SYN",
  "menuList": "[...146 menus JSON string...]",
  "employeeObj": "{...}",
  "configurationSetting": "{SET001:1,...}",
  "isMpin": true,
  "isCheckIn": true
}
```

### JWT Claims (Decoded)

```json
{
  "sub": "admin",
  "empId": "2",
  "compCode": "SYN",
  "industryType": "SYN",
  "roleType": "AD",
  "companyName": "Synchem Pharmaceuticals Pvt. Ltd."
}
```

---

## B2. Frontend Stack (Exact)

| Component | File/Technology |
|-----------|-----------------|
| Framework | AngularJS 1.x (`ng-app="myApp"`) |
| Routing | UI-Router — 317 states `app.sfa.*` |
| UI Grid | DevExtreme `dx.all.js` |
| Theme | AdminLTE `skin-blue sidebar-mini` |
| Maps | Google Maps API (key in index.html) |
| Storage | localStorage via `localStorageService` |
| HTTP | `$http` + interceptors |
| Alerts | Toastr + SweetAlert |
| Loading | blockUI |
| Locale | moment.js `en-IN`, `Asia/Kolkata` |
| Date format | DD/MM/YYYY |
| Main bundle | `app/scripts/main.min.js` (1.2 MB) |
| Vendor bundle | `app/scripts/vendor.min.js` |

### localStorage Keys

| Key | Content |
|-----|---------|
| `authorizationData` | JWT, userName, compCode, roleType, empId, refreshToken |
| `menusData` | Full menu tree with permissions |
| `plainMenus` | Flattened menu for search |
| `employeeData` | Employee profile |
| `configurationSettingData` | SET001–SET131 flags |
| `LoginASDifferentUser` | Admin impersonation state |

### Key Angular Services

| Service | Purpose |
|---------|---------|
| `authService` | login, logout, loginAsDifferentUser, fillAuthData |
| `apiService` | getObject, postObject wrappers for `api/*` |
| `tokenValidity` | Check JWT expiry |
| `commonServiceData` | Shared dropdown/cache data |

---

## B3. API Response Format

```json
{
  "responseCode": 200,
  "errorObj": null,
  "data": { }
}
```

| Code | Behavior |
|------|----------|
| 200 | Success |
| 401 | Redirect to `#/app/login` |
| 417 | Show `errorObj.errorMessage` toast |

---

## B4. Configuration Flags (Live — All Keys)

| Key | Value | Inferred meaning |
|-----|-------|------------------|
| SET001–SET006 | 1 | Core modules ON (DCR, RTP, POB, Gift, Expense, Stock) |
| SET007–SET010 | 0 | Optional features OFF |
| SET011 | 300 | Numeric threshold (geo radius or timeout) |
| SET012–SET020 | 0 | Feature flags OFF |
| SET021 | 1 | Feature ON |
| SET022–SET025 | 0 | OFF |
| SET026–SET031 | 1 | Features ON |
| SET032–SET042 | 0 | OFF |
| SET131 | 1 | Extended feature ON |

---

## B5. Roles (Live API: `api/roles`)

| roleId | roleName | roleType | roleTypeName |
|--------|----------|----------|--------------|
| 1 | ADMIN | AD | Admin |
| 2 | MR | FS | Field Staff |
| 3 | Manager | MAN | Manager |
| 6 | ADMIN | MGT | Management |

---

## B6. Key API Endpoints by Module

### Auth & Users
| API | Purpose |
|-----|---------|
| `POST /token` | Login |
| `api/users/employee-list` | All employees (533) |
| `api/users/empIdWise/{id}` | Single employee |
| `api/users/myTeam/` | Manager's team |
| `api/users/changePassword` | Password change |
| `api/users/generateOTP` | Forgot password OTP |
| `api/hierachy/reporting/` | Org hierarchy |

### Masters
| API | Records |
|-----|---------|
| `api/doctor/doctor-list` | 33,730 doctors |
| `api/retailer/retailer-list/` | 40,260 retailers |
| `api/product` | 266 products |
| `api/brand` | 90 brands |
| `api/headquater/active` | 155 HQs |
| `api/route/routeListAll` | 2,973 routes |
| `api/stockist/stockist-list/` | 386 stockists |
| `api/city/state` | States list |
| `api/designation` | Designations |
| `api/division` | Divisions |
| `api/specialist` | Specialties |
| `api/qualification` | Qualifications |
| `api/packingType` | Pack sizes |
| `api/holiday` | Holidays |
| `api/visitPurpose` | Visit purposes |

### Transactions
| API | Purpose |
|-----|---------|
| `api/dcr/list/` | DCR CRUD |
| `api/dcr/doctor` | Doctor visit lines |
| `api/dcr/retailer-stockist` | Retailer visits |
| `api/dcr/dcr-approval` | Manager approval |
| `api/dcr/common-lov` | Work types, transport |
| `api/monthly-rtp/emp/` | Tour programme |
| `api/pob/partyData/` | Order booking |
| `api/weeklyPlan/` | Weekly plan |
| `api/miscellaneous-expense/` | Expense statement |
| `api/stockStatement/detail/` | Stock statement |
| `api/leave/leaveType` | Leave types |

### Dashboard & Approvals
| API | Purpose |
|-----|---------|
| `api/manager-dashboard/pending-count` | Pending approval counts |
| `api/dashboard/pending-submittion` | User pending items |
| `api/notification/viewmore/` | Notifications |

### Reports (prefix `api/report/`)
60+ endpoints — full list in [05-api-reference.md](./05-api-reference.md)

---

## B7. Database Schema Hints (Clone)

Every table should include:
- `comp_code` = 'SYN' (multi-tenant)
- `entry_by`, `update_by`, `delete_by`
- `active` flag
- `created_at`, `updated_at`

### Core Tables to Create

```
companies, roles, menus, role_menu_permissions
hierarchy, employees, designations
states, cities, headquarters, routes
doctors, retailers, stockists
brands, divisions, categories, products, packing_types
dosages, specialists, qualifications, visit_purposes
expense_heads, expense_templates, holidays
tour_programme, weekly_plan, dcr_header, dcr_doctor_visit, dcr_retailer_visit
pob_header, pob_lines, stock_statement, expense_statement
leave_applications, leave_policies, notifications
approval_history, company_settings
```

---

## B8. UI Route Pattern

All routes use hash routing:
```
https://synchem.salestrip.in/#/app/{module}
```

Examples:
- `#/app/dcrRecord` — DCR list
- `#/app/dcrRecord/add` — Create DCR
- `#/app/doctor` — Doctor master
- `#/app/monthlyRTP` — Tour programme
- `#/app/report/dcr-summary` — DCR report

---

## B9. Mobile App Integration

| Field | Live value |
|-------|------------|
| MobileAppVersionInUse | 1.2.54 |
| PushToken | Firebase FCM token on employee |
| IsCheckIn | GPS check-in enabled per employee |
| IsGeoFencingApplicable | true for field staff |
| isMpin | Mobile PIN login |
| LastLoginDeviceId | Android device ID |

Mobile uses same `api/*` endpoints with JWT auth.

---

## B10. File Upload Endpoints

| API | Purpose |
|-----|---------|
| `/api/users/documents` | Employee documents |
| `/api/doctor/documents` | Doctor images/docs |
| `/api/retailer` | Retailer images |
| `/api/e-detailing/documents` | E-detailing presentations |
| `/api/miscellaneous-expense/documents` | Expense receipts |
| `/api/mailBox/mail-attachment` | Email attachments |

---

## B11. Bulk Upload APIs

| Route | API |
|-------|-----|
| `/app/bulkDoctorUpload` | `doctor/bulkUpload` |
| `/app/bulkRetailerUpload` | `retailer/bulkUpload` |
| `/app/bulkProductUpload` | `product/bulkUpload` |
| `/app/bulkHQUpload` | `headquater/bulkUpload` |
| `/app/bulkRouteUpload` | `route/bulkUpload` |
| `/app/bulkCityUpload` | `city/bulkUpload` |
| `/app/bulkStockistUpload` | `stockist/bulkUpload` |

---

## B12. Status Workflow Pattern (All Transactions)

```
DRAFT → SUBMITTED → PENDING → APPROVED / REJECTED → LOCKED
                                    ↓
                            UNLOCK REQUEST → UNLOCK APPROVED → EDITABLE
```

Status fields typically: `approveStatus` = A (Approved), P (Pending), R (Rejected)

---

## B13. Recommended Clone Tech Stack (Locked)

| Layer | Original | Clone (Final) |
|-------|----------|---------------|
| Repo | — | **Monorepo** (pnpm + Turborepo) |
| Frontend | AngularJS 1.x | **React 18 + TypeScript + Vite** |
| UI Grid | DevExtreme | **TanStack Table + MUI DataGrid** |
| Backend | ASP.NET Web API | **NestJS + TypeScript + Prisma** (modular monolith) |
| Database | SQL Server | **PostgreSQL 16** |
| Auth | OAuth2 + JWT | Same `/token` pattern |
| Mobile | Android native | **React Native + Expo + WatermelonDB** |
| Maps | Google Maps | **Mapbox** + Google geocoding |
| Push | Firebase | Firebase FCM |
| Files | Server filesystem | **R2/S3** — `/{compCode}/` |
| Docker | IIS | **Docker Compose** (local + CI + prod) |
| AI (later) | — | NestJS module + OpenAI/Gemini |

> **Full architecture:** [14-enterprise-architecture.md](./14-enterprise-architecture.md) · **Build phases:** [17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)

## B14. Seed Data for Clone Development

Use `data/live-sample-data.json` to seed your dev database:

1. Import 1 company (SYN)
2. Import 4 roles
3. Import 6 hierarchy levels
4. Import 7 states
5. Import 3 sample HQs, routes, products, doctors, retailers
6. Import admin user (empId 2)
7. Import DCR LOVs (work types, transport)
8. Apply configurationSetting flags

Expand to full scale gradually (533 employees, 33K doctors).

---

## B15. Testing Checklist for 100% Parity

- [ ] Login with SYN company code works
- [ ] Role-based menu shows correct 146 items for admin
- [ ] All 317 routes load without error
- [ ] CRUD on all 35 masters
- [ ] Full DCR create → submit → approve flow
- [ ] RTP monthly calendar works
- [ ] POB order links to DCR
- [ ] All 15 approval queues functional
- [ ] 60 reports return data with filters
- [ ] 3 dashboards show KPIs
- [ ] Bulk upload for all 7 types
- [ ] Notifications on submit
- [ ] Mobile login with MPIN
- [ ] GPS check-in logs location
- [ ] Admin login-as-employee works
- [ ] Export Excel/PDF on reports

---

# PART C — DOCUMENT MAP

| Need | Read this |
|------|-----------|
| **Build the SaaS platform** | **[17-FINAL-BUILD-PLAN.md](./17-FINAL-BUILD-PLAN.md)** |
| Plain English start | [10-simple-guide-with-examples.md](./10-simple-guide-with-examples.md) |
| All workflows | [11-end-to-end-workflows.md](./11-end-to-end-workflows.md) |
| Original system + live data | **12-MASTER-CLONE-BIBLE.md** (this file) |
| **Flowcharts** | [13-FINAL-MASTER-FLOWCHART.md](./13-FINAL-MASTER-FLOWCHART.md) |
| All pages (sitemap) | [16-page-tree.md](./16-page-tree.md) |
| Live JSON samples | [../data/live-sample-data.json](../data/live-sample-data.json) |
| Each screen detail | [docs/modules/](./modules/) (146 files) |
| All APIs | [05-api-reference.md](./05-api-reference.md) |
| Build order | [08-clone-roadmap.md](./08-clone-roadmap.md) |

---

*Document generated from read-only analysis of synchem.salestrip.in. Passwords redacted in sample data. Rotate credentials before production use.*
