import 'server-only'
import type {
  PaymentProvider,
  InitiatePaymentInput,
  InitiatePaymentResult,
  WebhookEvent,
} from '@/lib/payments/types'
import { env } from '@/lib/env'
import { callInitiatePayment } from './client'
import { verifyGoalPaySignature } from './signature'
import { goalPayWebhookPayloadSchema } from '../schemas/webhook'

/**
 * GoalPay implementation of the `PaymentProvider` interface. Pure
 * adapter — no business logic, no DB writes. Higher-level services
 * (initiate-payment, record-webhook-event) consume this.
 *
 * Key + secret are resolved from `env` at call-time. If a future
 * provider needs per-merchant keys we'll refactor to a factory.
 */
export const goalPayProvider: PaymentProvider = {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    if (!env.GOALPAY_ACCESS_KEY) {
      throw new Error('GOALPAY_ACCESS_KEY not configured')
    }
    // Defensive: GoalPay rejects non-integer amounts. We trust the Zod
    // schema at the service boundary but re-assert here so a misuse of
    // the adapter directly doesn't produce a Mobile Money debit with
    // weird subunits.
    if (!Number.isInteger(input.amountMGA) || input.amountMGA < 0) {
      throw new Error(`Invalid amountMGA: ${input.amountMGA}`)
    }

    const result = await callInitiatePayment({
      description: input.description,
      access: env.GOALPAY_ACCESS_KEY,
      reference: input.reference,
      amount: input.amountMGA,
      currency: 'Ar',
      metadata: input.metadata,
    })

    return {
      providerTxId: result.orderReference,
      checkoutUrl: result.checkoutUrl,
      expiresInMinutes: result.expiresInMinutes,
    }
  },

  verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    if (!env.GOALPAY_WEBHOOK_SECRET) {
      // Fail-closed: refuse the webhook if the secret isn't configured.
      // Never log the absence at info-level in a hot path — admin alert
      // via Sentry is appropriate at startup, not per-request.
      return false
    }
    return verifyGoalPaySignature(
      rawBody,
      signature,
      env.GOALPAY_WEBHOOK_SECRET,
    )
  },

  parseWebhook(rawBody: string): WebhookEvent {
    const parsed = JSON.parse(rawBody)
    const validated = goalPayWebhookPayloadSchema.parse(parsed)
    return {
      event: validated.event,
      orderReference: validated.data.order_reference,
      reference: validated.data.reference,
      amountMGA: validated.data.amount,
      // Audit H3 fix — normalize ISO `"MGA"` and GoalPay's `"Ar"` to a
      // single value, so downstream services (amount validators, audit
      // log, lease activation) don't need branching on provider quirks.
      currency: 'Ar',
      description: validated.data.description,
      error: validated.data.error,
    }
  },
}
