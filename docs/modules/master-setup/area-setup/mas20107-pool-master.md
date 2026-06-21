# Pool Master

> **Menu Code:** `MAS20107`  
> **Route:** `/app/poolMaster`  
> **Module:** Master Setup > Area Setup > Pool Master

---

## In Short (Simple English)

Promotional budget pools for gifts and samples.

## Real Example (Synchem Pharma)

Admin creates pool "Q2 Cardiology Samples" with budget ₹5 lakh for heart-related products.

---

## What Data Is Here?

This screen stores or shows these types of information:

- PoolId
- PoolName
- BudgetAmount
- ProductGroup
- ValidFrom
- ValidTo

---

## Step-by-Step Workflow (Clone This)

1. Create pool
2. Set budget and period
3. Link products
4. Distribute via Pool Distribution

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
/app/poolMaster
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/poolMaster`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20107`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
