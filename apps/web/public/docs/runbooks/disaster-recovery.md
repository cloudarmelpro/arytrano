# Runbook — Disaster recovery (SEC-23)

> When something more than "the app is down" goes wrong : VPS gone,
> region outage, ransomware, accidental `DROP DATABASE`, R2 bucket
> deleted. This runbook is the parent playbook ; `restore-db.md`,
> `incidents.md`, and `contabo-deployment.md` are children.
>
> **Last reviewed** : 2026-06-29 · **Owner** : Backend lead ·
> **Test drill cadence** : every 6 months (recorded at the bottom).

---

## Targets

| Metric | Target | How we get there |
|--------|--------|-----------------|
| **RPO** (max data loss) | ≤ 24h | Daily encrypted backups at 02:00 UTC → R2 (SEC-11) |
| **RTO** (time to recover) | ≤ 4h | Pre-baked Contabo image + scripted `contabo-deployment.md` |
| **Backup geo-redundancy** | 2 regions | R2 auto-replicates ; monthly archives also pulled to op laptop |

If the platform misses these targets after an incident, that incident
becomes a P0 postmortem item (improve the runbook).

---

## Scenario index — pick your playbook

| Scenario | Severity | Playbook |
|----------|----------|----------|
| App down, DB up | SEV-1 | `incidents.md` (Phase 2) |
| DB corrupted / lost rows | SEV-1 | `restore-db.md` |
| **VPS dead / unreachable > 30 min** | SEV-1 | § A below |
| **Contabo region outage** | SEV-1 | § B below |
| **R2 bucket / backups gone** | SEV-1 | § C below |
| **Suspected ransomware / tampering** | SEV-1 | § D below |
| Cloudflare / DNS outage | SEV-1 | § E below |
| Stadia tiles outage | SEV-3 | static map fallback, no DR needed |
| Cloudinary outage | SEV-2 | § F below |

---

## A. VPS dead / unreachable

Symptoms : SSH timeouts, `/api/health` doesn't respond, UptimeRobot
alarms, Contabo control panel shows host in error state.

1. **Confirm it's the host, not the network**. Try another VPS in the
   same region. If only ours is down → host issue, proceed.
2. **Open a Contabo ticket** in parallel (their average response is
   30–90 min). Reference your VPS ID.
3. **Provision a fresh VPS** from the same Contabo image type and
   follow `contabo-deployment.md` from § 2 onward. Skip steps that
   were one-shot (DNS, certs) until the new IP is known.
4. **Re-point DNS** to the new IP via Cloudflare dashboard. TTL on
   the A record is 5 min by design — propagation completes inside
   one TTL window.
5. **Restore the DB** per `restore-db.md` (use the latest daily
   backup, bring the offline age identity).
6. **Re-pull secrets** from 1Password into `/etc/arytrano/app.env`.
7. **Boot** : `docker compose -f docker-compose.prod.yml up -d`.
8. **Smoke test** : `curl https://arytrano.com/api/health` →
   `{"ok": true}`. Sign in, open one listing, attempt one search.
9. **Post-mortem** : add the incident to `incidents.md` log and file
   the P0 follow-up tasks.

**Worst-case RTO** : 4h (45 min provision + 60 min config +
30 min DB restore + 30 min DNS + 60 min validation + buffer).

---

## B. Contabo region outage

Symptoms : multiple VPS in the same Contabo region fail at once ;
Contabo status page confirms a region issue.

There is **no automatic regional failover** today — we run a single
VPS in EU-Central (Nuremberg). Mitigation :

1. Surface the maintenance banner via the [Phase 3 of `incidents.md`](./incidents.md)
   so visitors know the site is intentionally down.
2. Wait for Contabo to recover (historical median : 2–4h).
3. If the outage exceeds 6h → execute § A but provision in a
   *different* Contabo region (EU-West or US-Central). DNS swap +
   DB restore as above.

**Post-launch ticket** : SEC-23 follow-up to deploy a second VPS in
a different region and run them active/passive. Until that ships,
we eat the regional outage risk in exchange for a flat fixed cost.

---

## C. R2 bucket / backups gone

Symptoms : `backup-db.sh` upload step fails repeatedly, Cloudflare R2
dashboard shows the bucket as deleted or our keys revoked, or daily
backups stop appearing in `r2:arytrano-backups/daily/`.

1. **Stop writes to R2** — pause the systemd timer so we don't
   keep failing in a loop : `systemctl stop arytrano-backup.timer`.
2. **Triage** :
   - Bucket present but creds revoked → reissue API token in
     Cloudflare dashboard, re-encrypt onto VPS, restart timer.
   - Bucket deleted by us (accident) → R2 retains deleted objects
     for 30 days in some plans ; check support before assuming
     they're gone.
   - Bucket deleted by Cloudflare → P0 incident, open ticket
     with Cloudflare + open Contabo restore (see § A) if any
     data loss happened in parallel.
3. **Always-available fallback** : the most recent monthly archive
   is also stored on the op laptop (`~/Backups/arytrano/` — see
   "Off-VPS copy" below). That gives us a ≤ 30-day-old recovery
   point even with R2 fully gone.
4. After recovery, **trigger a fresh backup immediately** and
   verify it lands in R2 before resuming normal ops.

**Off-VPS copy** : every monthly archive (`arytrano-YYYYMM.sql.gz.age`)
is downloaded by the operator on the 2nd of the month and stored on
an encrypted external drive. The drive is brought to the safe with
the age private key — same key, same physical box.

---

## D. Suspected ransomware / data tampering

Symptoms : unexplained schema changes, suspicious admin actions in
audit log, hosts asking for ransom, encrypted files appearing on the
VPS.

**Do NOT restore yet.** A restore over a compromised system replays
the attacker's foothold.

1. **Snapshot the VPS** via Contabo control panel (forensic copy).
2. **Open an incident** in `#ops` and call the security lead.
3. **Rotate all secrets** in parallel : Auth.js secret, GoalPay API
   key, Cloudinary signing secret, R2 API tokens, age recipient key
   (generate a new keypair, re-encrypt monthly archives offline).
4. **Provision a clean VPS** per § A. Do NOT reuse the compromised
   host's filesystem.
5. **Audit the backup** : confirm the backup file you restore from
   is older than the suspected compromise. Compare `User` row counts,
   inspect recent `AuditLog` rows for foreign IPs.
6. **Notify users** if PII (emails, phones, CIN) may have been
   exfiltrated — CNIL-Madagascar disclosure within 72h is the
   regulatory requirement.
7. **Postmortem within 5 days** — root cause + remediation tickets.

---

## E. Cloudflare / DNS outage

Symptoms : `arytrano.com` doesn't resolve, but the origin VPS is up.

1. Cloudflare global outages are usually short (< 1h). Status :
   <https://www.cloudflarestatus.com>.
2. **Emergency direct-IP access** : the VPS public IP is documented
   in 1Password. Admins can SSH and hit `https://<IP>` directly with
   `curl -H "Host: arytrano.com"` to confirm the app is healthy.
3. If the outage exceeds 2h, swap DNS to a backup provider
   (DNSimple / deSEC) using the same zone file. Backup zone file
   is stored in the team Drive as `dns/arytrano-zone-export.zone`.
4. Restore Cloudflare-only features (WAF, Bot Fight) once Cloudflare
   recovers.

---

## F. Cloudinary outage

Symptoms : images return 502s, video player blank.

1. The app already serves a SVG placeholder when `next/image` fails,
   so the site stays usable.
2. Wait for Cloudinary status to recover. They publish at
   <https://status.cloudinary.com>.
3. Long-term mitigation (post-launch) : evaluate Bunny.net as a
   secondary origin with mirror sync.

---

## Pre-flight checklist (run quarterly)

The DR plan rots silently if no one rehearses it. Every quarter the
backend lead :

- [ ] Verifies the offline age private key is readable (safe access)
- [ ] Verifies the laptop has a copy of the most recent monthly
      archive that decrypts cleanly (`age -d -i …` smoke test)
- [ ] Reviews the contact list in `Escalation` below — leavers,
      new on-call rotations
- [ ] Confirms the Contabo image type used in `contabo-deployment.md`
      is still available + priced as documented
- [ ] Logs the drill in `restore-drill-log.md` (existing log doubles
      as the DR drill log)

---

## Escalation contacts

| Role | Primary | Backup |
|------|---------|--------|
| Backend lead | (1Password) | (1Password) |
| Security | (1Password) | (1Password) |
| Contabo support | <https://contabo.com/en/support/> | ticket SLA 30-90 min |
| Cloudflare support | dashboard → Help | enterprise SLA n/a (free tier) |
| GoalPay support | <support@goalpay.mg> | hot-line in 1Password |

The 1Password vault `arytrano-dr` carries phone numbers + private
keys for everyone listed. Two senior admins have read access.

---

## Related runbooks

- `restore-db.md` — DB restore primitive
- `restore-drill-log.md` — quarterly drill log (SEC-11 + SEC-23)
- `contabo-deployment.md` — fresh VPS provisioning
- `incidents.md` — generic incident playbook (smaller scope)
- `monitoring.md` — what to watch + alert thresholds
