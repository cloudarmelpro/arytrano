import { z } from 'zod'

export const contactChannelSchema = z.enum(['WHATSAPP', 'PHONE'])
export type ContactChannel = z.infer<typeof contactChannelSchema>

export const recordContactClickSchema = z.object({
  listingId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID listing invalide'),
  channel: contactChannelSchema,
})

export type RecordContactClickInput = z.infer<typeof recordContactClickSchema>
