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
        status: 'DRAFT',
      },
    })

    // E-T07 B4 : capture the owner's city of activity. We only set
    // `preferredCityId` when it's still null — never overwrite. An
    // owner who lists in city A first and city B second keeps A as
    // their preferred city (used to pre-fill the CitySelect on the
    // landing search next time they sign in). `updateMany` accepts
    // non-unique WHERE filters and returns 0-or-1 silently — perfect
    // for "set if null".
    await tx.user.updateMany({
      where: { id: ownerId, preferredCityId: null },
      data: { preferredCityId: input.cityId },
    })

    return tx.listing.update({
      where: { id: draft.id },
      data: { slug: buildSlug(input.title, draft.id) },
    })
  })
}
