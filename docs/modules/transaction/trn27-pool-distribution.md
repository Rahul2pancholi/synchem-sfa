# Pool Distribution

> **Menu Code:** `TRN27`  
> **Route:** `/app/poolDistribution`  
> **Module:** Transaction > Pool Distribution

---

## In Short (Simple English)

Split promotional budget pool among team members.

## Real Example (Synchem Pharma)

Manager splits ₹1 lakh sample pool: 40% Amit, 35% Ravi, 25% Sunil.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DistributionId
- PoolId
- EmpId
- SharePercent
- Amount

---

## Step-by-Step Workflow (Clone This)

1. Select pool
2. Assign % to team
3. Save
4. Guides sample allocation

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
/app/poolDistribution
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/poolDistribution`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `TRN27`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
