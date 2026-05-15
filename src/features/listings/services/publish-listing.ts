import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * DRAFT → PUBLISHED. Validates the listing has the minimum required content:
 *   - title, description (already enforced by schema at create/update time)
 *   - priceMonthlyMGA > 0
 *   - cityId, neighborhoodId
 *   - at least 1 photo
 * Owner-only.
 */
export async function publishListing(ownerId: string, listingId: string): Promise<Listing> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: {
      id: true,
      title: true,
      description: true,
      priceMonthlyMGA: true,
      cityId: true,
      neighborhoodId: true,
      status: true,
      _count: { select: { photos: true } },
    },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  if (listing.status === 'PUBLISHED') {
    return prisma.listing.findUniqueOrThrow({ where: { id: listingId } })
  }
  if (listing.status === 'SUSPENDED') {
    throw errors.forbidden('Annonce suspendue par la modération — contacte le support')
  }

  if (!listing.title || listing.title.length < 5) {
    throw errors.validation('Titre manquant ou trop court')
  }
  if (!listing.description || listing.description.length < 20) {
    throw errors.validation('Description manquante ou trop courte')
  }
  if (Number(listing.priceMonthlyMGA) <= 0) {
    throw errors.validation('Prix invalide')
  }
  if (listing._count.photos < 1) {
    throw errors.validation('Ajoute au moins 1 photo avant de publier')
  }

  return prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
  })
}
