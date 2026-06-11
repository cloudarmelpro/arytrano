import 'server-only'

/**
 * T-002 — Server-only barrel for the phone-OTP feature. Anything that
 * touches Prisma / SMS / rate-limit lives behind this barrel.
 */

export {
  requestPhoneOtp,
  type RequestPhoneOtpOutcome,
} from './services/request-phone-otp'

export {
  verifyPhoneOtp,
  hasRecentlyVerifiedPhone,
  type VerifyPhoneOtpOutcome,
} from './services/verify-phone-otp'
