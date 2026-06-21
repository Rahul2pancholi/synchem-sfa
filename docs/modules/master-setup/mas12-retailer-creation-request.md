# Retailer Creation Request

> **Menu Code:** `MAS12`  
> **Route:** `/app/retailer-creation-request`  
> **Module:** Master Setup > Retailer Creation Request

---

## In Short (Simple English)

MR requests to add new chemist.

## Real Example (Synchem Pharma)

New medical store opened on MG Road. MR submits request. Admin approves and retailer is created.

---

## What Data Is Here?

This screen stores or shows these types of information:

- RequestId
- RetailerName
- Address
- RouteId
- RequestedBy
- Status

---

## Step-by-Step Workflow (Clone This)

1. MR submits
2. Goes to Retailer Approval queue
3. Approve → retailer master created

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
/app/retailer-creation-request
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/retailer-creation-request`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS12`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
