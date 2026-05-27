/**
 * Alias for the canonical GoalPay webhook handler at
 * `/api/webhooks/goalpay/route.ts`.
 *
 * The GoalPay merchant dashboard is configured to POST to
 * `https://arytrano.com/webhook-gpay` (the short URL was registered
 * before our `/api/webhooks/*` architecture was finalised). Rather
 * than ask the merchant team to update the dashboard, we re-export
 * the GET/POST handlers from the canonical route so both URLs work.
 *
 * Architecture rule reminder : webhooks live under `/api/webhooks/`.
 * This alias exists for compatibility ; new integrations should
 * register against `/api/webhooks/<provider>`.
 *
 * `runtime` + `dynamic` are declared inline here (not re-exported)
 * because Next.js reads those module-level constants at build time —
 * `export { runtime } from '...'` doesn't always propagate cleanly.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export { GET, POST } from '@/app/api/webhooks/goalpay/route'
