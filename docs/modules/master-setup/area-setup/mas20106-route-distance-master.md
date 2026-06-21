# Route Distance Master

> **Menu Code:** `MAS20106`  
> **Route:** `/app/routeDistance`  
> **Module:** Master Setup > Area Setup > Route Distance Master

---

## In Short (Simple English)

Distance between routes/towns for travel expense calculation.

## Real Example (Synchem Pharma)

Distance Indore to Dewas = 35 km. System uses this to suggest travel allowance in DCR.

---

## What Data Is Here?

This screen stores or shows these types of information:

- FromLocation
- ToLocation
- DistanceKm
- RouteId

---

## Step-by-Step Workflow (Clone This)

1. Enter from/to
2. Enter KM
3. Save
4. Used in expense auto-calculation

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
/app/routeDistance
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/routeDistance`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20106`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
