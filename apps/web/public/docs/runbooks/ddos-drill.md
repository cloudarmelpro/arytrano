# Runbook — DDoS drill (SEC-19)

> A twice-yearly staged attack to verify our WAF + rate-limits + on-call
> playbook survive contact with a real flood.
>
> **Owner** : Backend lead · **Cadence** : Q1 + Q3, first working
> Wednesday, 14:00 MG time.

## Objectives

1. **Cloudflare stops the flood.** WAF rules block > 95% of malicious
   requests before they hit our origin.
2. **Under Attack Mode activates in < 5 min** from detection.
3. **App remains reachable for legitimate visitors.** During Under
   Attack Mode the JS challenge lands in < 10s.
4. **On-call gets paged in < 3 min** after Sentry crosses the alert
   threshold.

## Prep (day before)

- [ ] Confirm the two on-call engineers are available.
- [ ] Warn concierge operators via #ops : "expect banner + brief 5xx
      spike around 14:00".
- [ ] Verify the Cloudflare dashboard bookmark is in the ops shared
      folder (some engineers rediscover it every drill).
- [ ] Pull `cloudflare-waf.md` runbook + `incidents.md` on the second
      monitor.

## Attack profile

We simulate three layers:

1. **L7 flood** — 5 000 req/min on `/api/v1/leads` from a single
   allow-listed IP (a Vercel test project or a k6 script from a
   throwaway VPS). Should be blocked at the WAF's per-IP burst rule
   before it reaches our origin.
2. **Slow-lorris** — 200 concurrent connections holding open POST
   sockets. Origin should shed them via Vercel's built-in timeout.
3. **UA flood** — 500 req/min with `python-requests/2.31` UA.
   Cloudflare Bot Fight Mode + our own SEC-13-scrubbed logs should
   catch this.

Use k6 or vegeta — small script templates live in `scripts/ddos-drill/`.

## Steps

1. **T-0** : Start the L7 flood from the test project.
2. **T+1min** : Watch the Cloudflare Analytics graph — verify the
   spike lands in the "Firewall Events" panel, not the "Requests"
   panel. If it hits Requests, our per-IP rule is misconfigured.
3. **T+3min** : Toggle Under Attack Mode from the Cloudflare dashboard.
   Verify a legitimate visitor sees the 5-second JS challenge and lands.
4. **T+5min** : Sentry cron threshold should have fired. Verify PagerDuty
   / on-call did receive the page.
5. **T+10min** : Stop the flood. Disable Under Attack Mode. Confirm
   the site returns to normal response times.
6. **T+15min** : Ship a 200-word status update in #ops with the
   observed vs. expected numbers.
7. **T+60min** : Postmortem doc — what we'd change for the next drill.

## Common failure modes

- **Bot Fight Mode challenges too many legit visitors** → tune the
  sensitivity setting down to Medium.
- **Vercel origin absorbs the spike anyway** → per-endpoint app-level
  rate limits (SEC-09) saved us; Cloudflare should have caught it,
  investigate the WAF rule wording.
- **Sentry alert too slow to fire** → tighten the 5xx spike alert
  threshold from 20/min to 10/min.

## Related runbooks

- `cloudflare-waf.md` — WAF config + Under Attack Mode
- `incidents.md` — incident playbook
- `logging.md` — where to grep for attack signatures post-drill
