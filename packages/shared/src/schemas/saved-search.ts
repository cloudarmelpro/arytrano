import { z } from 'zod'
import { listingTypeSchema } from './listing'

/**
 * Saved-search filter shape — subset of `/annonces` query params the
 * user opted to save. Mirrors the web's `savedSearchFiltersSchema` in
 * `src/features/search/schemas/saved-search.ts` but kept here so the
 * mobile package has zero `'server-only'` dependency.
 *
 * Amenity values are validated against a free string here (not the
 * Amenity enum) for forward-compat — the web schema migrates the
 * enum every now and then, and we'd rather the mobile gracefully
 * surface unknown values than reject the whole row.
 */
export const savedSearchFiltersResponseSchema = z.object({
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  type: listingTypeSchema.optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  amenities: z.array(z.string()).optional(),
  q: z.string().optional(),
})

export type SavedSearchFiltersResponse = z.infer<
  typeof savedSearchFiltersResponseSchema
>

/**
 * A SavedSearch row as returned by `GET /api/v1/users/me/saved-searches`.
 * The web service projects `createdAt` as a Date — through JSON it
 * arrives as an ISO string.
 */
export const savedSearchRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  filters: savedSearchFiltersResponseSchema,
  alertsOn: z.boolean(),
  createdAt: z.string().datetime(),
})

export type SavedSearchRow = z.infer<typeof savedSearchRowSchema>
