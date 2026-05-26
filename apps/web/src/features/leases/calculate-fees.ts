import {
  LEASE_SIGNATURE_FEE_MGA,
  CAUTION_COMMISSION_RATE,
  CAUTION_COMMISSION_CAP_MGA,
} from './config'

/**
 * Pure fee calculator — no DB, no IO. Used by both the wizard recap UI
 * and the `initiate-lease` service so the visible total matches the
 * actual charge to the rounding bit.
 *
 * Returns Int Ariary (memory `project_mga_no_subunit`). Caution
 * commission is `floor(caution × rate)` to avoid charging more than
 * the visible figure when the visitor sees a rounded percentage.
 *
 * Always re-validate inputs at the service boundary — this function
 * trusts what it receives and does no Zod parsing.
 */
export interface LeaseFees {
  /** Flat signature fee (currently 15 000 Ar). */
  signatureFeeMGA: number
  /** Commission on the caution (floored). */
  cautionCommissionMGA: number
  /** Sum: signatureFee + cautionCommission. */
  totalMGA: number
}

export function calculateLeaseFees(input: {
  cautionMGA: number
}): LeaseFees {
  if (!Number.isInteger(input.cautionMGA) || input.cautionMGA < 0) {
    throw new RangeError(`Invalid cautionMGA: ${input.cautionMGA}`)
  }

  const signatureFeeMGA = LEASE_SIGNATURE_FEE_MGA
  let cautionCommissionMGA = Math.floor(
    input.cautionMGA * CAUTION_COMMISSION_RATE,
  )
  if (
    CAUTION_COMMISSION_CAP_MGA !== null &&
    cautionCommissionMGA > CAUTION_COMMISSION_CAP_MGA
  ) {
    cautionCommissionMGA = CAUTION_COMMISSION_CAP_MGA
  }
  const totalMGA = signatureFeeMGA + cautionCommissionMGA
  return { signatureFeeMGA, cautionCommissionMGA, totalMGA }
}
