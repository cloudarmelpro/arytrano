import { z } from 'zod'

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
