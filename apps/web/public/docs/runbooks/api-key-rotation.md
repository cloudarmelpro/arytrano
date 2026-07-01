# Runbook — API key rotation (SEC-18)

> Quarterly hygiene + emergency rotation of every third-party API key
> AryTrano depends on. Never leave a leaked key unrotated: every hour
> a compromised key is live is another hour of billing risk.
>
> **Owner** : Backend lead · **Cadence** : quarterly (calendar
> reminders) · **Emergency** : within 1h of confirmed leak.

---

## Inventory

| Provider     | Env var(s)                                       | Rotation UI                                                             | Blast radius |
|--------------|--------------------------------------------------|-------------------------------------------------------------------------|--------------|
| **Cloudinary** | `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`   | Console → Settings → API Keys                                           | Photo + video uploads |
| **Twilio** | `TWILIO_ACCOUNT_SID` (immutable), `TWILIO_AUTH_TOKEN` | Console → Account → API keys & tokens                                   | Phone OTP SMS |
| **GoalPay**  | `GOALPAY_ACCESS_KEY`, `GOALPAY_WEBHOOK_SECRET`  | Contact <support@goalpay.mg> (no self-serve rotation as of 2026-06)     | All payments |
| **Cloudflare R2** | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `BACKUP_S3_*` | Cloudflare dashboard → R2 → Manage R2 API tokens                | Backups |
| **Stadia Maps** | `NEXT_PUBLIC_STADIA_API_KEY`                  | Client dashboard → API keys (referrer-scoped)                           | Map tiles |
| **Sentry**   | `SENTRY_AUTH_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`   | Sentry org → Settings → Auth Tokens (DSN via Project → Client Keys)     | Error tracking + source map upload |
| **Upstash Redis** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Console → Database → REST API → Reset                              | Rate limits |
| **web-push (VAPID)** | `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Regenerate with `npx web-push generate-vapid-keys`                | Owner push notifications |
| **Auth.js secret** | `AUTH_SECRET`                              | Regenerate with `openssl rand -base64 32`                                | ALL sessions (forces sign-out) |
| **PII encryption** | `PII_ENCRYPTION_KEY`                       | Rotate via key-version bump (never overwrite — decrypt fails on old rows) | Encrypted CIN + selfie |
| **Cron shared secret** | `CRON_SECRET`                          | Regenerate + update Vercel Crons                                          | Cron endpoints |
| **Email bounce webhook** | `EMAIL_BOUNCE_WEBHOOK_SECRET`         | Regenerate + update ESP subscription                                      | Bounce ingestion |

---

## Standard quarterly rotation

Runs on the first working day of each quarter, ~1h of focused work.

1. **Coordinate maintenance window** — post in #ops, warn concierge
   operators of possible 5-min disruption windows on their WhatsApp
   flow (Twilio + GoalPay rotations may briefly bounce inbound webhooks).
2. **Rotate one provider at a time.** Never batch — a broken key
   without an obvious trigger is a nightmare to debug.
3. For each provider:
   1. Log in with 1Password (never with a saved browser session).
   2. Generate the new key alongside the old one — most providers
      allow two live keys at once. GoalPay does NOT; coordinate a
      2-min hard cutover with them.
   3. Update the env var in Vercel (Production + Preview) and pull
      to any locally running dev machine.
   4. Deploy — smoke-test the affected flow (see the "Smoke test"
      column below).
   5. Revoke the old key once traffic has bled off.
4. **Rotate Auth.js secret last, on its own.** It signs out every
   user; do it during the lowest-traffic window (Sunday night MG time).
5. **Do NOT rotate `PII_ENCRYPTION_KEY` in-place.** See § "Envelope-encrypted PII" below.
6. **Log the rotation** in `runbooks/rotation-log.md` (create if not present) with timestamp + operator initials + which providers.

### Smoke tests

| Provider | Smoke test |
|----------|-----------|
| Cloudinary | Upload a fresh listing photo end-to-end |
| Twilio | Trigger a phone OTP on your own number; confirm delivery |
| GoalPay | Initiate a MGA 1 000 lease payment, verify webhook lands |
| R2 | Manual `rclone lsf r2:arytrano-backups/daily/ | head -1` |
| Stadia | Load `/annonces?view=map` — tiles render |
| Sentry | Trigger a test error, confirm it lands in the issue feed |
| Upstash | Hit `/api/health/rate-limit` (Sentry breadcrumb catches failures) |
| VAPID | Enable push on your account, contact one of your test listings |
| Auth.js | Sign in via credentials, confirm session works |
| PII | Upload a fresh CIN through the admin queue |
| Cron | Trigger `/api/cron/finalize-deletions` manually with the new bearer |

---

## Emergency rotation (confirmed leak)

Within 1h of confirmation:

1. Revoke the compromised key immediately in the provider console.
   Take the hit on any in-flight requests — availability < security.
2. Rotate all sibling keys under the same account for good measure.
3. Search the git history for the leaked value:
   `git log -S '<leaked-fragment>' --all`
4. If it landed in git, rewrite history (BFG or `git filter-branch`)
   AND force-push to every remote (yes, even public forks).
5. Open a P0 incident + write the postmortem within 5 days.

### Special case — `AUTH_SECRET` leak

1. Rotate immediately (all sessions invalidated).
2. Bump `User.tokenVersion` for every user so any REST bearer tokens
   minted before the leak are also revoked (see `lib/api/bearer.ts`).
3. Warn users via a banner explaining the forced sign-out.

### Special case — `PII_ENCRYPTION_KEY` leak

**Never overwrite in place.** The database contains rows encrypted
with the old key that would become unreadable.

1. Generate the new key and update env with `PII_ENCRYPTION_KEY_NEXT=<value>`.
2. Bump `cinKeyVersion` for new uploads to 2 (or next number).
3. Run a one-shot migration script that decrypts each row with the
   old key and re-encrypts with the new (see `scripts/rotate-pii-key.ts`,
   TODO — not yet written; write during the incident if it hits).
4. Once all rows are migrated, promote `PII_ENCRYPTION_KEY_NEXT` → `PII_ENCRYPTION_KEY`.
5. Verify with a small sample by reading through the admin CIN queue.

---

## Envelope-encrypted PII

For CIN + selfie ciphertext, the codebase already tags rows with
`cinKeyVersion` / `selfieKeyVersion`. The decryption path (see
`lib/auth/pii-encryption.ts`) can be extended to look up the
correct key per version, enabling zero-downtime rotation.

**Post-launch follow-up ticket** : wire multi-key decryption so a
`PII_ENCRYPTION_KEY` rotation is a config change rather than a data
migration. Track under SEC-18b.

---

## Related runbooks

- `restore-db.md` — DB restore
- `disaster-recovery.md` — larger scope: VPS + region + provider outages
- `incidents.md` — generic incident playbook
