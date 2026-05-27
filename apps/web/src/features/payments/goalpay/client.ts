import 'server-only'
import { z } from 'zod'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

/**
 * HTTP client for the GoalPay merchant API.
 *
 * Surface (verified 2026-05-25 on https://goalpay.pro/docs/api/integrations) :
 *
 *   POST {PAYMENT_GOALPAY_URL}
 *
 * Default URL : https://api.goalpay.pro/api/payement/service
 *
 * Auth is via a body field (`access`), NOT a header. The key starts
 * with `TGP_` and is server-only — never expose to the browser.
 *
 * No retry on 4xx (validation errors are deterministic). On 5xx we
 * surface a typed error so the caller can decide whether to retry or
 * fail the user flow.
 *
 * Timeout: 30s. GoalPay docs don't specify SLA but typical Mobile Money
 * orchestration completes in 1-3s; 30s catches degraded conditions.
 */

const TIMEOUT_MS = 30_000

const initiateResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    checkout_url: z.string().url(),
    expires_in_minutes: z.number().int().positive(),
    order_reference: z.string().min(1),
  }),
})

export class GoalPayClientError extends Error {
  readonly status: number
  readonly bodyExcerpt: string
  constructor(message: string, status: number, bodyExcerpt: string) {
    super(message)
    this.name = 'GoalPayClientError'
    this.status = status
    this.bodyExcerpt = bodyExcerpt
  }
}

export interface GoalPayInitiateBody {
  description: string
  /**
   * Merchant access token. Resolved from env by the provider;
   * client.ts itself accepts it as a param so unit tests can pass a
   * fake token without mutating the global env.
   */
  access: string
  reference: string
  amount: number
  currency: 'Ar'
  metadata: ReadonlyArray<{ label: string; unit_price: number; quantity: number }>
}

export interface GoalPayInitiateResponse {
  checkoutUrl: string
  expiresInMinutes: number
  orderReference: string
}

/** Strip the access field before logging — never let the merchant
 *  key flow into stdout/Sentry breadcrumbs. */
function sanitizeBodyForLogs(body: GoalPayInitiateBody) {
  return {
    ...body,
    access: body.access
      ? `${body.access.slice(0, 6)}…(redacted, ${body.access.length} chars)`
      : '(empty)',
  }
}

export async function callInitiatePayment(
  body: GoalPayInitiateBody,
): Promise<GoalPayInitiateResponse> {
  // Full URL comes from env now (PAYMENT_GOALPAY_URL) — the path is
  // baked into the env value so renaming the endpoint is a single-var
  // change rather than touching code.
  const url = env.PAYMENT_GOALPAY_URL

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  // Dev-only echo so a 500 from GoalPay can be diagnosed by reading
  // the local terminal — what we actually sent. Access key is
  // redacted. NEVER enabled in production (PII + key leak risk).
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[goalpay] POST', url, sanitizeBodyForLogs(body))
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    const reason = err instanceof Error ? err.message : 'unknown'
    Sentry.captureException(err, {
      tags: { provider: 'goalpay', stage: 'fetch' },
      extra: { url, reason },
    })
    throw new GoalPayClientError(
      `GoalPay request failed: ${reason}`,
      0,
      '',
    )
  }
  clearTimeout(timer)

  const text = await res.text()

  if (!res.ok) {
    // Dev terminal echo + Sentry breadcrumb. The body excerpt may
    // contain a French error message from GoalPay (no PII — we don't
    // send payer phone in the initiate request) ; safe to attach.
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        '[goalpay] non-2xx',
        res.status,
        text.slice(0, 500),
      )
    }
    Sentry.captureMessage('GoalPay initiate returned non-2xx', {
      level: res.status >= 500 ? 'error' : 'warning',
      tags: {
        provider: 'goalpay',
        stage: 'initiate-response',
        status: String(res.status),
      },
      extra: {
        bodyExcerpt: text.slice(0, 500),
        sentBody: sanitizeBodyForLogs(body),
      },
    })
    throw new GoalPayClientError(
      `GoalPay returned ${res.status}`,
      res.status,
      text.slice(0, 200),
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new GoalPayClientError(
      'GoalPay returned non-JSON body',
      res.status,
      text.slice(0, 200),
    )
  }

  const result = initiateResponseSchema.safeParse(parsed)
  if (!result.success) {
    throw new GoalPayClientError(
      'GoalPay response did not match expected schema',
      res.status,
      text.slice(0, 200),
    )
  }

  return {
    checkoutUrl: result.data.data.checkout_url,
    expiresInMinutes: result.data.data.expires_in_minutes,
    orderReference: result.data.data.order_reference,
  }
}
