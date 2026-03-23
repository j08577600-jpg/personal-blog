#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-https://blog.chenjilan.com}"
UPSTREAM_URL="${UPSTREAM_URL:-http://127.0.0.1:8080}"
SERVICE_NAME="${SERVICE_NAME:-personal-blog}"

info() {
  printf '\n==> %s\n' "$1"
}

info "Lint"
npm run lint

info "Build"
npm run build

info "Upstream health"
curl -fsSI --max-time 10 "$UPSTREAM_URL"

info "Public site health"
curl -kfsSI --max-time 10 "$APP_URL"

if command -v systemctl >/dev/null 2>&1; then
  info "systemd status"
  systemctl is-active "$SERVICE_NAME"
  systemctl --no-pager --full status "$SERVICE_NAME" | sed -n '1,40p'
else
  info "systemctl not found, skip service status"
fi

info "Release preflight passed"
