# Doctor Master

> **Menu Code:** `MAS09`  
> **Route:** `/app/doctor`  
> **Module:** Master Setup > Doctor Master

---

## In Short (Simple English)

Doctor database — the people MRs visit daily.

## Real Example (Synchem Pharma)

Dr. Ramesh Verma, MD Cardiologist, Clinic Vijay Nagar, Route IND-R-05, visit 2x/month.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DoctorId
- DoctorName
- SpecialistId
- QualificationId
- ClinicAddress
- Phone
- RouteId
- HQId
- VisitFrequency
- PreferredDay
- LinkedMR
- ProductFocus
- Active

---

## Step-by-Step Workflow (Clone This)

1. Add doctor (or MR requests creation)
2. Assign route/HQ
3. Set visit frequency
4. Approve if request
5. Doctor appears in DCR and weekly plan

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
/app/doctor
```

## API Endpoints (Backend to Build)

- `api/activity-performance-report/coveredDoctorWithManager`
- `api/activity-performance-report/doctor-bussiness`
- `api/activity-performance-report/freeMedicineCampDoctorList`
- `api/activity-performance-report/visitDoctorList`
- `api/dashboard/doctorFollowUpDone`
- `api/dashboard/pendingDoctorFollowUp`
- `api/dashboard/visited-doctor-retailer`
- `api/dcr/doctor`
- `api/dcr/doctor/delete`
- `api/doctor/all/`
- `api/doctor/bulkDoctorDelete`
- `api/doctor/bulkDoctorList`
- `api/doctor/bulkDoctorUpdate`
- `api/doctor/bulkUpload`
- `api/doctor/de-activate`
- `api/doctor/doctor-approval`
- `api/doctor/doctor-list`
- `api/doctor/employeeWise`
- `api/doctor/fieldStaffWise/`
- `api/doctor/getPreferredDay/`

## Clone Checklist

- [ ] Build UI screen at route `/app/doctor`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS09`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
