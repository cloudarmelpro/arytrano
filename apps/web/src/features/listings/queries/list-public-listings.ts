import 'server-only'
import { z } from 'zod'
import type { Amenity, ListingType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { escapeLike } from '@/lib/db/like-escape'
import { cloudinaryCardThumb } from '@/lib/images/cloudinary-transform'
import { amenitySchema } from '../schemas/create-listing'
import { getRatingsForListings } from './get-ratings-for-listings'

/**
 * Public listing list — `/annonces` (T-012).
 *
 * Separate from `list-owner-listings` on purpose:
 *  - Filters to `status: PUBLISHED` only (owner sees DRAFT / UNAVAILABLE too)
 *  - Strips owner PII from the projection (no email, no phone, no userId leak)
 *  - Includes blurhash + photo dimensions for `next/image` placeholder=blur
 *  - Cursor-based pagination keyed on `(publishedAt desc, id desc)` — DB
 *    index `[status, publishedAt(sort: Desc)]` covers the hot path.
 */

const PAGE_SIZE = 20

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]{2,80}$/, 'Slug invalide')
  .optional()

const priceSchema = z.coerce
  .number()
  .int()
  .nonnegative()
  .max(100_000_000)
  .optional()

// Bedrooms / bathrooms filters use "at least N" semantics — a visitor
// who picks "2 chambres" wants every listing with 2 or more bedrooms,
// not strictly 2. Caps are generous enough to cover real listings (5
// bedrooms is rare on the platform; the URL still accepts higher
// values, the sidebar just stops the pill row at 5+).
const minCountSchema = z.coerce.number().int().min(1).max(20).optional()

// Furnished filter: `'true'` / `'false'` boolean strings via URL. The
// schema coerces to a real boolean for the Prisma where clause.
const furnishedSchema = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'))

export const LISTING_SORT_VALUES = ['newest', 'price-asc', 'price-desc'] as const
export type ListingSort = (typeof LISTING_SORT_VALUES)[number]

/**
 * Amenities pass through the URL as a comma-separated string:
 *   `?amenities=WIFI,PARKING,HOT_WATER`.
 * The schema splits + validates each value against the enum. Invalid
 * entries are silently dropped (one bad value shouldn't break the search).
 */
const amenitiesFromUrl = z
  .string()
  .optional()
  .transform((v): Amenity[] => {
    if (!v) return []
    const parts = v.split(',').map((s) => s.trim()).filter(Boolean)
    const valid: Amenity[] = []
    for (const p of parts) {
      const ok = amenitySchema.safeParse(p)
      if (ok.success) valid.push(ok.data)
    }
    // Cap at 10 to bound DB array filter size + URL length.
    return valid.slice(0, 10)
  })

export const listPublicListingsQuerySchema = z
  .object({
    cursor: z
      .string()
      .regex(/^[a-z0-9]{20,40}$/, 'Curseur invalide')
      .optional(),
    type: z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE']).optional(),
    // E-T07 multi-ville : neighborhood slugs are unique PER city
    // (composite @@unique [cityId, slug]) — the same slug "anjoma"
    // exists in Fianarantsoa AND Toamasina. Always scope by city
    // when filtering by neighborhood, otherwise we'd return results
    // from the wrong city.
    city: slugSchema,
    neighborhood: slugSchema, // neighborhood slug
    priceMin: priceSchema,
    priceMax: priceSchema,
    // Refining filters added 2026-06-09 — sidebar adds bedrooms count,
    // bathrooms count, furnished yes/no. All optional; bedrooms /
    // bathrooms use "≥ N" semantics, furnished is strict equality.
    bedrooms: minCountSchema,
    bathrooms: minCountSchema,
    furnished: furnishedSchema,
    // T-059 — "Avec vidéo" filter, query param ?video=1.
    hasVideo: z
      .union([z.literal('1'), z.literal('0'), z.literal('true'), z.literal('false')])
      .transform((v) => v === '1' || v === 'true')
      .optional(),
    sort: z.enum(LISTING_SORT_VALUES).optional(),
    amenities: amenitiesFromUrl,
    // TEN-11 — "près de l'université" filter. Slug of one of the seeded
    // University rows; we convert to a ±0.027° lat / ±0.029° lng bounding
    // box (~3km square at MG latitudes) and apply as a WHERE clause.
    // Cheaper than haversine + works with the existing cursor pagination.
    nearUniversity: slugSchema,
    // E-T14 full-text search. Bounded to 120 chars to keep the
    // ILIKE scan cheap until we promote to a tsvector GIN index.
    q: z
      .string()
      .trim()
      .min(2, 'Au moins 2 caractères')
      .max(120, 'Recherche trop longue')
      .optional(),
  })
  .refine(
    (v) => v.priceMin === undefined || v.priceMax === undefined || v.priceMin <= v.priceMax,
    { message: 'Le prix min doit être ≤ prix max', path: ['priceMin'] },
  )

export type ListPublicListingsQuery = z.infer<typeof listPublicListingsQuerySchema>

export type PublicListingCard = {
  id: string
  slug: string
  title: string
  type: ListingType
  priceMonthlyMGA: number
  cautionMonths: number
  publishedAt: Date | null
  /** Truthy when an admin has marked the listing as verified (T-033). */
  verifiedAt: Date | null
  /** Average rating over PUBLISHED reviews. Null when there are 0. */
  avgRating: number | null
  /** Number of PUBLISHED reviews (used to show "(12 avis)"). */
  reviewCount: number
  /** T-059 — true when the listing has a walkthrough video. The card
   *  shows a "Vidéo" pill so visitors can spot listings with a
   *  walkthrough at a glance. */
  hasVideo: boolean
  city: { slug: string; nameFr: string; nameMg: string }
  neighborhood: { slug: string; nameFr: string; nameMg: string }
  photo: {
    url: string
    width: number
    height: number
    blurhash: string | null
    altFr: string | null
  } | null
}

export type PublicListingsPage = {
  items: PublicListingCard[]
  nextCursor: string | null
  hasMore: boolean
}

export async function listPublicListings(
  // Partial — every field is independently optional, including the
  // `amenities` array (which the schema transforms into a [] default
  // when parsing a URL, but isn't required when calling the function
  // programmatically without a parsed object).
  input: Partial<ListPublicListingsQuery> = {},
): Promise<PublicListingsPage> {
  const cursor = input.cursor

  const where: Prisma.ListingWhereInput = { status: 'PUBLISHED' }
  if (input.type) where.type = input.type
  if (input.city) where.city = { slug: input.city }
  if (input.neighborhood) {
    // Scope the neighborhood lookup to the city when both are passed
    // so two homonymous neighborhood slugs from different cities don't
    // collide. Without a city, we still allow the bare slug match for
    // backward-compatibility with v0.5 single-city links.
    where.neighborhood = input.city
      ? { slug: input.neighborhood, city: { slug: input.city } }
      : { slug: input.neighborhood }
  }
  if (input.priceMin !== undefined || input.priceMax !== undefined) {
    where.priceMonthlyMGA = {
      ...(input.priceMin !== undefined && { gte: input.priceMin }),
      ...(input.priceMax !== undefined && { lte: input.priceMax }),
    }
  }
  // Bedrooms / bathrooms: "≥ N" semantics so the sidebar can offer
  // "2+ chambres" UX without the visitor missing 3+ matches.
  if (input.bedrooms !== undefined) {
    where.bedrooms = { gte: input.bedrooms }
  }
  if (input.bathrooms !== undefined) {
    where.bathrooms = { gte: input.bathrooms }
  }
  if (input.furnished !== undefined) {
    where.furnished = input.furnished
  }
  // T-059 — "Avec vidéo" filter. We require a PUBLISHED video so a
  // hidden one doesn't trip the filter. `is: { status }` narrows the
  // optional relation to status=PUBLISHED rows.
  if (input.hasVideo === true) {
    where.video = { is: { status: 'PUBLISHED' } }
  }
  // Amenities: AND semantics — every selected amenity must be present
  // on the listing. `hasEvery` does the array-contains-all check.
  if (input.amenities && input.amenities.length > 0) {
    where.amenities = { hasEvery: input.amenities }
  }
  // TEN-11 — near-university bounding box. Resolve the slug to coords
  // once, then constrain the listing lat/lng to a ~3km square. The
  // bounding box is generous on the longitude side to compensate for
  // the latitude-dependent distortion (cos(-19°) ≈ 0.946).
  if (input.nearUniversity) {
    const uni = await prisma.university.findUnique({
      where: { slug: input.nearUniversity },
      select: { lat: true, lng: true },
    })
    if (uni) {
      const lat = Number(uni.lat)
      const lng = Number(uni.lng)
      const DELTA_LAT = 0.027
      const DELTA_LNG = 0.029
      where.lat = {
        gte: (lat - DELTA_LAT).toFixed(6),
        lte: (lat + DELTA_LAT).toFixed(6),
      }
      where.lng = {
        gte: (lng - DELTA_LNG).toFixed(6),
        lte: (lng + DELTA_LNG).toFixed(6),
      }
    }
  }

  // E-T14 full-text search.
  // Prisma's `contains` insensitive on title + description; Postgres
  // resolves the scan via the pg_trgm GIN indexes added in migration
  // 20260526200000_listing_fts_pg_trgm. Works for substring matches
  // ("studi" -> "Studio Andrainjato"). If we ever need ranked relevance
  // ordering we can promote to tsvector + ts_rank — the `q` URL shape
  // stays the same.
  if (input.q) {
    // SEC P0 — escape ILIKE wildcards before Prisma wraps in `%...%`.
    // A bare `q=%` matches every row; `q=%%%%...` triggers backtracking
    // on the unindexed `description` TEXT column (effective DoS).
    const safe = escapeLike(input.q)
    where.OR = [
      { title: { contains: safe, mode: 'insensitive' } },
      { description: { contains: safe, mode: 'insensitive' } },
    ]
  }

  // Sort selection — `id` is always the tie-breaker so cursor pagination
  // stays stable when the primary sort key has duplicates (same publishedAt,
  // same price).
  const orderBy: Prisma.ListingOrderByWithRelationInput[] = (() => {
    switch (input.sort) {
      case 'price-asc':
        return [{ priceMonthlyMGA: 'asc' }, { id: 'asc' }]
      case 'price-desc':
        return [{ priceMonthlyMGA: 'desc' }, { id: 'desc' }]
      case 'newest':
      default:
        return [{ publishedAt: 'desc' }, { id: 'desc' }]
    }
  })()

  const rows = await prisma.listing.findMany({
    where,
    take: PAGE_SIZE + 1, // sentinel — tells us if there's a next page
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy,
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
      publishedAt: true,
      verifiedAt: true,
      city: { select: { slug: true, nameFr: true, nameMg: true } },
      neighborhood: { select: { slug: true, nameFr: true, nameMg: true } },
      photos: {
        take: 1,
        orderBy: { position: 'asc' },
        select: {
          url: true,
          width: true,
          height: true,
          blurhash: true,
          altFr: true,
        },
      },
      // T-059 — one column to drive the card's "Vidéo" badge. Filtered
      // on status=PUBLISHED so a hidden video stops showing the pill.
      video: {
        where: { status: 'PUBLISHED' },
        select: { url: true },
      },
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const lastItem = items[items.length - 1]
  const nextCursor = hasMore && lastItem ? lastItem.id : null

  // 2026-06-15 — one extra round-trip to aggregate review ratings for
  // the current page. Shared helper, used by every query that builds
  // PublicListingCard so the rating appears consistently.
  const ratingsByListing = await getRatingsForListings(items.map((i) => i.id))

  return {
    items: items.map((r) => {
      // Performance audit H-2 (2026-05-29) — rewrite the upload URL to
      // a Cloudinary 800×600 WebP q_75 at the query layer so every
      // consumer (web cards, mobile app, REST API) gets the optimized
      // payload without having to call the helper themselves. See
      // `cloudinaryCardThumb` for sizing rationale.
      const rawPhoto = r.photos[0]
      const photo = rawPhoto
        ? { ...rawPhoto, url: cloudinaryCardThumb(rawPhoto.url) }
        : null
      const rating = ratingsByListing.get(r.id) ?? { avg: null, count: 0 }
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        type: r.type,
        priceMonthlyMGA: r.priceMonthlyMGA,
        cautionMonths: r.cautionMonths,
        publishedAt: r.publishedAt,
        verifiedAt: r.verifiedAt,
        avgRating: rating.avg,
        reviewCount: rating.count,
        hasVideo: r.video !== null,
        city: r.city,
        neighborhood: r.neighborhood,
        photo,
      }
    }),
    nextCursor,
    hasMore,
  }
}
