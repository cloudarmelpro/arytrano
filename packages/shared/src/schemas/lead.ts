import { z } from 'zod'

/**
 * E-T28 — public schemas for the concierge lead funnel. Used by both
 * the Next.js web action and the mobile client to keep the wire
 * contract honest at compile time.
 *
 * NOTE — server-side mirrors live in `apps/web/src/features/leads/
 * schemas/` ; they are the source of truth and stay slightly
 * richer (server-only output types). When the web schema gains a
 * field, mirror it here, then run typecheck on both apps.
 */

export const moveInWindowSchema = z.enum([
  'IMMEDIATE',
  'WITHIN_2_WEEKS',
  'WITHIN_1_MONTH',
  'LATER',
])
export type MoveInWindow = z.infer<typeof moveInWindowSchema>

export const leadSourceSchema = z.enum([
  'PUBLIC_FORM',
  'WHATSAPP',
  'OWNER_REFERRAL',
])
export type LeadSource = z.infer<typeof leadSourceSchema>

const cuid = z.string().regex(/^c[a-z0-9]{20,40}$/, 'Identifiant invalide')

export const createInterestLeadBodySchema = z.object({
  listingId: cuid,
  tenantName: z
    .string()
    .trim()
    .min(2, 'Au moins 2 caractères')
    .max(80, '80 caractères maximum'),
  // E.164 with +261 prefix preferred but we keep the same lenient
  // pattern as the web form (server normalises).
  tenantPhone: z
    .string()
    .trim()
    .min(8, 'Téléphone trop court')
    .max(20, 'Téléphone trop long'),
  budgetMonthlyMGA: z.coerce.number().int().nonnegative().max(100_000_000),
  budgetConfirmed: z.boolean(),
  moveInWindow: moveInWindowSchema,
  notes: z.string().trim().max(500).optional().nullable(),
  source: leadSourceSchema.optional().default('PUBLIC_FORM'),
})
export type CreateInterestLeadBody = z.infer<typeof createInterestLeadBodySchema>

/**
 * Outcome envelope. The web Server Action returns an
 * `kind: 'otp_required'` discriminator when the visitor isn't
 * signed in AND hasn't verified their phone recently — the mobile
 * client gates on the same value to swap the form for the OTP step.
 */
export const createInterestLeadResponseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('ok'),
    leadId: cuid,
  }),
  z.object({
    kind: z.literal('otp_required'),
  }),
])
export type CreateInterestLeadResponse = z.infer<
  typeof createInterestLeadResponseSchema
>
