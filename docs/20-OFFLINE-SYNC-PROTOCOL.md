# Offline Sync Protocol — Mobile ↔ NestJS API

Specification for **React Native + WatermelonDB** offline field work and **delta sync** with PostgreSQL.

> **Related:** [15-mobile-stack.md](./15-mobile-stack.md) · [18-DEVELOPMENT-STANDARDS.md](./18-DEVELOPMENT-STANDARDS.md) · [openapi/sfa-api-v1.yaml](../openapi/sfa-api-v1.yaml)

---

## 1. Goals

| Goal | Requirement |
|------|-------------|
| Offline DCR | MR works full day with zero network |
| No data loss | Local writes persisted before API ack |
| Idempotent sync | Same push retried safely after network drop |
| Tenant safe | Every sync scoped by `compCode` + `empId` |
| Conflict rules | Predictable — server wins for masters, defined rules for DCR |
| Debuggable | Every sync batch has `syncBatchId` in logs |

---

## 2. Architecture

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant WM as WatermelonDB
    participant API as POST /api/v1/sync/push
    participant DB as PostgreSQL

    App->>WM: Save DCR (status=local_pending)
    App->>WM: Queue outbox row (entity, op, payload)

    Note over App,WM: User goes online

    App->>API: push { syncBatchId, lastSyncAt, changes[] }
    API->>API: Validate JWT + compCode + empId
    API->>DB: $transaction apply changes
    DB-->>API: applied + serverChanges
    API-->>App: { syncBatchId, serverTimestamp, changes[], errors[] }
    App->>WM: Mark outbox synced; apply server delta
```

---

## 3. WatermelonDB tables (mobile)

| Table | Purpose | Sync direction |
|-------|---------|----------------|
| `sync_metadata` | `lastSyncAt`, `lastSyncBatchId`, schema version | Local |
| `sync_outbox` | Pending pushes (FIFO) | Push |
| `doctors` | Cached master | Pull |
| `retailers` | Cached master | Pull |
| `products` | Cached master | Pull |
| `daily_call_reports` | DCR header | Push + Pull |
| `dcr_doctor_visits` | DCR lines | Push + Pull |
| `dcr_retailer_visits` | DCR lines | Push + Pull |
| `gps_check_ins` | GPS pings | Push only |
| `rtp_days` | Tour plan cache | Pull |

Every synced row includes:

| Column | Type | Notes |
|--------|------|-------|
| `server_id` | string \| null | UUID after first sync |
| `client_id` | string | UUID generated on device — **idempotency key** |
| `comp_code` | string | From login |
| `emp_id` | string | Owner |
| `updated_at` | number | Unix ms |
| `sync_status` | enum | `synced` \| `pending` \| `conflict` \| `error` |
| `version` | number | Optimistic lock |

---

## 4. API endpoints

Base: `/api/v1/sync`

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/push` | Client → server changes |
| POST | `/pull` | Server → client delta (optional split from push response) |
| GET | `/status` | Last sync state, schema version, server time |
| POST | `/masters/bootstrap` | Initial full master download for HQ/route |
| GET | `/health` | Sync service ready |

All require `Authorization: Bearer {token}`.

---

## 5. Push request format

```json
{
  "syncBatchId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceId": "android-abc123",
  "clientTimestamp": "2026-06-18T10:30:00+05:30",
  "lastSyncAt": "2026-06-18T09:00:00+05:30",
  "schemaVersion": 1,
  "changes": [
    {
      "clientId": "c1-dcr-001",
      "serverId": null,
      "entityType": "daily_call_report",
      "operation": "create",
      "version": 1,
      "payload": {
        "workDate": "2026-06-18",
        "headQuarterId": "5",
        "routeId": "42",
        "approveStatus": "DRAFT",
        "doctorVisits": [],
        "retailerVisits": []
      }
    },
    {
      "clientId": "c1-gps-001",
      "serverId": null,
      "entityType": "gps_check_in",
      "operation": "create",
      "payload": {
        "latitude": 22.7196,
        "longitude": 75.8577,
        "recordedAt": "2026-06-18T10:15:00+05:30",
        "eventType": "CHECK_IN"
      }
    }
  ]
}
```

### Operations

| operation | Meaning |
|-----------|---------|
| `create` | New row — `serverId` null, `clientId` required |
| `update` | Existing row — `serverId` required, `version` must match |
| `delete` | Soft delete where applicable |

---

## 6. Push response format

```json
{
  "responseCode": 200,
  "errorObj": null,
  "data": {
    "syncBatchId": "550e8400-e29b-41d4-a716-446655440000",
    "serverTimestamp": "2026-06-18T10:30:05+05:30",
    "applied": [
      {
        "clientId": "c1-dcr-001",
        "serverId": "srv-dcr-991",
        "entityType": "daily_call_report",
        "version": 1,
        "status": "applied"
      }
    ],
    "errors": [
      {
        "clientId": "c1-dcr-002",
        "code": "VERSION_CONFLICT",
        "message": "Server version 3, client version 2",
        "serverPayload": { }
      }
    ],
    "serverChanges": [
      {
        "entityType": "daily_call_report",
        "serverId": "srv-dcr-991",
        "operation": "update",
        "version": 2,
        "payload": { "approveStatus": "PENDING" }
      }
    ]
  }
}
```

---

## 7. Idempotency rules

| Rule | Implementation |
|------|----------------|
| Same `syncBatchId` retried | Server returns cached result — no double apply |
| Same `clientId` + `create` | Upsert to existing row — return same `serverId` |
| Unique constraint | `(comp_code, client_id, entity_type)` on server tables |
| Outbox retry | Mobile retries failed batch with **same** `syncBatchId` until `applied` or `errors` |

**MUST:** Server stores `sync_batches` table with status and response snapshot (24h TTL minimum).

---

## 8. Conflict resolution

| Entity | Strategy | User experience |
|--------|----------|-----------------|
| Masters (doctor, product, retailer) | **Server wins** | Overwrite local cache |
| DCR draft (not submitted) | **Last-write-wins** by `updated_at` | Newer timestamp wins |
| DCR submitted / approved | **Server wins** | Show conflict screen — read-only local copy |
| GPS check-ins | **Append-only** | Never conflict — dedupe by `clientId` |
| RTP / weekly plan | **Server wins** | Pull latest after sync |
| Approval status | **Server authoritative** | Always apply server delta |

### Version conflict flow

1. Server returns `VERSION_CONFLICT` in `errors[]`
2. Mobile sets row `sync_status = conflict`
3. UI shows: "This DCR was updated on server. Review changes."
4. User chooses: **Keep server** (default) or **Force local** (only if status still DRAFT and policy allows)

---

## 9. Pull / delta sync

After push (or standalone), client requests changes since `lastSyncAt`:

```json
POST /api/v1/sync/pull
{
  "lastSyncAt": "2026-06-18T09:00:00+05:30",
  "entityTypes": ["daily_call_report", "doctor", "retailer", "product"],
  "limits": { "doctor": 5000, "daily_call_report": 100 }
}
```

Server returns only rows where:

- `comp_code = JWT.compCode`
- `emp_id = JWT.empId` OR shared masters for employee's HQ/routes
- `updated_at > lastSyncAt`

**Pagination:** cursor-based `nextCursor` for large master pulls.

---

## 10. Master bootstrap (first login)

```
POST /api/v1/sync/masters/bootstrap
{ "headQuarterId": "5", "routeIds": ["42", "43"] }
```

Returns full snapshot for employee territory — stored in WatermelonDB. Subsequent syncs use delta pull only.

**Size target:** < 5 MB compressed for typical MR territory.

---

## 11. Security

| Rule | Detail |
|------|--------|
| Auth | JWT required; `empId` in token must match DCR owner |
| Tenant | Reject if payload `compCode` ≠ JWT `compCode` |
| Rate limit | 60 push/min per device |
| Payload size | Max 2 MB per push batch |
| Schema version | Reject unknown `schemaVersion` — force app update |

---

## 12. Sync state machine (mobile)

```
local_pending → pushing → synced
                ↓ error (retry)
                pushing (same syncBatchId)
                ↓ conflict
                conflict (user action)
```

Background sync: Expo TaskManager every 15 min when online + on app foreground.

---

## 13. Server tables (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `sync_batches` | Idempotency — batch id, emp_id, response json |
| `sync_client_mappings` | `client_id` → `server_id` per entity type |
| `gps_check_ins` | Append-only location log |

Add `client_id` + `version` columns to `daily_call_reports` and child tables.

---

## 14. Logging & debugging

Every push logs (structured):

```json
{
  "requestId": "...",
  "syncBatchId": "...",
  "compCode": "SYN",
  "empId": "1042",
  "module": "sync",
  "action": "push",
  "changeCount": 12,
  "appliedCount": 11,
  "errorCount": 1,
  "durationMs": 340
}
```

Support query: "Show all sync errors for empId X on date Y" using `syncBatchId`.

---

## 15. Testing requirements

| Test | Type |
|------|------|
| Push create DCR offline → sync → server row exists | Integration |
| Duplicate push same syncBatchId → idempotent | Integration |
| Duplicate clientId create → same serverId | Integration |
| Version conflict → error code + no corrupt data | Integration |
| Tenant A clientId on Tenant B token → 403 | Integration |
| 100 concurrent syncs load test | Load (Month 5) |
| 8-hour offline → batch push success | E2E mobile |

---

## 16. Phase rollout

| Phase | Scope |
|-------|-------|
| Month 3 | Push DCR + GPS; pull masters; bootstrap |
| Month 4 | Conflict UI; approval status pull; push retry |
| Month 5 | Load test; batch size tuning; PowerSync evaluation |
| Month 7+ | POB offline, expense draft (optional) |

---

*Version 1.0 — June 2026*
