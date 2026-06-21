# Route Master

> **Menu Code:** `MAS20104`  
> **Route:** `/app/route`  
> **Module:** Master Setup > Area Setup > Route Master

---

## In Short (Simple English)

Beat routes within an HQ — a group of doctors/retailers an MR visits.

## Real Example (Synchem Pharma)

MR Amit's Route "IND-R-05" has 40 doctors and 15 chemists in Vijay Nagar area.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RouteId
- RouteName
- HeadQuaterId
- StateId
- DoctorCount
- RetailerCount

---

## Step-by-Step Workflow (Clone This)

1. Select HQ
2. Create route name
3. Map doctors/retailers to route
4. Route used in RTP and DCR

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
/app/route
```

## API Endpoints (Backend to Build)

- `api/doctor/route/`
- `api/report/monthly-covered-route`
- `api/report/route-deviation-analysis`
- `api/report/route-deviation/`
- `api/retailer/route/`
- `api/route-deviation-request/dateWiseData`
- `api/route-deviation-request/pending`
- `api/route-deviation-request/status`
- `api/route/bulkUpload`
- `api/route/headQuater/`
- `api/route/multipleHeadQuater/`
- `api/route/multipleStates`
- `api/route/pre-defined`
- `api/route/routeListAll`
- `api/route/withDoctorRetailerCount`
- `api/route/withDoctorRetailerCount-multipleStates`
- `api/route/withDoctorRetailerCount/forMRUsers/`

## Clone Checklist

- [ ] Build UI screen at route `/app/route`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20104`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
