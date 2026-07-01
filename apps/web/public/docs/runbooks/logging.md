# Runbook — Structured logging (SEC-22)

> How AryTrano emits logs, how they're retained, and where to look
> when something breaks.
>
> **Owner** : Backend lead · **Last reviewed** : 2026-07-02

## Shape

Every log line MUST be JSON on a single line:

```json
{ "ts": "2026-07-02T09:00:12.345Z", "level": "info", "event": "payment.confirmed", "paymentId": "pay_abc", "amountMGA": 15000 }
```

Fields:

- `ts` — ISO-8601 UTC timestamp. Always set by the helper.
- `level` — `debug | info | warn | error` (syslog severity).
- `event` — snake_or.dot separator, short, greppable.
- Any additional fields are event-specific but must NOT include PII:
  no raw email, phone, or IP. Pass `ipHash` instead.

Use `import { log } from '@/lib/log'` and never `console.log` inside
new code. Existing `console.log` calls migrate opportunistically.

## Retention

| Environment | Storage | Retention | Access |
|-------------|---------|-----------|--------|
| Vercel Preview | Vercel Logs | 24h | Dashboard → deployments |
| Vercel Production | Vercel Logs | 3d free / 30d Pro | Dashboard |
| Contabo (docker) | `journald` | 90d (configured via `/etc/systemd/journald.conf`) | `journalctl -u arytrano` |

For > 30d retention on Vercel we ship to Axiom via their Vercel
integration (opt-in, cost extra).

## Alerting

Sentry is the primary alerter. The log stream is not directly
alerted on — grep for post-mortem, not for real-time paging.

Ops query patterns (Contabo):

```
# Every failed payment in the last hour
journalctl -u arytrano --since "1 hour ago" | grep '"event":"payment.failed"'

# Every 5xx from our /api/* handlers
journalctl -u arytrano --since "1 hour ago" | grep '"level":"error"' | grep '/api/'
```

## What NOT to log

- Raw email addresses (log the ID + call the Sentry PII scrubber if
  you need context).
- Raw phone numbers (hashed only).
- User IPs (hashed only; use `ipHash`).
- OAuth tokens or session tokens.
- CIN plaintext bytes.
- GoalPay access keys.
- Any HTTP `Authorization` header.

The scrub-pii helper (SEC-13) covers Sentry, not stdout logs. Be
disciplined at the call site.
