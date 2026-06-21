# CityMaster

> **Menu Code:** `MAS20102`  
> **Route:** `/app/city`  
> **Module:** Master Setup > Area Setup > CityMaster

---

## In Short (Simple English)

List of cities used in addresses for doctors, retailers, and employees.

## Real Example (Synchem Pharma)

Admin adds city "Ujjain" under state Madhya Pradesh so MRs can tag doctors in Ujjain correctly.

---

## What Data Is Here?

This screen stores or shows these types of information:

- CityId
- CityName
- StateId
- StateName
- Active flag

---

## Step-by-Step Workflow (Clone This)

1. Open City Master
2. Add/Edit city
3. Link to state
4. Save → available in all address dropdowns

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
/app/city
```

## API Endpoints (Backend to Build)

- `api/city/bulkUpload`
- `api/city/state`

## Clone Checklist

- [ ] Build UI screen at route `/app/city`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20102`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
