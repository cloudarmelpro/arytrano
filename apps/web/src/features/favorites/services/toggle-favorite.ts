import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * Toggle a user's favorite for a listing.
 *
 * Verifies the listing exists and is PUBLISHED — silently 404 otherwise so
 * a scraper can't enumerate listing ids by status via the favorites endpoint.
 *
 * Returns the resulting state (`true` = now favorited, `false` = removed).
 * Idempotent: clicking twice yields toggle → toggle back, no error.
 */
export async function toggleFavorite(input: {
  userId: string
  listingId: string
}): Promise<{ favorited: boolean }> {
  const listing = await prisma.listing.findFirst({
    where: { id: input.listingId, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: input.userId, listingId: input.listingId } },
    select: { userId: true },
  })

  if (existing) {
    await prisma.favorite.delete({
      where: { userId_listingId: { userId: input.userId, listingId: input.listingId } },
    })
    return { favorited: false }
  }

  await prisma.favorite.create({
    data: { userId: input.userId, listingId: input.listingId },
  })
  return { favorited: true }
}
