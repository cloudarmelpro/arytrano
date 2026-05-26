import { z } from 'zod'

/**
 * Input the owner fills in the lease wizard. Validated at the service
 * boundary AND at the REST handler boundary (same schema, no
 * duplication).
 */
export const initiateLeaseInputSchema = z.object({
  /** Listing the lease applies to. Must be owned by the calling user. */
  listingId: z
    .string()
    .min(1, 'listingId is required')
    .max(40, 'listingId too long'),

  /**
   * Tenant identification by email. Must match an EXISTING User account
   * — the lease wizard rejects unknown emails with a "demande à ton
   * locataire de créer un compte" message.
   */
  tenantEmail: z
    .string()
    .email()
    .toLowerCase()
    .max(254, 'tenantEmail too long'),

  // SEC-H2 audit fix — `monthlyRentMGA` is NOT part of the input schema.
  // It is derived server-side from `listing.priceMonthlyMGA` so an owner
  // can't fabricate a contract value that diverges from the public
  // listing. See `services/initiate-lease.ts`.

  /** First day of the lease. Must be today or in the future. */
  startDate: z.coerce.date().refine(
    (d) => d.getTime() >= startOfTodayUtc(),
    'startDate cannot be in the past',
  ),

  /**
   * Lease duration in months. 1-60 (5 years) covers typical Madagascar
   * student rentals (10-12 months) and longer-term contracts. Beyond 5
   * years, owners should renew — keeps the fee model honest.
   */
  durationMonths: z
    .number()
    .int()
    .positive()
    .max(60, 'durationMonths above 5 years not supported'),
})

export type InitiateLeaseInput = z.infer<typeof initiateLeaseInputSchema>

function startOfTodayUtc(): number {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}
