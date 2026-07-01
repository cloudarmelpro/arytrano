## Runbook — Cloudflare WAF / rate limiting (SEC-09)

> Global anti-DDoS + bot protection. Runs at the CDN edge BEFORE our
> Next.js middleware — cheaper for us and shields upstream.
>
> **Owner** : Backend lead · **Last reviewed** : 2026-07-01

## Base configuration (always on)

| Setting | Value | Reason |
|---------|-------|--------|
| Bot Fight Mode | On | Free plan; blocks known bad bots |
| DDoS L7 | On (Sensitivity: High) | Free plan default |
| Browser Integrity Check | On | Rejects known malicious UAs |
| Challenge Passage | 30 min | Cookie TTL for solved challenges |
| Under Attack Mode toggle | Off (arm during incident) | 5-second-JS challenge on every request |
| SSL/TLS | Full (strict) | Enforce origin cert |
| Minimum TLS | 1.2 | Older versions have known issues |
| Automatic HTTPS Rewrites | On | Cleans stale HTTP links from user content |

## Rate-limiting rules (Cloudflare dashboard)

Configure under **Security → WAF → Rate limiting rules**. All rules
are per-IP with a 1-min window unless noted.

| Rule name | Match | Threshold | Action | Notes |
|-----------|-------|-----------|--------|-------|
| Global backstop | Any path | 600/min | Managed challenge | Prevents runaway scrapers |
| /api/* burst | Path starts with `/api/` | 120/min | Managed challenge | Complements our per-endpoint app limits |
| Sign-in flood | Path is `/sign-in` (POST) | 30/min | Block for 10 min | On top of app-level 10/5min |
| Sign-up flood | Path is `/sign-up` (POST) | 15/min | Block for 10 min | On top of app-level 5/1h |
| Lead form flood | Path is `/api/v1/leads` | 40/min | Managed challenge | Fallback for TRU-10 honeypot bypass |
| Webhooks | Path starts with `/api/webhooks/` | 60/min | Block | Only providers should hit these |
| Cron endpoints | Path starts with `/api/cron/` | 12/min | Block | Only Vercel's cron scheduler pulls these |
| Robots.txt / feeds | Path in {`/robots.txt`, `/sitemap.xml`} | 300/min | Managed challenge | Search engines exempt via User-Agent list below |

## Bypass lists

Some legitimate clients should bypass the WAF challenges.

- **Search engines** — `googlebot`, `bingbot`, `yandex`, `baiduspider`
  (verified by reverse DNS via Cloudflare's built-in list).
- **Uptime monitors** — Add `Uptime Robot` UA string to allowlist.
- **Payments** — `GoalPay` webhook User-Agent (once documented — as
  of 2026-06 it identifies as `Mozilla/5.0 goalpay-webhook`).
- **Sentry** — Server-to-server; no bypass needed.

## Incident : Under Attack Mode

If we see a genuine DDoS wave (Cloudflare Analytics graph pinning at
1M+ req/min), enable "Under Attack Mode":

1. Cloudflare dashboard → Overview → Enable "I'm Under Attack Mode".
2. Every visitor gets a 5-second JS challenge on the first request.
3. Watch the Firewall Events graph. When the wave dies down
   (~15 min post-enable is typical), disable.
4. Postmortem within 24h to identify the attack profile so we can
   codify the pattern in a permanent WAF rule.

## Emergency IP block

For a specific attacker IP hitting us hard :

```
Cloudflare dashboard → Security → WAF → Custom rules
Create rule :
  Name : Emergency block <YYYY-MM-DD>
  Field : IP source address
  Operator : equals
  Value : <ip>
  Action : Block
```

Also add the IP to our in-app `BlocklistEntry` table (TRU-11) so the
block survives a Cloudflare account issue.

## Related runbooks

- `incidents.md` — parent incident playbook
- `disaster-recovery.md` — larger scope
- `payment-retry-policy.md` — payment-specific abuse
