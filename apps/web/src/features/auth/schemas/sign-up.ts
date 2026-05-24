import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Au moins 8 caractères')
    .max(128, '128 caractères maximum'),
  name: z.string().min(2, 'Au moins 2 caractères').max(80).optional(),
  role: z.enum(['STUDENT', 'OWNER']).default('STUDENT'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
