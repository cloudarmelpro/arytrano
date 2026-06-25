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
  // Aggregated review rating (2026-06-15). Both fields are tolerated
  // as missing for backwards-compat with older API revisions —
  // mobile clients on the previous contract still parse fine.
  avgRating: z.number().min(0).max(5).nullable().optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  city: z.object({
    slug: z.string(),
    nameFr: z.string(),
    nameMg: z.string(),
  }),
  neighborhood: z.object({
    slug: z.string(),
    nameFr: z.string(),
    nameMg: z.string(),
  }),
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

/**
 * Public listing detail — returned by `GET /api/v1/listings/:id/public`.
 *
 * Mirrors `PublicListingDetail` on the server side but with two normalizations
 * for JSON safety :
 *  - `lat`/`lng` arrive as strings (Prisma Decimal → toString())
 *  - `publishedAt`/`verifiedAt` arrive as ISO strings (Date → JSON)
 */
export const amenityEnumSchema = z.enum([
  'WIFI',
  'PARKING',
  'MOTO_PARKING',
  'HOT_WATER',
  'WATER_TANK',
  'GENERATOR',
  'AIR_CONDITIONING',
  'KITCHEN_EQUIPPED',
  'WASHING_MACHINE',
  'GUARD',
  'SECURITY_GATE',
  'TERRACE',
  'BALCONY',
  'GARDEN',
  'FURNISHED_KITCHEN',
  'PUBLIC_TRANSPORT',
])
export type Amenity = z.infer<typeof amenityEnumSchema>

export const publicListingDetailSchema = z.object({
  id: z.string(),
  // Security P1-3 : the mobile `/api/v1/listings/:id/public` endpoint
  // strips this field. We keep it OPTIONAL here so callers that DO
  // get it (e.g. web internal callers using the same schema) can
  // still read it, but the mobile parser doesn't reject a payload
  // that legitimately omits it.
  ownerId: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  type: listingTypeSchema,
  priceMonthlyMGA: z.number().int().nonnegative(),
  surfaceM2: z.number().int().nullable(),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  furnished: z.boolean(),
  amenities: z.array(amenityEnumSchema),
  customAmenities: z.array(z.string()),
  publishedAt: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
  lat: z.string(),
  lng: z.string(),
  city: z.object({
    id: z.string(),
    slug: z.string(),
    nameFr: z.string(),
    nameMg: z.string(),
  }),
  neighborhood: z.object({
    id: z.string(),
    slug: z.string(),
    nameFr: z.string(),
    nameMg: z.string(),
  }),
  owner: z.object({
    id: z.string(),
    displayName: z.string(),
    image: z.string().url().nullable(),
    hasPhone: z.boolean(),
    verifiedAt: z.string().datetime().nullable(),
  }),
  photos: z.array(
    z.object({
      id: z.string(),
      url: z.string().url(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      blurhash: z.string().nullable(),
      altFr: z.string().nullable(),
      altMg: z.string().nullable(),
    }),
  ),
  // T-059 — optional walkthrough video, null when none uploaded.
  // Older API revisions don't return this key at all, so the field
  // is `optional + nullable` for backwards-compat.
  video: z
    .object({
      url: z.string().url(),
      posterUrl: z.string().url(),
      posterBlurhash: z.string().nullable(),
      durationSec: z.number().int().nonnegative(),
    })
    .nullable()
    .optional(),
})

export type PublicListingDetail = z.infer<typeof publicListingDetailSchema>
