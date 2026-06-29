#!/usr/bin/env bash
#
# AryTrano — Postgres restore script
#
# Restores a backup from S3-compatible storage into a TARGET database.
# By default refuses to restore into the production DB — you must
# explicitly pass `--allow-prod` to override (used during a real
# incident, never casually).
#
# Usage:
#   ./restore-db.sh <backup-filename> <target-database-url> [--allow-prod]
#
# Example:
#   ./restore-db.sh arytrano-20260520-020000.sql.gz \
#     "postgresql://arytrano:dev@localhost:5432/arytrano_restore_test"
#
# Required env:
#   BACKUP_S3_BUCKET, BACKUP_S3_REMOTE  (cf backup-db.sh)
#   BACKUP_AGE_IDENTITY                  SEC-11: path to the age private key
#                                        file. Required when restoring a
#                                        `.age` backup (auto-detected by
#                                        the file suffix). Store offline —
#                                        the operator brings it to the
#                                        restore session.
#
# Exit codes:
#   0  = restore completed
#   1  = download failed
#   2  = restore failed
#   3  = refused (production target without --allow-prod)
#   4  = misuse (bad args)

set -euo pipefail

# --- Args -------------------------------------------------------------
BACKUP_NAME="${1:-}"
TARGET_URL="${2:-}"
ALLOW_PROD_FLAG="${3:-}"

if [ -z "$BACKUP_NAME" ] || [ -z "$TARGET_URL" ]; then
  echo "Usage: $0 <backup-filename> <target-database-url> [--allow-prod]"
  echo
  echo "List available backups first:"
  echo "  rclone lsf ${BACKUP_S3_REMOTE:-r2}:${BACKUP_S3_BUCKET:-arytrano-backups}/daily/"
  exit 4
fi

: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET not set}"
: "${BACKUP_S3_REMOTE:?BACKUP_S3_REMOTE not set}"

log() { echo "[restore-db] $(date -u +%H:%M:%S) $*"; }

# --- Safety: prevent accidental production restore --------------------
# Heuristic: if the target URL contains "arytrano-prod" or "@prod" or
# the host matches a known prod pattern, require --allow-prod flag.
PROD_PATTERN='arytrano-prod|@prod\.|production\.'
if echo "$TARGET_URL" | grep -qE "$PROD_PATTERN"; then
  if [ "$ALLOW_PROD_FLAG" != "--allow-prod" ]; then
    echo "⛔ Target URL looks like production but --allow-prod was not passed."
    echo "   This safety check protects against accidental data loss."
    echo "   If you really want to restore into production, re-run with:"
    echo "     $0 $BACKUP_NAME \"$TARGET_URL\" --allow-prod"
    exit 3
  fi
  log "⚠️  PRODUCTION RESTORE — proceeding because --allow-prod was passed"
  read -p "Type 'RESTORE PRODUCTION' to confirm: " CONFIRM
  if [ "$CONFIRM" != "RESTORE PRODUCTION" ]; then
    echo "Aborted."
    exit 3
  fi
fi

# --- 1. Download from S3 ----------------------------------------------
S3_PATH="${BACKUP_S3_REMOTE}:${BACKUP_S3_BUCKET}/daily/${BACKUP_NAME}"
# Fall back to monthly archive folder if not found in daily/
if ! rclone lsjson "$S3_PATH" --s3-no-check-bucket >/dev/null 2>&1; then
  S3_PATH="${BACKUP_S3_REMOTE}:${BACKUP_S3_BUCKET}/monthly/${BACKUP_NAME}"
fi

TMP_DUMP="/tmp/${BACKUP_NAME}"
log "Downloading ${S3_PATH} → ${TMP_DUMP}"
if ! rclone copyto "$S3_PATH" "$TMP_DUMP" --s3-no-check-bucket; then
  echo "⛔ Download failed. Available backups:"
  rclone lsf "${BACKUP_S3_REMOTE}:${BACKUP_S3_BUCKET}/daily/" --s3-no-check-bucket | tail -10
  exit 1
fi
log "Downloaded $(stat -c%s "$TMP_DUMP" | numfmt --to=iec) of compressed dump"

# --- 2. Restore -------------------------------------------------------
# SEC-11 — auto-detect age-encrypted dumps by the `.age` suffix. The
# operator must have the matching identity file at $BACKUP_AGE_IDENTITY
# (offline-stored — bring it to the restore session, do NOT commit it).
log "Restoring into target DB"
if [[ "$BACKUP_NAME" == *.age ]]; then
  if ! command -v age >/dev/null 2>&1; then
    echo "⛔ Backup is age-encrypted but \`age\` is not on PATH."
    echo "   Install via \`apt install age\` or from filippo.io/age."
    exit 2
  fi
  if [ -z "${BACKUP_AGE_IDENTITY:-}" ] || [ ! -f "$BACKUP_AGE_IDENTITY" ]; then
    echo "⛔ Backup is age-encrypted but BACKUP_AGE_IDENTITY is not a file."
    echo "   Point it at the offline-stored age private key, e.g."
    echo "     BACKUP_AGE_IDENTITY=/root/.config/age/arytrano.key $0 …"
    exit 2
  fi
  if ! age -d -i "$BACKUP_AGE_IDENTITY" "$TMP_DUMP" \
    | gunzip -c \
    | psql "$TARGET_URL" --quiet --set ON_ERROR_STOP=on; then
    echo "⛔ age → gunzip → psql pipeline failed. Dump at ${TMP_DUMP} for inspection."
    exit 2
  fi
else
  if ! gunzip -c "$TMP_DUMP" | psql "$TARGET_URL" --quiet --set ON_ERROR_STOP=on; then
    echo "⛔ psql restore failed. Dump left at ${TMP_DUMP} for inspection."
    exit 2
  fi
fi

# --- 3. Cleanup -------------------------------------------------------
rm -f "$TMP_DUMP"

log "✅ Restore complete. Smoke-check the DB:"
log "  psql \"$TARGET_URL\" -c \"SELECT COUNT(*) FROM \\\"User\\\";\""
log "  psql \"$TARGET_URL\" -c \"SELECT MAX(\\\"createdAt\\\") FROM \\\"Listing\\\";\""
