import { z } from 'zod'

/**
 * `kind: null` is the "remove my reaction" signal — clients use this when
 * the user toggles off their current reaction by clicking the same button
 * twice. Server-side `null` triggers a delete instead of an upsert.
 */
export const reactToReviewSchema = z.object({
  reviewId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
  kind: z.enum(['LIKE', 'DISLIKE']).nullable(),
})

export type ReactToReviewInput = z.infer<typeof reactToReviewSchema>
