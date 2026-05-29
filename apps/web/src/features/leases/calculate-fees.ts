import { PLATFORM_FEE_RATE, PLATFORM_FEE_CAP_MGA } from './config'

/**
 * Pure platform-fee calculator — no DB, no IO. Used by :
 *   - The owner wizard (`LeaseWizard.tsx`) to preview what the tenant
 *     will pay BEFORE the lease is created — owner sees this as a
 *     transparency / explainer block.
 *   - The tenant action component (`LeaseTenantActions.tsx`) to show
 *     the exact amount on the "Accepter et payer" CTA.
 *   - The `initiate-lease` service to snapshot `platformFeeMGA` on
 *     the Lease row at creation time.
 *   - The `tenant-initiate-payment` service to send the right amount
 *     to GoalPay at the tenant-acceptance step.
 *
 * Returns Int Ariary (memory `project_mga_no_subunit`). The fee is
 * `floor(monthlyRent × rate)` to avoid charging more than the visible
 * rounded percentage. If a CAP is configured and exceeded, the cap
 * wins.
 *
 * Always re-validate inputs at the service boundary — this function
 * trusts what it receives and does no Zod parsing.
 */
export interface PlatformFee {
  /** Platform fee charged to the TENANT at lease acceptance. */
  platformFeeMGA: number
}

export function calculatePlatformFee(input: {
  monthlyRentMGA: number
}): PlatformFee {
  if (!Number.isInteger(input.monthlyRentMGA) || input.monthlyRentMGA < 0) {
    throw new RangeError(
      `Invalid monthlyRentMGA: ${input.monthlyRentMGA}`,
    )
  }

  let platformFeeMGA = Math.floor(input.monthlyRentMGA * PLATFORM_FEE_RATE)
  if (
    PLATFORM_FEE_CAP_MGA !== null &&
    platformFeeMGA > PLATFORM_FEE_CAP_MGA
  ) {
    platformFeeMGA = PLATFORM_FEE_CAP_MGA
  }
  return { platformFeeMGA }
}
