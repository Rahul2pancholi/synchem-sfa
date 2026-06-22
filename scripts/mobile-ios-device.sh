#!/usr/bin/env bash
# Build Synchem SFA mobile app and install on connected iPhone (USB).
# Requires: full Xcode.app (not just Command Line Tools), iPhone trusted + Developer Mode on.

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MOBILE="$ROOT/apps/mobile"

if [[ ! -d "/Applications/Xcode.app" ]]; then
  echo "ERROR: Xcode.app not installed."
  echo "Install from App Store: https://apps.apple.com/app/xcode/id497799835"
  echo "Then run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

if ! xcode-select -p 2>/dev/null | grep -q "Xcode.app"; then
  echo "Switching xcode-select to Xcode.app (may need your password)..."
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
fi

LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
if [[ -n "$LAN_IP" ]]; then
  echo "API_URL=http://${LAN_IP}:3001" > "$MOBILE/.env"
  echo "API URL for phone: http://${LAN_IP}:3001"
else
  echo "WARN: Could not detect LAN IP — check apps/mobile/.env"
fi

echo "Ensure API is running: pnpm dev:api (port 3001)"
cd "$ROOT"
pnpm install

cd "$MOBILE"
if [[ ! -d ios ]]; then
  echo "ERROR: ios/ folder missing. Run from repo root: pnpm install && cd apps/mobile && pod install"
  exit 1
fi

echo "Connect iPhone via USB, unlock, trust this Mac, enable Developer Mode (Settings → Privacy)."
DEVICE_UDID="$(xcrun xctrace list devices 2>/dev/null | rg '\(([0-9A-Fa-f-]{25,})\)' -o | rg -o '[0-9A-Fa-f-]{25,}' | head -1 || true)"
if [[ -z "$DEVICE_UDID" ]]; then
  echo "ERROR: No physical iOS device found. Plug in iPhone, unlock, tap Trust."
  exit 1
fi
echo "Target device: $DEVICE_UDID"

if ! security find-identity -v -p codesigning 2>/dev/null | rg -q "Apple Development"; then
  echo ""
  echo "ERROR: No Apple Development certificate on this Mac."
  echo "  1) Open Xcode → Settings → Accounts → add your Apple ID"
  echo "  2) Open ios/SynchemSFA.xcworkspace → target SynchemSFA → Signing"
  echo "     → Team: your Personal Team → check 'Automatically manage signing'"
  echo "  3) Re-run: pnpm mobile:ios:install"
  open "$MOBILE/ios/SynchemSFA.xcworkspace" 2>/dev/null || true
  exit 1
fi

echo "Building and installing on device..."
pnpm ios:device --udid "$DEVICE_UDID"
