# Retailer Delete Approval

> **Menu Code:** `APP10`  
> **Route:** `/app/retailerDeleteRequest/approval`  
> **Module:** Approval > Retailer Delete Approval

---

## In Short (Simple English)

Approve chemist removal.

## Real Example (Synchem Pharma)

Store closed — approve retailer delete.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Retailer
- Reason

---

## Step-by-Step Workflow (Clone This)

1. Review
2. Approve
3. Retailer deactivated

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
/app/retailerDeleteRequest/approval
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/retailerDeleteRequest/approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `APP10`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
