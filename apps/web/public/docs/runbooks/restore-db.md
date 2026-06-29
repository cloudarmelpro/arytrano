# Runbook — DB restore

> When the production Postgres is corrupted, deleted, or you need to recover data from a past state.
>
> **Last reviewed** : 2026-06-29 · **Owner** : Backend lead

## SEC-11 — Backups are encrypted (age)

Since SEC-11 production backups are encrypted **client-side** with
[age](https://age-encryption.org) before upload to R2 — the encrypted
files have a `.age` suffix (e.g. `arytrano-20260629-020000.sql.gz.age`).

- **Public recipient** (used by `backup-db.sh`) lives in the systemd
  EnvFile as `BACKUP_AGE_RECIPIENT=age1…`. Anyone with read access
  to the VPS can encrypt new backups — that is fine, the public key
  is not a secret.
- **Private identity** (`age private key`, starts with `AGE-SECRET-KEY-1…`)
  is stored **offline** — printed on paper in the safe + on a YubiKey.
  It MUST NOT live on the production VPS, in any repo, or in any cloud
  storage. The operator brings it to the restore session.

For a restore, point `BACKUP_AGE_IDENTITY` at the key file before
running `restore-db.sh`. The script auto-detects the `.age` suffix and
pipes `age -d` between the download and `psql`.

---

## TL;DR

```bash
# 1. SSH into the VPS
ssh root@arytrano-prod

# 2. List recent backups
rclone lsf r2:arytrano-backups/daily/ | tail -10

# 3. Stop the app to prevent writes during restore
systemctl stop arytrano

# 4. Restore (REPLACE the database) — SEC-11: bring the age identity
export BACKUP_AGE_IDENTITY=/root/.config/age/arytrano.key
/opt/arytrano/scripts/restore-db.sh \
  arytrano-20260520-020000.sql.gz.age \
  "$DATABASE_URL" \
  --allow-prod

# 5. Smoke test
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM "User";'

# 6. Restart the app
systemctl start arytrano

# 7. Check /api/health
curl https://arytrano.com/api/health
```

---

## When to restore

Restore is a destructive operation — it **replaces** the current DB state. Use it only when:

| Scenario | Restore appropriate? |
|----------|---------------------|
| Whole DB corrupted / Postgres crashed | ✅ Yes |
| Accidental `DELETE` of users / listings | ✅ Yes, after careful diff |
| Migration gone wrong | ✅ Yes, restore + revert code |
| Single user reports their data is missing | ❌ No — investigate first, may not be backup-able |
| Performance is slow | ❌ No — that's not a restore problem |

---

## Pre-restore checklist

1. **Identify the target time**. What was the last known good state?
   - Daily backups : `daily/arytrano-YYYYMMDD-020000.sql.gz` (run at 02:00 UTC)
   - Monthly archives : `monthly/arytrano-YYYYMM.sql.gz` (first of month)
2. **Notify users** if downtime > 5 min. Banner on `/` or social post.
3. **Tell your team** in Slack #ops before pulling the trigger.
4. **Pull current state first** so you have a "now" snapshot in case you need to compare:
   ```bash
   /opt/arytrano/scripts/backup-db.sh
   ```

---

## Step-by-step

### 1. SSH into the production VPS

```bash
ssh root@arytrano-prod
```

> If SSH is broken, see `disaster-recovery.md` (VPS rebuild from snapshot).

### 2. Identify the backup file

List recent daily backups:
```bash
rclone lsf r2:arytrano-backups/daily/ | sort -r | head -10
```

Or browse monthly archives:
```bash
rclone lsf r2:arytrano-backups/monthly/
```

### 3. Stop the app (prevents writes during restore)

```bash
systemctl stop arytrano
```

The app container stops responding (returns 503 via Caddy). Users see "Maintenance" page.

### 4. Run the restore

```bash
/opt/arytrano/scripts/restore-db.sh \
  arytrano-20260520-020000.sql.gz \
  "$DATABASE_URL" \
  --allow-prod
```

The script:
- Downloads the backup from R2 storage
- Refuses to restore into "prod" target without `--allow-prod` (safety)
- Asks you to type `RESTORE PRODUCTION` to confirm
- Runs `psql` with `ON_ERROR_STOP` so any SQL error halts the restore

Expected duration : ~30s for a < 100MB dump.

### 5. Smoke-test the restored DB

```bash
# Row counts must match expectations
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM "User";'
psql "$DATABASE_URL" -c 'SELECT COUNT(*) FROM "Listing" WHERE status = '\''PUBLISHED'\'';'

# Most recent activity (should be near the backup time, not "now")
psql "$DATABASE_URL" -c 'SELECT MAX("createdAt") FROM "Listing";'
psql "$DATABASE_URL" -c 'SELECT MAX("createdAt") FROM "ContactEvent";'
```

If the row counts are surprisingly low → you may have restored the wrong backup, **stop and re-check**.

### 6. Restart the app

```bash
systemctl start arytrano
journalctl -u arytrano -f --since "1 minute ago"
```

Wait for the app to log `ready - started server on 0.0.0.0:3000` (or similar).

### 7. Verify via the public healthcheck

```bash
curl https://arytrano.com/api/health
```

Expected response:
```json
{ "ok": true, "db": "up", "lastBackupAgeHours": 0 }
```

`lastBackupAgeHours: 0` because step 5 above included a fresh pre-restore backup.

### 8. Communicate

- Update Slack #ops with the resolution time
- If users were affected (downtime > 5 min), post a brief status update on Facebook page
- Open a postmortem doc within 24h

---

## After-action

- **Update this runbook** if any step was unclear or missed
- **Schedule a quarterly chaos test** : run the restore script against a `arytrano_restore_test` DB once per quarter to verify the runbook still works
- **Review the root cause** : why did we need to restore? File a ticket if there's a recurring trigger

---

## Test restore (quarterly)

Provision a test DB on the same VPS:
```bash
sudo -u postgres createdb arytrano_restore_test
```

Run the restore against it (no `--allow-prod` needed since target name doesn't match prod pattern):
```bash
TEST_URL="postgresql://arytrano:dev@localhost:5432/arytrano_restore_test"
export BACKUP_AGE_IDENTITY=/root/.config/age/arytrano.key
/opt/arytrano/scripts/restore-db.sh arytrano-20260520-020000.sql.gz.age "$TEST_URL"
```

Verify:
```bash
psql "$TEST_URL" -c 'SELECT COUNT(*) FROM "User";'
```

Drop it after the test:
```bash
sudo -u postgres dropdb arytrano_restore_test
```

Log the result + date in `public/docs/runbooks/restore-drill-log.md`
(SEC-11). The drill MUST pass before any quarterly release.

---

## Escalation

| Severity | Contact |
|----------|---------|
| DB lost, restore failing | Backend lead immediately |
| Restore worked but app crashes | Backend + DevOps in #ops |
| Suspected data tampering / security incident | Stop, do NOT restore yet — call security review first |

---

## Related runbooks

- `disaster-recovery.md` — full VPS rebuild from snapshot
- `incident-response.md` — generic incident playbook
- `payment-reconciliation.md` — if payments need re-syncing post-restore
