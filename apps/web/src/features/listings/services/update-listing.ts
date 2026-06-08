import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { buildSlug } from '@/lib/format/slug'
import { ownerTermsAcceptedFor } from '@/features/auth/server'
import type { UpdateListingInput } from '../schemas'

/**
 * Update a listing owned by `ownerId`. Only the owner can edit; we 404 to
 * avoid leaking existence to non-owners. Slug is rebuilt if title changed.
 * Does NOT allow status changes — use publish/unpublish/delete services.
 */
export async function updateListing(
  ownerId: string,
  listingId: string,
  input: UpdateListingInput,
): Promise<Listing> {
  // Audit Archi H-1 — Owner Terms gate (defense in depth).
  if (!(await ownerTermsAcceptedFor(ownerId))) {
    throw errors.conflict(
      'Tu dois accepter les Conditions d’utilisation Propriétaire avant de modifier une annonce.',
    )
  }

  const existing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: { id: true, title: true, cityId: true },
  })
  if (!existing) {
    throw errors.notFound('Annonce introuvable')
  }

  // If neighborhood is changing, verify it belongs to the (new or existing) city
  if (input.neighborhoodId) {
    const cityId = input.cityId ?? existing.cityId
    const neighborhood = await prisma.neighborhood.findFirst({
      where: { id: input.neighborhoodId, cityId },
      select: { id: true },
    })
    if (!neighborhood) {
      throw errors.validation('Quartier introuvable ou ne correspond pas à la ville')
    }
  }

  const data: Parameters<typeof prisma.listing.update>[0]['data'] = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.priceMonthlyMGA !== undefined && { priceMonthlyMGA: input.priceMonthlyMGA }),
    ...(input.cautionMonths !== undefined && { cautionMonths: input.cautionMonths }),
    ...(input.cityId !== undefined && { cityId: input.cityId }),
    ...(input.neighborhoodId !== undefined && { neighborhoodId: input.neighborhoodId }),
    ...(input.surfaceM2 !== undefined && { surfaceM2: input.surfaceM2 }),
    ...(input.bedrooms !== undefined && { bedrooms: input.bedrooms }),
    ...(input.bathrooms !== undefined && { bathrooms: input.bathrooms }),
    ...(input.furnished !== undefined && { furnished: input.furnished }),
    ...(input.amenities !== undefined && { amenities: { set: input.amenities } }),
    ...(input.customAmenities !== undefined && {
      customAmenities: { set: input.customAmenities },
    }),
  }
  if (input.title && input.title !== existing.title) {
    data.slug = buildSlug(input.title, existing.id)
  }

  return prisma.listing.update({
    where: { id: existing.id },
    data,
  })
}
