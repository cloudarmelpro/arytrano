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
