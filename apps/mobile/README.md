# Mobile — Synchem SFA (Phase 3)

React Native field app for MR offline DCR — **bare React Native** (no Expo).

Stack: RN 0.85, WatermelonDB + op-sqlite, react-native-keychain, geolocation-service.

See [docs/15-mobile-stack.md](../../docs/15-mobile-stack.md).

## Dev (API + Metro)

```bash
pnpm dev:api          # API on :3001 — Mac + iPhone same WiFi
pnpm dev:mobile       # Metro bundler
pnpm --filter @synchem-sfa/mobile ios   # iOS simulator
```

Physical device API URL: copy `.env.example` → `.env` and set `API_URL=http://<mac-lan-ip>:3001`.

## Install on your iPhone (USB)

**Requirements:** Full **Xcode** from App Store, USB cable, Apple ID (free dev account OK for 7-day installs).

1. Install Xcode → open once → accept license  
2. `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`  
3. iPhone: **Settings → Privacy & Security → Developer Mode** ON  
4. Connect iPhone, unlock, tap **Trust** this Mac  
5. From repo root:

```bash
pnpm mobile:ios:install
```

Or manually:

```bash
cd apps/mobile
pnpm ios:device
```

First build takes 10–20 minutes. Pick your iPhone when Xcode prompts for signing team (use your Apple ID).

## Test login

| Field | Value |
|-------|-------|
| User | `mr1` |
| Password | `Mr@123` |
| Company | `SYN` |

After login, set 4-digit MPIN once. DCR saves locally and syncs via **Sync Now** on dashboard.

## Native modules

| Feature | Package |
|---------|---------|
| Secure storage (tokens, MPIN) | `react-native-keychain` |
| GPS check-in | `react-native-geolocation-service` |
| Biometric unlock | `react-native-biometrics` |
| Offline SQLite | `@op-engineering/op-sqlite` + WatermelonDB |
| Push (pending) | FCM via `@react-native-firebase/messaging` — not wired yet |
