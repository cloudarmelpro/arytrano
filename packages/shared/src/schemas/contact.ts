import { z } from 'zod'

/**
 * Contact reveal — mirror of `src/features/listings/schemas/contact.ts`.
 * Same channel enum so the mobile client's `Linking.openURL` switch is
 * exhaustive against the same union as the web.
 */

export const contactChannelSchema = z.enum(['WHATSAPP', 'PHONE'])
export type ContactChannel = z.infer<typeof contactChannelSchema>

export const contactRequestSchema = z.object({
  channel: contactChannelSchema,
})

export type ContactRequest = z.infer<typeof contactRequestSchema>

export const contactResponseSchema = z.object({
  channel: contactChannelSchema,
  phoneE164: z.string().regex(/^261\d{9}$/),
  ownerDisplayName: z.string(),
})

export type ContactResponse = z.infer<typeof contactResponseSchema>
