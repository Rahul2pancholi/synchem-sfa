# Prisma Schema v1 — Draft

PostgreSQL schema for **Phase 0–2** (foundation + core masters + sync).

> Moves to `apps/api/prisma/` when monorepo is scaffolded.  
> **Related:** [04-data-model-entities.md](../docs/04-data-model-entities.md) · [20-OFFLINE-SYNC-PROTOCOL.md](../docs/20-OFFLINE-SYNC-PROTOCOL.md)

## Conventions

- Table names: `snake_case` plural
- Tenant column: `comp_code` on every business table
- PK: UUID (`@default(uuid())`)
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)
- Optimistic lock: `version` on transactional entities

## Apply (when API exists)

```bash
pnpm prisma migrate dev --name init
pnpm prisma db seed
```
