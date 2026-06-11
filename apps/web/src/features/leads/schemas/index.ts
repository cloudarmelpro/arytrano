import { z } from 'zod'

/**
 * E-T28 — Concierge lead queue Zod schemas.
 *
 * Lives under `features/leads/schemas/` because the services + actions +
 * REST handlers all need it. T-RES-03 (later) will move the runtime
 * shapes to `packages/shared` so the mobile app can validate at the
 * client edge — for now web is the only consumer.
 *
 * Convention : schemas validate the EXTERNAL surface (URL params, form
 * fields, REST body). Services accept the parsed `z.infer<...>` type so
 * the contract is enforced once at the boundary.
 */

// E.164 normalized phone, Madagascar-first but diaspora-friendly.
// Decision (2026-06-10) : we accept +33/+1/etc. with OTP — flagged
// for analytics, not gated. The regex caps at 15 digits per E.164.
const phoneE164 = z
  .string()
  .trim()
  .regex(/^\+\d{8,15}$/, 'Numéro invalide (format E.164, ex : +261341234567)')

// Display name shown to the operator in the queue + WhatsApp template.
// Cap 60 chars to keep the queue table tidy; strip control chars to
// prevent CRLF injection into wa.me text (per memory
// `feedback_email_header_injection`).
const displayName = z
  .string()
  .trim()
  .min(2, 'Au moins 2 caractères')
  .max(60, '60 caractères maximum')
  .transform((s) => s.replace(/[\r\n\t]+/g, ' '))

// `cuid()` ids are alphanumeric, 25 chars typically. Pattern lifted from
// the existing listings schemas for consistency.
const cuid = z.string().regex(/^c[a-z0-9]{20,40}$/, 'Identifiant invalide')

export const moveInWindowSchema = z.enum([
  'THIS_MONTH',
  'NEXT_MONTH',
  'IN_2_MONTHS',
  'FLEXIBLE',
])

export const leadSourceSchema = z.enum(['WEB', 'MOBILE', 'REST'])

export const leadStatusSchema = z.enum([
  'NEW',
  'CLAIMED',
  'IN_DISCUSSION',
  'AWAITING_OWNER',
  'AWAITING_TENANT',
  'CONVERTED',
  'LAPSED',
  'REJECTED',
])

export const leadActivityTypeSchema = z.enum([
  'CREATED',
  'CLAIMED',
  'MESSAGED',
  'NO_RESPONSE_WARN',
  'CONVERTED',
  'LAPSED',
  'REASSIGNED',
  'REJECTED',
  'NOTE',
])

/**
 * Tenant-facing submission from the public detail page CTA. `tenantUserId`
 * is set server-side from the session if the visitor is signed in; the
 * service does NOT trust client-supplied tenantUserId.
 */
export const createInterestLeadSchema = z.object({
  listingId: cuid,
  tenantName: displayName,
  tenantPhone: phoneE164,
  moveInWindow: moveInWindowSchema,
  budgetConfirmed: z.boolean(),
})
export type CreateInterestLeadInput = z.infer<typeof createInterestLeadSchema>

/**
 * Operator clicks "Je claim" in /admin/leads. WIP cap enforced server-
 * side — the schema only validates the lead id.
 */
export const claimLeadSchema = z.object({
  leadId: cuid,
})
export type ClaimLeadInput = z.infer<typeof claimLeadSchema>

/**
 * Operator advances or rolls back the lead state. `note` is optional
 * because a pure status flip (e.g. AWAITING_OWNER → IN_DISCUSSION) may
 * not need a description. When provided, it lands in the LeadActivity
 * payload as `{note}`.
 *
 * `channel` is set when the operator logs an off-platform exchange
 * (whatsapp / phone) — required for MESSAGED transitions, optional for
 * the others.
 */
export const transitionLeadStatusSchema = z.object({
  leadId: cuid,
  nextStatus: leadStatusSchema,
  note: z
    .string()
    .trim()
    .max(2000, '2000 caractères maximum')
    .optional(),
  channel: z.enum(['whatsapp', 'phone', 'email', 'in-person']).optional(),
})
export type TransitionLeadStatusInput = z.infer<
  typeof transitionLeadStatusSchema
>

/**
 * Operator just converted a lead via the LeaseWizard deep-link. The
 * service stamps `leaseId` on the LeadRequest + transitions to
 * CONVERTED. Validation is light because the upstream `initiate-lease`
 * already verified the lease exists.
 */
export const linkLeadToLeaseSchema = z.object({
  leadId: cuid,
  leaseId: cuid,
})
export type LinkLeadToLeaseInput = z.infer<typeof linkLeadToLeaseSchema>
