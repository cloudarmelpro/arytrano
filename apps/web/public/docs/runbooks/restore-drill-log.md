# Runbook — Restore drill log (SEC-11)

> Append-only log of quarterly restore drills. Each entry confirms that
> the encrypted backup pipeline (backup → R2 → download → age decrypt →
> psql restore) still works **before** an incident forces us to use it.
>
> **Owner** : Backend lead · **Cadence** : every 3 months, no exceptions.

## How to run a drill

1. Provision a throwaway DB on the VPS (or on a dev box):
   ```bash
   sudo -u postgres createdb arytrano_restore_drill
   TEST_URL="postgresql://arytrano:dev@localhost:5432/arytrano_restore_drill"
   ```
2. Pick the most recent encrypted daily backup:
   ```bash
   LATEST=$(rclone lsf r2:arytrano-backups/daily/ | grep '\.age$' | sort -r | head -1)
   ```
3. Bring the offline age identity (from the safe / YubiKey) onto the
   restore host as a temp file, e.g. `/root/.config/age/arytrano.key`,
   then export it:
   ```bash
   export BACKUP_AGE_IDENTITY=/root/.config/age/arytrano.key
   ```
4. Run the restore:
   ```bash
   /opt/arytrano/scripts/restore-db.sh "$LATEST" "$TEST_URL"
   ```
5. Smoke-check :
   ```bash
   psql "$TEST_URL" -c 'SELECT COUNT(*) FROM "User";'
   psql "$TEST_URL" -c 'SELECT MAX("createdAt") FROM "Listing";'
   ```
6. Drop the drill DB :
   ```bash
   sudo -u postgres dropdb arytrano_restore_drill
   ```
7. **Shred** the age identity copy you brought to the host:
   `shred -u /root/.config/age/arytrano.key` — the canonical copy stays
   offline.
8. Append a row to the log below.

## Drill log

| Date | Operator | Backup used | DB rows OK? | Decrypt OK? | Notes |
|------|----------|-------------|-------------|-------------|-------|
| _(no drill yet — first one due before T+90d of SEC-11 ship)_ | | | | | |
