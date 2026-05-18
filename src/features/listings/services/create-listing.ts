import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { buildSlug } from '@/lib/format/slug'
import type { CreateListingInput } from '../schemas'

/**
 * Create a listing in DRAFT status owned by the given user.
 * Verifies city + neighborhood exist and that the neighborhood belongs to the city.
 * Generates a stable slug suffixed with the listing id (so edits don't break URLs).
 */
export async function createListing(
  ownerId: string,
  input: CreateListingInput,
): Promise<Listing> {
  const neighborhood = await prisma.neighborhood.findFirst({
    where: { id: input.neighborhoodId, cityId: input.cityId },
    select: { id: true },
  })
  if (!neighborhood) {
    throw errors.validation('Quartier introuvable ou ne correspond pas à la ville sélectionnée')
  }

  return prisma.$transaction(async (tx) => {
    // First create with placeholder slug, then update with the real one
    // (slug needs the row id to stay stable across title edits).
    const draft = await tx.listing.create({
      data: {
        ownerId,
        cityId: input.cityId,
        neighborhoodId: input.neighborhoodId,
        title: input.title,
        slug: 'pending',
        description: input.description,
        type: input.type,
        priceMonthlyMGA: input.priceMonthlyMGA,
        surfaceM2: input.surfaceM2 ?? null,
        bedrooms: input.bedrooms ?? null,
        bathrooms: input.bathrooms ?? null,
        furnished: input.furnished ?? false,
        amenities: input.amenities ?? [],
        customAmenities: input.customAmenities ?? [],
        watermarkOptIn: input.watermarkOptIn ?? false,
        status: 'DRAFT',
      },
    })

    return tx.listing.update({
      where: { id: draft.id },
      data: { slug: buildSlug(input.title, draft.id) },
    })
  })
}
