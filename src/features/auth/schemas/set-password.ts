import { z } from 'zod'

export const setPasswordSchema = z.object({
  password: z.string().min(8, 'Au moins 8 caractères').max(128),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(8, 'Au moins 8 caractères').max(128),
})

export type SetPasswordInput = z.infer<typeof setPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
