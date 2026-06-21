# Visit Purpose

> **Menu Code:** `MAS20210`  
> **Route:** `/app/visitPurpose`  
> **Module:** Master Setup > General Setup > Visit Purpose

---

## In Short (Simple English)

Reason for visit: regular call, follow-up, sample drop, camp.

## Real Example (Synchem Pharma)

MR selects visit purpose "Follow-up" when revisiting doctor for prescription feedback.

---

## What Data Is Here?

This screen stores or shows these types of information:

- VisitPurposeId
- PurposeName

---

## Step-by-Step Workflow (Clone This)

1. Define purposes
2. MR picks one per visit in DCR

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
/app/visitPurpose
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/visitPurpose`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS20210`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
