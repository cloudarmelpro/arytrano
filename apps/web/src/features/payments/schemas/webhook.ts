import { z } from 'zod'

/**
 * Zod schema for the GoalPay webhook payload.
 *
 * Per https://goalpay.pro/docs/api/integrations the payload shape is :
 *
 *   {
 *     "event": "payment.success" | "payment.failed" | "payment.canceled" | "payment.expired",
 *     "data": {
 *       "order_reference": "REF_...",
 *       "reference": "PAN_..." (echoed from our init request),
 *       "amount": 125000,
 *       "currency": "Ar",
 *       "description": "...",
 *       "error": "..." (optional, present on non-success events)
 *     }
 *   }
 *
 * We parse defensively: reject any payload that doesn't match exactly,
 * since GoalPay has no schema version negotiation. If they ever change
 * the shape, our webhook returns 400 rather than silently miscount.
 */
export const goalPayWebhookEventSchema = z.enum([
  'payment.success',
  'payment.failed',
  'payment.canceled',
  'payment.expired',
])

export const goalPayWebhookPayloadSchema = z.object({
  event: goalPayWebhookEventSchema,
  data: z.object({
    order_reference: z.string().min(1),
    reference: z.string().min(1),
    amount: z.number().int().nonnegative(),
    // Audit H3 fix — accept both `"Ar"` (current GoalPay output) and
    // `"MGA"` (ISO 4217 — defensive against a future provider change
    // that would otherwise reject ALL webhooks in silence and leak the
    // race window to the reconcile cron). Downstream `parseWebhook`
    // normalizes both to `'Ar'`.
    currency: z.union([z.literal('Ar'), z.literal('MGA')]),
    description: z.string(),
    error: z.string().optional(),
  }),
})

export type GoalPayWebhookPayload = z.infer<typeof goalPayWebhookPayloadSchema>
