import { z } from 'zod'

/**
 * Listing-related response shapes for the mobile client.
 *
 * Mirrors the projection that `src/features/listings/queries/list-public-
 * listings.ts` returns (`PublicListingCard`). Re-declared here so the
 * shared package has zero dependency on the web's `'server-only'`
 * Prisma layer.
 */

export const listingTypeSchema = z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE'])
export type ListingType = z.infer<typeof listingTypeSchema>

export const listingPhotoSchema = z.object({
  url: z.string().url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurhash: z.string().nullable(),
  altFr: z.string().nullable(),
})

export type ListingPhoto = z.infer<typeof listingPhotoSchema>

export const publicListingCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  type: listingTypeSchema,
  priceMonthlyMGA: z.number().int().nonnegative(),
  publishedAt: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
  city: z.object({ slug: z.string(), nameFr: z.string() }),
  neighborhood: z.object({ slug: z.string(), nameFr: z.string() }),
  photo: listingPhotoSchema.nullable(),
})

export type PublicListingCard = z.infer<typeof publicListingCardSchema>

/**
 * Query parameters accepted by `GET /api/v1/listings`. The web's
 * `listPublicListingsQuerySchema` is the authority — this is the
 * mobile-input subset (we keep amenities as a comma-joined string
 * to match the URL shape exactly).
 */
export const listingsListQuerySchema = z.object({
  cursor: z.string().optional(),
  type: listingTypeSchema.optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  priceMin: z.number().int().nonnegative().optional(),
  priceMax: z.number().int().nonnegative().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc']).optional(),
  amenities: z.array(z.string()).max(10).optional(),
  q: z.string().min(2).max(120).optional(),
})

export type ListingsListQuery = z.infer<typeof listingsListQuerySchema>
