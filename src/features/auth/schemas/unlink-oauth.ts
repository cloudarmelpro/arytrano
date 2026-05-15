import { z } from 'zod'

export const oauthProviderSchema = z.enum(['google', 'facebook'], {
  message: 'Provider OAuth non supporté',
})

export type OAuthProvider = z.infer<typeof oauthProviderSchema>
