# Runbook — GDPR data processor agreements (SEC-24)

> Third-party providers that touch personal data must sign a Data
> Processing Agreement (DPA). This document tracks who's covered,
> what data they see, and where the DPA lives.
>
> **Owner** : Backend lead + Legal · **Cadence** : re-verify yearly
> or on provider swap.

## Processors on file

| Provider | Data seen | DPA status | Location |
|----------|-----------|-----------|----------|
| **Cloudflare** (WAF + R2) | IP address, TLS SNI, backup bytes (encrypted at rest by us — SEC-11 age-encrypt) | ✅ Signed 2026-03-14 — `dpa/cloudflare-2026-03.pdf` | R2 buckets in EU |
| **Cloudinary** (media) | Owner CIN scans (encrypted before upload — SEC-C1), listing photos, avatars | ✅ Signed 2026-04-02 — `dpa/cloudinary-2026-04.pdf` | EU + US CDN |
| **Twilio** (SMS OTP) | Phone number, OTP text | ✅ Signed 2026-04-05 — `dpa/twilio-2026-04.pdf` | US + EU depending on carrier |
| **Sentry** (errors) | scrubbed error context, ipHash, user id | ✅ Signed 2026-04-11 — `dpa/sentry-2026-04.pdf` | US or EU (self-selectable) |
| **Upstash** (Redis rate-limit) | ipHash keys, no PII | ✅ Signed 2026-04-15 — `dpa/upstash-2026-04.pdf` | AWS multi-region |
| **GoalPay** (payments) | Payer phone, amount, provider tx id | ✅ Signed 2026-05-20 — `dpa/goalpay-2026-05.pdf` | Madagascar |
| **Stadia Maps** (tiles) | Tile requests referrer, no PII | ✅ Included in ToS 2026-04 — no separate DPA needed | US |
| **Google reCAPTCHA v3** (TRU-17) | ipHash, cookies, user-agent | ✅ Signed via Google Workspace DPA — `dpa/google-2026-04.pdf` | US + EU |
| **Postmark** (transactional email) | Email address, opened/clicked tracking (COM-10 pending wiring) | ✅ Signed 2026-05-02 — `dpa/postmark-2026-05.pdf` | US (self-hosted EU option evaluated 2027) |
| **Expo Push Service** (mobile push) | Expo push token (opaque, not PII in itself) | ✅ Expo DPA public — `dpa/expo-2026-05.pdf` | US CDN |
| **Vercel** (hosting) | HTTP logs (scrubbed via SEC-13), session cookies passthrough | ✅ Signed 2026-04-20 — `dpa/vercel-2026-04.pdf` | EU deployment target |
| **web-push (VAPID browser push)** | Endpoint URL (points to browser vendor infra) | Direct browser vendor (Google FCM, Mozilla, Apple) — covered by user's OS agreement | N/A |

## Storage location

Signed DPAs live in the **legal/dpa/** folder inside the ops 1Password
vault. Copies pinned to physical printouts in the Fianarantsoa office
safe. The `dpa/*.pdf` filenames above are the 1Password references.

## Sub-processor tracking

Every processor above has its own list of sub-processors. We audit
those at renewal, focusing on:
- Data location changes (e.g. Cloudinary adding a new region)
- Ownership changes (acquisition)
- New sub-processors likely to see PII

The audit findings go into the same 1Password vault as
`legal/dpa/sub-processor-audits/YYYY-QN.pdf`.

## User-facing documentation

The list of processors visible to end users lives in
`/legal/privacy` on the site. Keep it in sync with this table when
adding or removing a processor.

## Data subject request workflow

Users can request data export (already implemented — DataExportSection)
or deletion (TRU-19 30-day grace window). Both are available via
/dashboard/settings without ops intervention.

For access requests specifically about a processor (e.g. "what does
Sentry know about me"), we forward the request to the processor's
own DPO with the user's ipHash + userId. Processors have 30 days to
respond per GDPR Art. 12.

## Related

- `logging.md` — what NOT to log (aligned with the processor list above)
- `cloudflare-waf.md` — Cloudflare-specific config
- `restore-db.md` — R2 backup path
