# Retailer Approval

> **Menu Code:** `MAS13`  
> **Route:** `/app/retailer-approval`  
> **Module:** Approval > Retailer Approval

---

## In Short (Simple English)

Approve new chemist requests.

## Real Example (Synchem Pharma)

New store on MG Road — admin verifies and approves.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Retailer details
- Requester
- Status

---

## Step-by-Step Workflow (Clone This)

1. Review request
2. Verify route/HQ
3. Approve → creates retailer
4. Notify MR

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
/app/retailer-approval
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/retailer-approval`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS13`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
