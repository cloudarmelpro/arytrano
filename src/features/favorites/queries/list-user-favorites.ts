import 'server-only'
import { prisma } from '@/lib/db'
import type { PublicListingCard } from '@/features/listings/queries/list-public-listings'

const PAGE_SIZE = 20

export type UserFavoritesPage = {
  items: PublicListingCard[]
  nextCursor: string | null
  hasMore: boolean
}

/**
 * Paginated list of a user's favorited listings, newest-first.
 *
 * Cursor is the `userId_listingId` composite — encoded simply as the
 * `listingId` of the boundary row (userId is implicit from the query).
 * Excludes listings that have been DELETED or SUSPENDED so we never
 * surface dead favorites on the dashboard.
 *
 * Projection matches `PublicListingCard` for component reuse.
 */
export async function listUserFavorites(
  userId: string,
  cursor?: string,
): Promise<UserFavoritesPage> {
  const rows = await prisma.favorite.findMany({
    where: {
      userId,
      // Hide favorites whose listing isn't visible anymore — keeps the
      // dashboard clean and avoids broken-detail-link clicks. The row
      // stays in DB (user can re-favorite if it returns to PUBLISHED).
      listing: { status: 'PUBLISHED' },
    },
    take: PAGE_SIZE + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor
      ? { userId_listingId: { userId, listingId: cursor } }
      : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      listingId: true,
      listing: {
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
      },
    },
  })

  const hasMore = rows.length > PAGE_SIZE
  const sliced = hasMore ? rows.slice(0, PAGE_SIZE) : rows
  const lastRow = sliced[sliced.length - 1]
  const nextCursor = hasMore && lastRow ? lastRow.listingId : null

  return {
    items: sliced.map((r) => ({
      id: r.listing.id,
      slug: r.listing.slug,
      title: r.listing.title,
      type: r.listing.type,
      priceMonthlyMGA: r.listing.priceMonthlyMGA.toString(),
      city: r.listing.city,
      neighborhood: r.listing.neighborhood,
      photo: r.listing.photos[0] ?? null,
    })),
    nextCursor,
    hasMore,
  }
}
