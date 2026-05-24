import { z } from 'zod'

export const loginAuthMethodSchema = z.enum([
  'CREDENTIALS',
  'GOOGLE',
  'FACEBOOK',
  'MAGIC_LINK',
  'MOBILE_JWT',
])

export const recordLoginInputSchema = z.object({
  userId: z.string().min(1),
  authMethod: loginAuthMethodSchema,
  isMobileApp: z.boolean().optional(),
})

export type RecordLoginPayload = z.infer<typeof recordLoginInputSchema>
