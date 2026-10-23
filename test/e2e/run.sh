#!/usr/bin/env bash
# Usage: run.sh IMAGE EXPECTED_RELAY
# Starts IMAGE and runs the Playwright smoke test against it. Run `npm ci` first.
# Set EXPECT_NGINX=1 to also check this fork's nginx cache headers.
set -euo pipefail

IMAGE=${1:?usage: run.sh IMAGE EXPECTED_RELAY}
RELAY=${2:?usage: run.sh IMAGE EXPECTED_RELAY}
PLAYWRIGHT_IMAGE=mcr.microsoft.com/playwright:v1.64.1-noble@sha256:47b510dd9230bf0b9bfc9b20102241e577ea7a99334ab4c3ca19f19770e9b8ea

cd "$(dirname "$0")/../.."
NET="lm-smoke-$$"
APP="lm-smoke-app-$$"

cleanup() {
  docker rm -f "$APP" >/dev/null 2>&1 || true
  docker network rm "$NET" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker network create "$NET" >/dev/null
docker run -d --name "$APP" --network "$NET" --network-alias manager "$IMAGE" >/dev/null

docker run --rm --network "$NET" --ipc=host \
  -v "$PWD:/work:ro" -w /work \
  -e BASE_URL=http://manager:3001 \
  -e EXPECTED_RELAY="$RELAY" \
  -e EXPECT_NGINX="${EXPECT_NGINX:-0}" \
  "$PLAYWRIGHT_IMAGE" \
  npx playwright test -c test/e2e/playwright.config.ts
