# Configuration Settings

System-wide settings returned at login in `configurationSetting` JSON.

## Synchem Instance Settings (Observed)

| Key | Value | Inferred Purpose |
|-----|-------|------------------|
| SET001 | 1 | DCR module enabled |
| SET002 | 1 | RTP/Tour Programme enabled |
| SET003 | 1 | POB module enabled |
| SET004 | 1 | Gift/Sample module enabled |
| SET005 | 1 | Expense module enabled |
| SET006 | 1 | Stock Statement enabled |
| SET007 | 0 | Feature flag (disabled) |
| SET008 | 0 | Feature flag (disabled) |
| SET009 | 0 | Feature flag (disabled) |
| SET010 | 0 | Feature flag (disabled) |
| SET011 | 300 | Numeric config (possibly geo-fence radius in meters or timeout in seconds) |
| SET012 | 0 | Feature flag (disabled) |
| SET013 | 0 | Feature flag (disabled) |
| SET014 | 0 | Feature flag (disabled) |
| SET015 | 0 | Feature flag (disabled) |
| SET016 | 0 | Feature flag (disabled) |
| SET017 | 0 | Feature flag (disabled) |
| SET018 | 0 | Feature flag (disabled) |
| SET019 | 0 | Feature flag (disabled) |
| SET020 | 0 | Feature flag (disabled) |
| SET021 | 1 | Feature enabled |
| SET022 | 0 | Feature flag (disabled) |
| SET023 | 0 | Feature flag (disabled) |
| SET024 | 0 | Feature flag (disabled) |
| SET025 | 0 | Feature flag (disabled) |
| SET026 | 1 | Feature enabled |
| SET027 | 1 | Feature enabled |
| SET028 | 0 | Feature flag (disabled) |
| SET029 | 1 | Feature enabled |
| SET030 | 1 | Feature enabled |
| SET031 | 1 | Feature enabled |
| SET032 | 0 | Feature flag (disabled) |
| SET033 | 0 | Feature flag (disabled) |
| SET034 | 0 | Feature flag (disabled) |
| SET035 | 0 | Feature flag (disabled) |
| SET036 | 0 | Feature flag (disabled) |
| SET037 | 0 | Feature flag (disabled) |
| SET038 | 0 | Feature flag (disabled) |
| SET039 | 0 | Feature flag (disabled) |
| SET040 | 0 | Feature flag (disabled) |
| SET041 | 0 | Feature flag (disabled) |
| SET042 | 0 | Feature flag (disabled) |
| SET131 | 1 | Extended feature flag (enabled) |

## DCR Settings Screen

**Route:** `/app/dcrSetting`  
**API:** `dcr-setting/object/`, `dcr/settingAndTPList`

Configurable DCR rules (typical SFA settings):

- Mandatory doctor visit count
- DCR locking period (cannot edit after N days)
- Geo-fencing requirement
- Joint work rules
- Transport mode options
- Work type options
- CRM activity types
- Force DCR approval before expense

## Company Info Screen

**Route:** `/app/companyInfo`

Stores company profile editable by admin:
- Company name, address
- Logo upload
- Contact email
- Branding

## Leave Policy Screen

**Route:** `/app/leavePolicy`  
**APIs:** `leave-policy/list`, `leave-policy/save`, `leave-policy/data`

Defines:
- Leave types (CL, SL, PL, etc.)
- Annual entitlement
- Carry-forward rules
- Accrual frequency

## How Settings Are Used

1. Loaded at login → stored in `localStorage` as `configurationSettingData`
2. `$rootScope` / services read settings to show/hide features
3. Backend also enforces settings on API validation

## Clone Implementation

```sql
CREATE TABLE company_settings (
  comp_code VARCHAR(10),
  setting_key VARCHAR(10),
  setting_value VARCHAR(100),
  description TEXT,
  PRIMARY KEY (comp_code, setting_key)
);
```

Admin UI to manage settings per company. Feature flags (0/1) control module visibility.

## Related APIs

- `dcr/common-lov` — DCR list of values
- `dcr/transport` — Transport modes
- `dcr/work-type` — Work types
- `retailer-field-config/dictionary` — Retailer field configuration
