# Live Sample Data (Read-Only Export)

**File:** [live-sample-data.json](./live-sample-data.json)

Fetched read-only from `https://synchem.salestrip.in/` on 2026-06-12.

## Contents

| Section | Description |
|---------|-------------|
| `company` | Synchem tenant info (SYN) |
| `recordCounts` | Production record counts |
| `pendingApprovals` | Live pending DCR (1512), Leave (113) |
| `roles` | ADMIN, MR, Manager roles |
| `hierarchy` | ADMIN → ZSM → RSM → ASM → MR |
| `products_sample` | ACENOVA, FRUTOLYTE, etc. |
| `doctors_sample` | Real doctor records |
| `retailers_sample` | Real chemist records |
| `employees_sample` | Real MR records |
| `dcr_lov` | Work types and transport modes |
| `configurationSetting` | SET001–SET131 flags |

**Passwords are redacted.** Use for seeding clone dev database only.
