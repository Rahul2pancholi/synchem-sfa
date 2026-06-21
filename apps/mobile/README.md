# Mobile — Synchem SFA (Phase 3)

React Native + Expo field app for MR offline DCR.

Stack: Expo SDK 56, WatermelonDB, TanStack Query (web parity later), Zustand, shared-i18n.

See [docs/15-mobile-stack.md](../../docs/15-mobile-stack.md).

## Dev

```bash
pnpm dev:api          # from repo root — API on :3000
pnpm dev:mobile       # Expo dev server
```

Physical device: set `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:3000`.

## Test login

| Field | Value |
|-------|-------|
| User | `mr1` |
| Password | `Mr@123` |
| Company | `SYN` |

After login, set 4-digit MPIN once. DCR saves locally and syncs via **Sync Now** on dashboard.
