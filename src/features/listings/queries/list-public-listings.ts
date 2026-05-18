import 'server-only'
import { z } from 'zod'
import type { Amenity, ListingType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { amenitySchema } from '../schemas/create-listing'

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
    neighborhood: slugSchema, // neighborhood slug
    priceMin: priceSchema,
    priceMax: priceSchema,
    sort: z.enum(LISTING_SORT_VALUES).optional(),
    amenities: amenitiesFromUrl,
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
  city: { slug: string; nameFr: string }
  neighborhood: { slug: string; nameFr: string }
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
  if (input.neighborhood) where.neighborhood = { slug: input.neighborhood }
  if (input.priceMin !== undefined || input.priceMax !== undefined) {
    where.priceMonthlyMGA = {
      ...(input.priceMin !== undefined && { gte: input.priceMin }),
      ...(input.priceMax !== undefined && { lte: input.priceMax }),
    }
  }
  // Amenities: AND semantics — every selected amenity must be present
  // on the listing. `hasEvery` does the array-contains-all check.
  if (input.amenities && input.amenities.length > 0) {
    where.amenities = { hasEvery: input.amenities }
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
      city: { select: { slug: true, nameFr: true } },
      neighborhood: { select: { slug: true, nameFr: true } },
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
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const lastItem = items[items.length - 1]
  const nextCursor = hasMore && lastItem ? lastItem.id : null

  return {
    items: items.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      type: r.type,
      priceMonthlyMGA: r.priceMonthlyMGA,
      city: r.city,
      neighborhood: r.neighborhood,
      photo: r.photos[0] ?? null,
    })),
    nextCursor,
    hasMore,
  }
}
