import { z } from 'zod'

/**
 * T-002 — Phone OTP Zod schemas. Shared between Server Action, REST
 * handler, and (later) mobile app.
 */

export const phoneE164Schema = z
  .string()
  .trim()
  .regex(/^\+\d{8,15}$/, 'Numéro invalide (format E.164, ex : +261341234567)')

export const requestPhoneOtpSchema = z.object({
  phoneE164: phoneE164Schema,
})
export type RequestPhoneOtpInput = z.infer<typeof requestPhoneOtpSchema>

// The OTP code is a 6-digit numeric string. Always validate the shape
// before passing to bcrypt.compare so a malformed input doesn't waste
// CPU on a hash compare.
export const verifyPhoneOtpSchema = z.object({
  phoneE164: phoneE164Schema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Le code doit avoir 6 chiffres.'),
})
export type VerifyPhoneOtpInput = z.infer<typeof verifyPhoneOtpSchema>
