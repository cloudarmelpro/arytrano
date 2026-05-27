import 'server-only'
import { z } from 'zod'
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

export async function callInitiatePayment(
  body: GoalPayInitiateBody,
): Promise<GoalPayInitiateResponse> {
  // Full URL comes from env now (PAYMENT_GOALPAY_URL) — the path is
  // baked into the env value so renaming the endpoint is a single-var
  // change rather than touching code.
  const url = env.PAYMENT_GOALPAY_URL

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

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
    throw new GoalPayClientError(
      `GoalPay request failed: ${reason}`,
      0,
      '',
    )
  }
  clearTimeout(timer)

  const text = await res.text()

  if (!res.ok) {
    // Excerpt only — keep body out of full logs (may contain merchant
    // metadata). The status code + first ~200 chars is enough to
    // diagnose without leaking PII into telemetry.
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
