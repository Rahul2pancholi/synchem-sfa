# Doctor Visit Preference Setting

> **Menu Code:** `MAS17`  
> **Route:** `/app/doctorVisitSetting`  
> **Module:** Master Setup > Doctor Visit Preference Setting

---

## In Short (Simple English)

Set which days doctor prefers visits (Mon/Wed/Fri).

## Real Example (Synchem Pharma)

Dr. Verma prefers Monday and Thursday — weekly plan highlights these days.

---

## What Data Is Here?

This screen stores or shows these types of information:

- DoctorId
- PreferredDays[]

---

## Step-by-Step Workflow (Clone This)

1. Select doctor
2. Pick preferred days
3. Save
4. Used in weekly plan suggestions

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
/app/doctorVisitSetting
```

## API Endpoints (Backend to Build)

- See [05-api-reference.md](../../05-api-reference.md)

## Clone Checklist

- [ ] Build UI screen at route `/app/doctorVisitSetting`
- [ ] Create database tables for data listed above
- [ ] Implement API endpoints
- [ ] Add role permission check (menu code `MAS17`)
- [ ] Implement workflow steps exactly as above
- [ ] Add validation rules
- [ ] Connect notifications if this triggers approval
- [ ] Test with real example scenario

---
*Part of Synchem Salestrip 100% clone documentation.*
