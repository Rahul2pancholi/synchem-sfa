# HeadQuarter Master

> **Menu Code:** `MAS20103`  
> **Route:** `/app/headQuarter`  
> **Module:** Master Setup > Area Setup > HeadQuarter Master

---

## In Short (Simple English)

Sales territories — each MR belongs to one HQ like "Indore-1".

## Real Example (Synchem Pharma)

Company creates HQ "Dewas" under MP. All doctors and routes in Dewas area are tagged to this HQ.

---

## What Data Is Here?

This screen stores or shows these types of information:

- HeadQuaterId
- HeadQuaterName
- StateId
- HeadQuaterType
- Active
- Linked employees count

---

## Step-by-Step Workflow (Clone This)

1. Admin creates HQ
2. Links to state
3. Assigns routes and employees
4. HQ appears in filters everywhere

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
/app/headQuarter
```

## API Endpoints (Backend to Build)

- `api/doctor/headquarter/`
- `api/report/sales/headQuarterWise/`
- `api/report/sales/product-headquarter/`
- `api/retailer/headquarter/`
- `api/stockist/headQuarter/`
- `api/users/state-headQuarter`

## Clone Checklist

- [ ] Build UI screen at route `/app/headQuarter`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20103`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
