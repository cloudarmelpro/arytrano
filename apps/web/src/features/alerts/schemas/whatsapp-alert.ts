import { z } from 'zod'

/**
 * Madagascar mobile phone validation + normalization.
 *
 * MG mobile numbers use the +261 country code, then a 9-digit national
 * number starting with `0` followed by `3` and the operator code:
 *   - 32, 37, 38, 39 → Telma
 *   - 33              → Orange
 *   - 34              → Airtel
 *
 * Common input formats we accept (everything else is rejected):
 *   "+261 32 12 345 67"
 *   "+261321234567"
 *   "0321234567"
 *   "0 32 12 345 67"
 *   "321234567"          (no leading zero — happens when the UI shows a
 *                          fixed "+261" prefix and the user types only
 *                          the local number)
 *
 * Output (E.164): "+2613XXXXXXXX" — strictly 13 characters.
 */
const ALLOWED_OPERATOR_PREFIXES = ['32', '33', '34', '37', '38', '39']

export function normalizeMgPhone(input: string): string | null {
  // Keep digits only — strip spaces, dashes, dots, parens, leading +.
  const digits = input.replace(/\D+/g, '')
  if (digits.length < 8) return null

  let local: string
  if (digits.startsWith('261')) {
    // International form +261XXXXXXXXX → keep last 9-10 chars.
    local = digits.slice(3)
  } else {
    local = digits
  }
  // Strip a leading "0" (national form 0XXXXXXXXX).
  if (local.startsWith('0')) local = local.slice(1)

  // After stripping, expect 9 digits starting with 3.
  if (local.length !== 9) return null
  if (!local.startsWith('3')) return null

  // Validate operator prefix (the "3X" pair).
  const operator = local.slice(0, 2)
  if (!ALLOWED_OPERATOR_PREFIXES.includes(operator)) return null

  return `+261${local}`
}

export const whatsappAlertSchema = z.object({
  phone: z
    .string()
    .min(1)
    .max(40)
    .transform((v, ctx) => {
      const normalized = normalizeMgPhone(v)
      if (!normalized) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'invalid_phone',
        })
        return z.NEVER
      }
      return normalized
    }),
  // Optional quartier filter — slug must look like a kebab-case neighborhood
  // identifier, no upper bound that would let a poisoned client send a 5KB
  // payload to bloat the DB.
  quartierSlug: z
    .string()
    .regex(/^[a-z0-9-]{2,40}$/)
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type WhatsAppAlertInput = z.infer<typeof whatsappAlertSchema>
