/**
 * E-T26 — Lease success-fee configuration.
 *
 * These are PUBLIC business constants (visible on the /proprietaires
 * pricing page). Stored as code, not env, so a deploy misconfiguration
 * can't quietly debit a different amount than what the marketing page
 * promises.
 *
 * If the fee structure changes (e.g. promo period), edit here AND the
 * `/proprietaires` page i18n keys together. Historical Lease rows keep
 * their original `signatureFeeMGA` / `cautionCommissionMGA` (snapshot
 * at signing time) so audit + reconciliation are unaffected.
 */

/** Flat per-lease signature fee, in Ariary (Int — no subunit). */
export const LEASE_SIGNATURE_FEE_MGA = 15_000

/**
 * Commission on the caution, expressed as a fraction (0.08 = 8 %).
 * Applied to `cautionMGA` and floored to the nearest Ariary integer.
 * Set to `0` if you want to test signature-fee-only flows.
 */
export const CAUTION_COMMISSION_RATE = 0.08

/**
 * Cap on the caution commission (Ariary). Protects against eye-watering
 * fees on luxury rentals — Booking-style soft ceiling. Set to `null` to
 * disable the cap entirely. The marketing page math (~55k Ar example)
 * assumes no cap kicks in for typical Madagascar rentals.
 */
export const CAUTION_COMMISSION_CAP_MGA: number | null = null
