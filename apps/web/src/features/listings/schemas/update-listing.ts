import { z } from 'zod'
import { createListingSchema } from './create-listing'

/**
 * Partial update — every field optional, but at least one must be provided.
 * Validated server-side; the action / API ensures `id` comes from URL params.
 */
export const updateListingSchema = createListingSchema.partial().refine(
  (obj) => Object.values(obj).some((v) => v !== undefined),
  { message: 'Aucune modification fournie' },
)

export type UpdateListingInput = z.infer<typeof updateListingSchema>
