#!/usr/bin/env bash
#
# AryTrano — Backup freshness checker
#
# Reads the freshness flag written by backup-db.sh and alerts if the
# last successful backup is older than the threshold (default 26h).
#
# Runs separately from backup-db.sh — this catches the case where
# backup-db.sh never runs (cron broken, systemd timer disabled, VPS
# crashed before the cron fired). backup-db.sh's own failure alerts
# don't fire if it never runs.
#
# Schedule (e.g. systemd timer every 6h):
#   /opt/arytrano/scripts/check-backup-freshness.sh
#
# Required env:
#   BACKUP_FRESHNESS_FILE     Same file backup-db.sh writes to
#                              Default: /var/lib/arytrano/last-backup.txt
#   BACKUP_FRESHNESS_MAX_HOURS  Default: 26
#   BACKUP_ALERT_WEBHOOK      Slack/Discord webhook for alerts
#
# Exit codes:
#   0  = fresh
#   1  = stale (alert sent)
#   2  = freshness file missing (alert sent — first run is OK to suppress)

set -euo pipefail

FRESHNESS_FILE="${BACKUP_FRESHNESS_FILE:-/var/lib/arytrano/last-backup.txt}"
MAX_HOURS="${BACKUP_FRESHNESS_MAX_HOURS:-26}"
ALERT_WEBHOOK="${BACKUP_ALERT_WEBHOOK:-}"

alert() {
  local message="$1"
  echo "[check-backup] $message"
  if [ -n "$ALERT_WEBHOOK" ]; then
    curl -fsS -X POST -H 'Content-Type: application/json' \
      -d "{\"text\":\"🟠 AryTrano backup check: ${message}\"}" \
      "$ALERT_WEBHOOK" || true
  fi
}

if [ ! -f "$FRESHNESS_FILE" ]; then
  alert "Freshness file missing at ${FRESHNESS_FILE}. backup-db.sh has never run on this host."
  exit 2
fi

LAST_BACKUP_TS=$(cat "$FRESHNESS_FILE")
NOW=$(date -u +%s)
AGE_SECONDS=$(( NOW - LAST_BACKUP_TS ))
AGE_HOURS=$(( AGE_SECONDS / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_HOURS" ]; then
  alert "Last backup is ${AGE_HOURS}h old (threshold ${MAX_HOURS}h). Check the cron job."
  exit 1
fi

echo "[check-backup] OK — last backup ${AGE_HOURS}h ago"
