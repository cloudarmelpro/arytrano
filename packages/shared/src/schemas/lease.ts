import { z } from 'zod'

/**
 * Lease shapes shared between `apps/web` and `apps/mobile`.
 * Mirror the web's `features/leases/schemas/*` + the route handler
 * projections so the mobile client parses identical JSON to the web
 * Server Action result.
 *
 * Side-effect free : no `'server-only'`, no Prisma — pure TS + Zod.
 */

export const leaseStatusSchema = z.enum([
  'DRAFT',
  'PENDING_TENANT',
  'ACTIVE',
  'REFUSED',
  'TERMINATED',
  'DISPUTED',
])
export type LeaseStatus = z.infer<typeof leaseStatusSchema>

/**
 * Row shape returned by `GET /api/v1/leases` (list mine — owner OR tenant).
 * Strict subset of what the web `listUserLeases` projection returns —
 * mobile shows a compact card with status badge + counterpart name.
 */
export const leaseRowSchema = z.object({
  id: z.string(),
  status: leaseStatusSchema,
  monthlyRentMGA: z.number().int().nonnegative(),
  cautionMGA: z.number().int().nonnegative(),
  startDate: z.string().datetime(),
  durationMonths: z.number().int().positive(),
  ownerSignedAt: z.string().datetime().nullable(),
  tenantSignedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  listing: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
  }),
  owner: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }),
  tenant: z.object({
    id: z.string(),
    name: z.string().nullable(),
  }),
})
export type LeaseRow = z.infer<typeof leaseRowSchema>

/**
 * Detail returned by `GET /api/v1/leases/[id]`. Includes the contact
 * email of the counterpart (mobile shows it once the lease is in
 * PENDING_TENANT / ACTIVE — same privacy gate as the web detail page).
 */
export const leaseDetailSchema = leaseRowSchema.extend({
  signatureFeeMGA: z.number().int().nonnegative(),
  cautionCommissionMGA: z.number().int().nonnegative(),
  owner: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
  }),
  tenant: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().email(),
  }),
})
export type LeaseDetail = z.infer<typeof leaseDetailSchema>

/**
 * Refuse body. Reason is optional; capped at 500 chars to mirror the
 * server schema. Server scrubs C0 control chars before persisting to
 * JSONB so we don't need to sanitize here — the mobile UI just
 * collects the text.
 */
export const refuseLeaseBodySchema = z.object({
  reason: z.string().max(500).optional(),
})
export type RefuseLeaseBody = z.infer<typeof refuseLeaseBodySchema>
