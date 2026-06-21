# DCR Setting

> **Menu Code:** `SET01`  
> **Route:** `/app/dcrSetting`  
> **Module:** Setting > DCR Setting

---

## In Short (Simple English)

Configure DCR business rules.

## Real Example (Synchem Pharma)

Set minimum 6 doctor calls per day, lock DCR after 3 days.

---

## What Data Is Here?

This screen stores or shows these types of information:

- Setting keys SET001+
- Lock days
- Geo-fence

---

## Step-by-Step Workflow (Clone This)

1. Open settings
2. Toggle rules
3. Save
4. Applied to all DCR validation

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
/app/dcrSetting
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/dcrSetting`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `SET01`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
