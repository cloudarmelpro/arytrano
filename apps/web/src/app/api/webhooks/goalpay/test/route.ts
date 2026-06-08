/**
 * GoalPay TEST mode webhook (S2-19 — Rule 8 canonical path).
 *
 * Sits under the convention `/api/webhooks/<provider>/...` instead of
 * the legacy `/api/goalpay/webhook/test` (which stays around as an
 * alias until the GoalPay dashboard config is migrated).
 *
 * Test mode caveat : GoalPay POSTs the webhook from THEIR server, so
 * the URL must be reachable from the public internet — `localhost`
 * won't work. Use ngrok to expose `localhost:3000` :
 *
 *   ngrok http 3000
 *   → copy the https URL it prints (e.g. https://abc123.ngrok.io)
 *   → paste https://abc123.ngrok.io/api/webhooks/goalpay/test in the
 *     GoalPay test dashboard webhook field
 *
 * The redirect URLs (`/test/success` etc.) don't need ngrok because
 * the browser follows them locally.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Audit P-M4 — gate the test alias behind NODE_ENV. In prod the
// canonical /api/webhooks/goalpay handles real GoalPay traffic; the
// `/test` alias must not be reachable as it would invite attackers
// to probe (HMAC still rejects forged bodies but each probe burns
// CPU + Sentry slot). The 404 returned to a prod caller looks
// indistinguishable from "endpoint doesn't exist".
import { NextResponse } from 'next/server'
import {
  GET as canonicalGet,
  POST as canonicalPost,
} from '../route'

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return canonicalGet()
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  return canonicalPost(request)
}
