import { z } from 'zod'

/**
 * T-002 — public phone-OTP schemas shared by web + mobile. The
 * service-side schemas in `apps/web/src/features/phone-otp/schemas/`
 * are the source of truth ; this mirror only contains the request
 * and response shapes the mobile client needs.
 */

const phoneE164 = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Format E.164 attendu (ex. +261341234567)')

export const requestPhoneOtpBodySchema = z.object({
  phoneE164,
})
export type RequestPhoneOtpBody = z.infer<typeof requestPhoneOtpBodySchema>

export const requestPhoneOtpResponseSchema = z.object({
  expiresAt: z.coerce.date(),
  // True when an active OTP row was found and re-used instead of
  // generating a fresh code (rate-limit friendly UX).
  resent: z.boolean(),
})
export type RequestPhoneOtpResponse = z.infer<
  typeof requestPhoneOtpResponseSchema
>

export const verifyPhoneOtpBodySchema = z.object({
  phoneE164,
  code: z.string().trim().regex(/^\d{6}$/, 'Code à 6 chiffres'),
})
export type VerifyPhoneOtpBody = z.infer<typeof verifyPhoneOtpBodySchema>

export const verifyPhoneOtpResponseSchema = z.object({
  verified: z.literal(true),
})
export type VerifyPhoneOtpResponse = z.infer<
  typeof verifyPhoneOtpResponseSchema
>
