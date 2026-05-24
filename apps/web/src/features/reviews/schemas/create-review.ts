import { z } from 'zod'

export const createReviewSchema = z.object({
  listingId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
  rating: z.coerce
    .number()
    .int('Note entre 1 et 5')
    .min(1, 'Note entre 1 et 5')
    .max(5, 'Note entre 1 et 5'),
  body: z
    .string()
    .trim()
    .min(20, 'Au moins 20 caractères')
    .max(2000, '2000 caractères maximum'),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

export const respondToReviewSchema = z.object({
  reviewId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
  body: z
    .string()
    .trim()
    .min(10, 'Au moins 10 caractères')
    .max(1000, '1000 caractères maximum'),
})

export type RespondToReviewInput = z.infer<typeof respondToReviewSchema>

export const updateReviewSchema = z.object({
  reviewId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
  rating: z.coerce
    .number()
    .int('Note entre 1 et 5')
    .min(1, 'Note entre 1 et 5')
    .max(5, 'Note entre 1 et 5'),
  body: z
    .string()
    .trim()
    .min(20, 'Au moins 20 caractères')
    .max(2000, '2000 caractères maximum'),
})

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

export const deleteReviewSchema = z.object({
  reviewId: z.string().regex(/^[a-z0-9]{20,40}$/, 'ID invalide'),
})

export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>
