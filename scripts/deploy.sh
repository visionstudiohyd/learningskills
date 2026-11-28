#!/usr/bin/env bash
#
# Rebuild the cPanel / CloudLinux (Passenger) deployment from GitHub.
#
# Called detached by POST /api/deploy, which the GitHub Actions workflow runs
# after every push to main. The site keeps serving the previous build for the
# whole run; Passenger only picks up the new one when tmp/restart.txt is touched
# at the end.
#
# Progress is appended to .deploy/deploy.log and mirrored to .deploy/status.json,
# which GET /api/deploy returns (the CI job polls it).
#
# Manual run on the server, from anywhere:
#   bash ~/ilearningskills_app/scripts/deploy.sh

set -uo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_DIR="$APP_DIR/.deploy"
LOG_FILE="$STATE_DIR/deploy.log"
STATUS_FILE="$STATE_DIR/status.json"
LOCK_DIR="$STATE_DIR/lock"

REPO="${DEPLOY_REPO:-visionstudiohyd/learningskills}"
BRANCH="${DEPLOY_BRANCH:-main}"
# Below this, drop the previous .next before building (the account quota is 1 GB).
MIN_FREE_MB="${DEPLOY_MIN_FREE_MB:-120}"

NPM_BIN="${NPM_BIN:-npm}"

mkdir -p "$STATE_DIR"
exec >>"$LOG_FILE" 2>&1

echo
echo "=== deploy started $(date -u +%Y-%m-%dT%H:%M:%SZ) commit=${DEPLOY_COMMIT:-unknown} ==="
echo "app dir: $APP_DIR  source: $REPO@$BRANCH"

# One field per line, no quotes or newlines — keeps the JSON below valid.
json_escape() {
  printf '%s' "$1" | tr -d '\\"' | tr '\n\r\t' '   ' | cut -c1-400
}

set_status() { # state step message
  local state="$1" step="$2" message="${3:-}"
  local now started
  now="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  started="$now"

  if [ "$state" != "running" ] && [ -f "$STATUS_FILE" ]; then
    local prev_start
    prev_start=$(sed -n 's/.*"startedAt": "\([^"]*\)".*/\1/p' "$STATUS_FILE" | head -1)
    [ -n "$prev_start" ] && started="$prev_start"
  fi

  cat >"$STATUS_FILE.tmp" <<EOF
{
  "state": "$state",
  "step": "$step",
  "message": "$(json_escape "$message")",
  "commit": "$(json_escape "${DEPLOY_COMMIT:-}")",
  "startedAt": "$started",
  "updatedAt": "$now"
}
EOF
  mv -f "$STATUS_FILE.tmp" "$STATUS_FILE"
  echo "[$state] $step${message:+ — $message}"
}

fail() { # step message
  set_status failed "$1" "$2"
  echo "=== deploy failed: $2 ==="
  exit 1
}

# --- lock: overlapping runs would build the same directory concurrently -------

if [ -d "$LOCK_DIR" ]; then
  if [ -n "$(find "$LOCK_DIR" -maxdepth 0 -mmin +45 2>/dev/null)" ]; then
    echo "Removing stale lock (older than 45 minutes)."
    rm -rf "$LOCK_DIR"
  else
    echo "Another deploy is already running — nothing to do."
    exit 0
  fi
fi
mkdir "$LOCK_DIR" 2>/dev/null || fail lock "Could not create $LOCK_DIR"
trap 'rm -rf "$LOCK_DIR"' EXIT

# --- source -------------------------------------------------------------------

set_status running "downloading"
TARBALL="$(mktemp -t deploy-src-XXXXXX.tar.gz)" || fail download "mktemp failed"
if ! curl -fsSL --retry 3 --retry-delay 5 \
  "https://codeload.github.com/$REPO/tar.gz/refs/heads/$BRANCH" -o "$TARBALL"; then
  rm -f "$TARBALL"
  fail download "Could not download $REPO@$BRANCH"
fi

# Extract over the app in place: tracked files are replaced, everything ignored
# (.env*, .npmrc, node_modules, .next, public/uploads) is left alone because the
# tarball does not contain it.
set_status running "extracting"
if ! tar -xzf "$TARBALL" --strip-components=1 -C "$APP_DIR"; then
  rm -f "$TARBALL"
  fail extract "Could not extract the release archive"
fi
rm -f "$TARBALL"

# --- disk space ---------------------------------------------------------------

set_status running "freeing space"
rm -rf "$APP_DIR/.next/cache"
"$NPM_BIN" cache clean --force >/dev/null 2>&1 || true

FREE_MB=$(df -Pm "$APP_DIR" 2>/dev/null | awk 'NR==2 {print $4}')
echo "Free space: ${FREE_MB:-unknown} MB (threshold ${MIN_FREE_MB} MB)"
if [ -n "${FREE_MB:-}" ] && [ "$FREE_MB" -lt "$MIN_FREE_MB" ]; then
  echo "Low on space — removing the previous build before compiling."
  rm -rf "$APP_DIR/.next"
fi

# --- install & build ----------------------------------------------------------

set_status running "installing"
# --include=dev: Passenger starts this script with NODE_ENV=production, and npm
# then skips devDependencies — but the build needs them (tailwind, postcss).
if ! "$NPM_BIN" install --include=dev --no-audit --no-fund; then
  fail install "npm install failed"
fi

# Webpack, not Turbopack: the host's glibc is too old for the native SWC binary
# and Turbopack refuses the WASM fallback.
set_status running "building"
if ! "$NPM_BIN" run build -- --webpack; then
  fail build "npm run build failed"
fi

# --- cut over -----------------------------------------------------------------

set_status success "done" "Deployed $REPO@$BRANCH"

# Passenger re-reads this file and restarts the app on the next request.
mkdir -p "$APP_DIR/tmp"
touch "$APP_DIR/tmp/restart.txt"

echo "=== deploy finished $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
