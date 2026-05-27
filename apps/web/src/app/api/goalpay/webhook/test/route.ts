/**
 * GoalPay TEST mode webhook alias — points at the same canonical
 * handler at `/api/webhooks/goalpay/route.ts`.
 *
 * GoalPay test mode dashboard suggests `/api/goalpay/webhook/test`
 * as the webhook path. Rather than fork the handler (HMAC verify
 * logic stays identical), we re-export GET + POST.
 *
 * Test mode caveat : GoalPay POSTs the webhook from THEIR server,
 * so the URL must be reachable from the public internet — `localhost`
 * won't work. Use ngrok to expose `localhost:3000` :
 *
 *   ngrok http 3000
 *   → copy the https URL it prints (e.g. https://abc123.ngrok.io)
 *   → paste https://abc123.ngrok.io/api/goalpay/webhook/test in the
 *     GoalPay test dashboard webhook field
 *
 * The redirect URLs (`/test/success` etc.) don't need ngrok because
 * the browser follows them locally.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export { GET, POST } from '@/app/api/webhooks/goalpay/route'
