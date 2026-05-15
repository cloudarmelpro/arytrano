import 'server-only'
import { z } from 'zod'
import type { ListingStatus, ListingType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Admin-side listings query (T-023). Sees every listing regardless of
 * `ownerId` or `status` — including DELETED. Used by `/admin/listings`.
 *
 * Filters:
 *   - `status` — one of the ListingStatus values, or empty for all.
 *   - `q`     — case-insensitive contains on listing.title OR owner.name
 *               OR owner.email. Capped at 100 chars.
 *
 * Pagination is cursor-based (same shape as the public list) so admin
 * pages can stay snappy at 50k+ rows.
 */
const PAGE_SIZE = 30

export const listAdminListingsQuerySchema = z.object({
  cursor: z
    .string()
    .regex(/^[a-z0-9]{20,40}$/, 'Curseur invalide')
    .optional(),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SUSPENDED', 'DELETED'])
    .optional(),
  q: z.string().trim().min(1).max(100).optional(),
})

export type ListAdminListingsQuery = z.infer<typeof listAdminListingsQuerySchema>

export type AdminListingRow = {
  id: string
  slug: string
  title: string
  type: ListingType
  status: ListingStatus
  priceMonthlyMGA: string
  city: { nameFr: string; slug: string }
  neighborhood: { nameFr: string; slug: string }
  owner: { id: string; name: string | null; email: string }
  thumbnailUrl: string | null
  reportCount: number
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export type AdminListingsPage = {
  items: AdminListingRow[]
  nextCursor: string | null
  hasMore: boolean
}

export async function listAdminListings(
  input: ListAdminListingsQuery = {},
): Promise<AdminListingsPage> {
  const where: Prisma.ListingWhereInput = {}
  if (input.status) where.status = input.status
  if (input.q) {
    where.OR = [
      { title: { contains: input.q, mode: 'insensitive' } },
      { owner: { name: { contains: input.q, mode: 'insensitive' } } },
      { owner: { email: { contains: input.q, mode: 'insensitive' } } },
    ]
  }

  const rows = await prisma.listing.findMany({
    where,
    take: PAGE_SIZE + 1,
    skip: input.cursor ? 1 : 0,
    cursor: input.cursor ? { id: input.cursor } : undefined,
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      status: true,
      priceMonthlyMGA: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      city: { select: { nameFr: true, slug: true } },
      neighborhood: { select: { nameFr: true, slug: true } },
      owner: { select: { id: true, name: true, email: true } },
      photos: { take: 1, orderBy: { position: 'asc' }, select: { url: true } },
      _count: { select: { reports: { where: { status: 'OPEN' } } } },
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const items = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const last = items[items.length - 1]
  const nextCursor = hasMore && last ? last.id : null

  return {
    items: items.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      type: r.type,
      status: r.status,
      priceMonthlyMGA: r.priceMonthlyMGA.toString(),
      city: r.city,
      neighborhood: r.neighborhood,
      owner: r.owner,
      thumbnailUrl: r.photos[0]?.url ?? null,
      reportCount: r._count.reports,
      publishedAt: r.publishedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })),
    nextCursor,
    hasMore,
  }
}
