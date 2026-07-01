# Runbook — Payment retry policy (PAY-15)

> How AryTrano recovers from payments that stall between initiation
> and confirmation, without dropping money into a black hole.
>
> **Owner** : Backend lead · **Last reviewed** : 2026-07-01

## Failure modes we handle

| Symptom | Root cause | Recovery |
|---------|-----------|----------|
| Webhook never arrives | GoalPay outage / SSL failure / our endpoint 500'd once | `/api/cron/reconcile-payments` (see below) — refetches status |
| Webhook arrives, we 5xx it | Our DB was down / migration in progress | GoalPay retries up to 24h with exponential backoff |
| Webhook arrives with `payment.failed` | User closed the checkout, bank refused, timeout | Payment → FAILED, no retry |
| Payment stays INITIATED > 30 min | User abandoned the flow | Payment → EXPIRED via reconcile cron |
| Payment CONFIRMED but downstream side-effect crashed | Lease activation raised | Idempotent replay path in `apply-lease-payment-side-effect` re-runs on next webhook |

## Automated retries

- **Provider side** — GoalPay retries `payment.success` and `payment.failed`
  webhooks up to ~24h with backoff (30s / 1min / 5min / 15min / 1h / …).
  We return HTTP 200 even on idempotent replays so the retry storm stops.
- **Our side (reconciliation)** — `/api/cron/reconcile-payments` runs
  every 15 minutes and pulls the last-known status for every
  Payment that's still INITIATED / PENDING past its `expiresAt`.
  - If GoalPay says `success` → flip to CONFIRMED as if the webhook
    had arrived (same idempotent transition — see PAY-14 dedup).
  - If GoalPay says `failed / expired / canceled` → flip to that
    terminal state.
  - After 30 minutes past `expiresAt` with no resolution → mark
    EXPIRED and open a manual-review row.
- **Refund path** — if the downstream service (e.g. lease activation)
  fails AFTER a CONFIRMED payment, the payment is flipped to
  REFUND_PENDING and the PAY-09 admin queue handles the manual
  refund via GoalPay support.

## Retry cadence limits

The reconcile cron caps its per-run scan at 200 rows to protect
GoalPay's API from a flood after an incident. If more are stuck,
the next run picks up the tail.

Per-payment we NEVER retry more than 3 status pulls in a 24h window
(soft limit implemented in-service). Rows past that get manual
review — a payment that hasn't resolved after 3 checks and 24h is
almost always a legit stuck row that needs human eyes.

## Notification policy

- After 30 min stuck → nothing to the tenant (still their fault to
  finish the flow).
- After we flip to EXPIRED → email to tenant with a retry link if
  the underlying Lease is still PENDING_TENANT.
- After we flip to FAILED via a `payment.failed` webhook → email to
  tenant AND owner because the tenant may have retried on another
  device and it may still succeed.
- After REFUND_PENDING → owner sees the payment as "en attente de
  remboursement" and can act.

## Manual intervention

If the cron path can't resolve a payment (provider returns 500 on
every check, or the row is missing on the provider side), an admin
can:

1. Look up the row in `/admin/refunds` (for REFUND_PENDING) or
   `/admin/revenue` for a search.
2. Compare our `providerTxId` with the GoalPay dashboard.
3. If money moved but we're stuck INITIATED: flip via
   `prisma studio` update to CONFIRMED + note in AuditLog "manual
   override — see support ticket #".
4. If money DID NOT move: flip to FAILED with the same note.

## Sentry alerts

- Any 5xx from `record-webhook-event` fires a Sentry alert. On-call
  pages within 15 min.
- Reconcile cron logs are aggregated under `cron.reconcile-payments`
  in Sentry — a 5-run failure streak fires a warning.

## Related runbooks

- `payments-goalpay.md` — provider-specific dashboard + support
- `restore-db.md` — recovery when the payments table is inconsistent
- `disaster-recovery.md` — parent playbook
