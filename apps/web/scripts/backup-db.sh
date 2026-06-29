#!/usr/bin/env bash
#
# AryTrano — Postgres backup script
#
# Runs `pg_dump` against the production DB, gzips the dump, uploads it
# to S3-compatible storage (Cloudflare R2 recommended), prunes old
# backups, and writes a freshness flag for the healthcheck endpoint.
#
# Designed for Contabo VPS deployment. Idempotent — safe to re-run.
# Exit code:
#   0  = backup completed and uploaded
#   1  = pg_dump failed
#   2  = upload failed
#   3  = environment misconfigured
#
# Required env (set in /etc/arytrano/backup.env or systemd EnvFile):
#   DATABASE_URL              Postgres connection string
#   BACKUP_S3_BUCKET          Bucket name (e.g. arytrano-backups)
#   BACKUP_S3_REMOTE          rclone remote name (e.g. r2 for Cloudflare R2)
#   BACKUP_FRESHNESS_FILE     Path to a file the app reads to check backup age
#                              Default: /var/lib/arytrano/last-backup.txt
#   BACKUP_RETENTION_DAYS     Daily backup retention (default 30)
#   BACKUP_ALERT_WEBHOOK      Optional Slack/Discord webhook URL for failures
#   BACKUP_AGE_RECIPIENT      SEC-11: age public key (e.g. age1xyz…). When
#                              set, the dump is encrypted client-side with
#                              `age -r $BACKUP_AGE_RECIPIENT` BEFORE upload
#                              and gets a `.age` suffix. The matching
#                              private identity file is stored offline and
#                              loaded by restore-db.sh via $BACKUP_AGE_IDENTITY.
#                              When unset, the dump is uploaded as plain
#                              gzipped SQL (transitional only — production
#                              MUST set this).
#
# Schedule (systemd timer or crontab):
#   0 2 * * *  /opt/arytrano/scripts/backup-db.sh

set -euo pipefail

# --- Config -----------------------------------------------------------
: "${DATABASE_URL:?DATABASE_URL not set}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET not set}"
: "${BACKUP_S3_REMOTE:?BACKUP_S3_REMOTE not set (e.g. \"r2\")}"
FRESHNESS_FILE="${BACKUP_FRESHNESS_FILE:-/var/lib/arytrano/last-backup.txt}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
ALERT_WEBHOOK="${BACKUP_ALERT_WEBHOOK:-}"
AGE_RECIPIENT="${BACKUP_AGE_RECIPIENT:-}"

TIMESTAMP="$(date -u +%Y%m%d-%H%M%S)"
# SEC-11 — when an age recipient is configured the file is encrypted
# client-side before upload, so it gets a `.age` extension. R2 also
# encrypts at rest, but server-side encryption alone is undone by
# any R2-credential leak; client-side encryption keeps the dump
# unreadable even with full bucket access.
if [ -n "$AGE_RECIPIENT" ]; then
  DUMP_NAME="arytrano-${TIMESTAMP}.sql.gz.age"
else
  DUMP_NAME="arytrano-${TIMESTAMP}.sql.gz"
fi
TMP_DUMP="/tmp/${DUMP_NAME}"

# --- Logging helpers --------------------------------------------------
log() { echo "[backup-db] $(date -u +%H:%M:%S) $*"; }

alert_failure() {
  local message="$1"
  log "FAILURE: $message"
  if [ -n "$ALERT_WEBHOOK" ]; then
    curl -fsS -X POST -H 'Content-Type: application/json' \
      -d "{\"text\":\"🔴 AryTrano backup failed: ${message}\"}" \
      "$ALERT_WEBHOOK" || true
  fi
}

# --- 1. pg_dump -------------------------------------------------------
log "Starting pg_dump → ${TMP_DUMP}"
if [ -n "$AGE_RECIPIENT" ]; then
  # pg_dump → gzip → age (encrypt). The `age` binary must be on PATH;
  # install via `apt install age` or download from filippo.io/age.
  if ! command -v age >/dev/null 2>&1; then
    alert_failure "BACKUP_AGE_RECIPIENT is set but \`age\` is not on PATH"
    exit 3
  fi
  if ! pg_dump --no-owner --no-acl --clean --if-exists "$DATABASE_URL" \
    | gzip --best \
    | age -r "$AGE_RECIPIENT" > "$TMP_DUMP"; then
    alert_failure "pg_dump | gzip | age failed"
    rm -f "$TMP_DUMP"
    exit 1
  fi
  log "Dump encrypted with age recipient ${AGE_RECIPIENT:0:16}…"
else
  log "⚠️  No BACKUP_AGE_RECIPIENT — uploading PLAINTEXT gzipped dump (dev only)"
  if ! pg_dump --no-owner --no-acl --clean --if-exists "$DATABASE_URL" \
    | gzip --best > "$TMP_DUMP"; then
    alert_failure "pg_dump failed"
    rm -f "$TMP_DUMP"
    exit 1
  fi
fi
SIZE_BYTES=$(stat -c%s "$TMP_DUMP")
log "Dump size: $(numfmt --to=iec "$SIZE_BYTES")"

# --- 2. Upload to S3-compatible storage -------------------------------
S3_PATH="${BACKUP_S3_REMOTE}:${BACKUP_S3_BUCKET}/daily/${DUMP_NAME}"
log "Uploading to ${S3_PATH}"
if ! rclone copyto "$TMP_DUMP" "$S3_PATH" --s3-no-check-bucket; then
  alert_failure "rclone upload failed"
  rm -f "$TMP_DUMP"
  exit 2
fi

# Also write a monthly archive (first day of each month) — long-term retention.
DAY_OF_MONTH=$(date -u +%d)
if [ "$DAY_OF_MONTH" = "01" ]; then
  if [ -n "$AGE_RECIPIENT" ]; then
    MONTHLY_NAME="arytrano-$(date -u +%Y%m).sql.gz.age"
  else
    MONTHLY_NAME="arytrano-$(date -u +%Y%m).sql.gz"
  fi
  MONTHLY_PATH="${BACKUP_S3_REMOTE}:${BACKUP_S3_BUCKET}/monthly/${MONTHLY_NAME}"
  log "Writing monthly archive: ${MONTHLY_PATH}"
  rclone copyto "$TMP_DUMP" "$MONTHLY_PATH" --s3-no-check-bucket || \
    log "WARNING: monthly archive upload failed (non-fatal)"
fi

# --- 3. Cleanup local temp file ---------------------------------------
rm -f "$TMP_DUMP"

# --- 4. Prune old daily backups (retention) ---------------------------
log "Pruning daily backups older than ${RETENTION_DAYS}d"
rclone delete "${BACKUP_S3_REMOTE}:${BACKUP_S3_BUCKET}/daily/" \
  --min-age "${RETENTION_DAYS}d" --s3-no-check-bucket || \
  log "WARNING: prune failed (non-fatal)"

# --- 5. Write freshness flag for /api/health --------------------------
mkdir -p "$(dirname "$FRESHNESS_FILE")"
date -u +%s > "$FRESHNESS_FILE"
log "Wrote freshness flag → ${FRESHNESS_FILE}"

log "✅ Backup complete: ${DUMP_NAME}"
