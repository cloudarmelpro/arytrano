import { z } from 'zod'
import { amenitySchema } from '@/features/listings'

/**
 * Subset of /annonces query filters worth saving. Mirrors the
 * `listPublicListingsQuerySchema` shape but drops cursor/sort —
 * those are session-state, not search intent.
 *
 * Stored as JSON in `SavedSearch.filters` (validated app-side at
 * read time so a schema migration doesn't strand old rows).
 *
 * Amenities are bound to the `Amenity` Prisma enum, not arbitrary
 * 40-char strings. Audit finding (SEC P2): the loose shape let a
 * client persist `["DROP TABLE…"]` — no SQL impact (Prisma escapes)
 * but the JSON column gets polluted and the alert matcher would
 * silently drop those rows.
 */
export const savedSearchFiltersSchema = z.object({
  city: z.string().min(1).max(64).optional(),
  neighborhood: z.string().min(1).max(64).optional(),
  type: z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE']).optional(),
  priceMin: z.number().int().min(0).optional(),
  priceMax: z.number().int().min(0).optional(),
  amenities: z.array(amenitySchema).max(20).optional(),
  q: z.string().min(1).max(120).optional(),
})

export type SavedSearchFilters = z.infer<typeof savedSearchFiltersSchema>

export const createSavedSearchSchema = z.object({
  name: z.string().trim().min(2, 'Au moins 2 caractères').max(60, 'Max 60 caractères'),
  filters: savedSearchFiltersSchema,
  alertsOn: z.boolean().default(true),
})

export type CreateSavedSearchInput = z.infer<typeof createSavedSearchSchema>
