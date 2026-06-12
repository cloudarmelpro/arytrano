/**
 * T-002 — Client-safe barrel : Zod schemas + types only. The Prisma
 * services live behind `server.ts` per memory
 * `feedback_feature_index_client_safe`.
 */

export {
  requestPhoneOtpSchema,
  verifyPhoneOtpSchema,
  type RequestPhoneOtpInput,
  type VerifyPhoneOtpInput,
} from './schemas'

// Server Actions — surfaced here so the InterestLeadCta consumer
// stops deep-importing from ./actions/. Audit fix 2026-06-12.
export { requestPhoneOtpAction } from './actions/request-phone-otp'
export { verifyPhoneOtpAction } from './actions/verify-phone-otp'
