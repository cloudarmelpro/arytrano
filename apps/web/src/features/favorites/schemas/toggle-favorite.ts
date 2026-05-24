import { z } from 'zod'

export const toggleFavoriteSchema = z.object({
  listingId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
})

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>
