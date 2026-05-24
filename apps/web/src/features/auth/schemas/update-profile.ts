import { z } from 'zod'

const phoneRegex = /^\+?[0-9 ()-]{7,20}$/

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Au moins 2 caractères').max(80).optional().or(z.literal('')).transform((v) => v ?? ''),
  phone: z
    .string()
    .regex(phoneRegex, 'Numéro invalide (chiffres, +, espaces, parenthèses)')
    .optional()
    .or(z.literal(''))
    .transform((v) => v ?? ''),
  locale: z.enum(['FR_MG', 'MG']).optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
