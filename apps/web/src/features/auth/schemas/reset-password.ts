import { z } from 'zod'

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Token invalide'),
  password: z.string().min(8, 'Au moins 8 caractères').max(128),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
