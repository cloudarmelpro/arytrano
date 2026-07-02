import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { buildSlug } from '@/lib/format/slug'
import { rateLimiters } from '@/lib/rate-limit'
import { ownerTermsAcceptedFor } from '@/features/auth/server'

/**
 * OWN-06 — clone an existing listing into a fresh DRAFT. Copies
 * every content field (title / description / type / price / caution /
 * geo / structural + amenities) but NOT photos, video, or status —
 * the owner will re-attach fresh media so a stale image can't leak
 * into the new row.
 *
 * The new title gets " (copie)" appended so the owner spots the
 * duplicate at a glance in /dashboard/listings.
 */
export async function cloneListing(
  ownerId: string,
  sourceListingId: string,
): Promise<{ newListingId: string }> {
  if (!(await ownerTermsAcceptedFor(ownerId))) {
    throw errors.conflict(
      'Tu dois accepter les Conditions d’utilisation Propriétaire avant de dupliquer une annonce.',
    )
  }

  // Reuse the same create-listing rate limit so a runaway clone loop
  // can't bypass TRU-05.
  const rl = await rateLimiters.createListing(ownerId)
  if (!rl.success) {
    throw errors.rateLimited('Trop d’annonces créées récemment.')
  }

  const source = await prisma.listing.findFirst({
    where: { id: sourceListingId, ownerId, status: { not: 'DELETED' } },
    select: {
      title: true,
      description: true,
      type: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
      cityId: true,
      neighborhoodId: true,
      lat: true,
      lng: true,
      surfaceM2: true,
      bedrooms: true,
      bathrooms: true,
      furnished: true,
      amenities: true,
      customAmenities: true,
    },
  })
  if (!source) throw errors.notFound('Annonce introuvable')

  const created = await prisma.$transaction(async (tx) => {
    const draft = await tx.listing.create({
      data: {
        ownerId,
        title: `${source.title} (copie)`.slice(0, 140),
        slug: 'pending',
        description: source.description,
        type: source.type,
        priceMonthlyMGA: source.priceMonthlyMGA,
        cautionMonths: source.cautionMonths,
        cityId: source.cityId,
        neighborhoodId: source.neighborhoodId,
        lat: source.lat,
        lng: source.lng,
        surfaceM2: source.surfaceM2,
        bedrooms: source.bedrooms,
        bathrooms: source.bathrooms,
        furnished: source.furnished,
        amenities: source.amenities,
        customAmenities: source.customAmenities,
        status: 'DRAFT',
      },
      select: { id: true, title: true },
    })
    await tx.listing.update({
      where: { id: draft.id },
      data: { slug: buildSlug(draft.title, draft.id) },
    })
    return draft
  })

  return { newListingId: created.id }
}
