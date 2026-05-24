import { z } from 'zod'

export const suspendListingSchema = z.object({
  listingId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID listing invalide'),
  reason: z
    .string()
    .trim()
    .min(5, 'Raison trop courte (5 caractères min.)')
    .max(500, 'Raison trop longue (500 caractères max.)'),
})

export type SuspendListingInput = z.infer<typeof suspendListingSchema>
