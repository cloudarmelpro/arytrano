/**
 * E-T26 (revised 2026-05-27) — Lease platform-fee configuration.
 *
 * SEC-L6 audit note — CLIENT-SAFE MODULE. Imported by `LeaseWizard.tsx`
 * (a Client Component) for the live fee preview AND by `LeaseTenantActions.tsx`
 * (also Client) for the tenant-side "pay 20% to accept" CTA. Do NOT
 * put secrets or server-only constants here — they would ship to the
 * client bundle. Server-only fee logic belongs in `services/` next
 * to the Prisma calls that consume it.
 *
 * Business model (post-2026-05-27 switch) :
 *   - The TENANT pays AryTrano a one-time platform fee at lease acceptance.
 *   - The fee = 20% of the monthly rent (PLATFORM_FEE_RATE × monthlyRentMGA, floored).
 *   - The OWNER pays AryTrano NOTHING. Rent + caution flow offline
 *     between tenant and owner (Mobile Money outside the platform).
 *
 * If the rate ever changes (promo, premium tier, regional split), edit
 * here AND the `/proprietaires` + `/comment-ca-marche` i18n pages
 * together. Historical Lease rows keep their original `platformFeeMGA`
 * (snapshot at signing time) so audit + reconciliation are unaffected.
 */

/**
 * Platform fee rate as a fraction of the monthly rent (0.20 = 20%).
 * Applied at lease acceptance, charged to the tenant via GoalPay.
 * Floored to the nearest Ariary integer.
 */
export const PLATFORM_FEE_RATE = 0.2

/**
 * Optional cap on the platform fee, in Ariary. Set to `null` to
 * disable. Useful if luxury rentals would produce a fee that scares
 * tenants away — Booking-style soft ceiling. Default null until we
 * see real data.
 */
export const PLATFORM_FEE_CAP_MGA: number | null = null
