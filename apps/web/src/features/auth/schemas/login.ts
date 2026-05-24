import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  // 2FA step-2 code: 6-digit TOTP OR XXXX-XXXX recovery (9 chars).
  // Optional at schema level — `authenticateWithPassword` decides whether
  // the user actually needs to provide one based on totpEnabledAt.
  totpCode: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export type LoginInput = z.infer<typeof loginSchema>
