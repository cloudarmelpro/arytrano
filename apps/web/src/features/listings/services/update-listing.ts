import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { buildSlug } from '@/lib/format/slug'
import { ownerTermsAcceptedFor } from '@/features/auth/server'
import type { UpdateListingInput } from '../schemas'
import { autoFlagListingIfNeeded } from './auto-flag-listing'

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

  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data,
  })

  // TRU-04 — re-scan on update so an owner can't slip scam text past
  // the first creation by editing later. Dedup window in the service
  // prevents noise when an owner just tweaks the price.
  if (input.title !== undefined || input.description !== undefined) {
    void autoFlagListingIfNeeded({
      listingId: updated.id,
      title: updated.title,
      description: updated.description,
    })
  }

  return updated
}

/**
 * ADM-12 — admin edit path. Bypasses the ownerId check + the CGU
 * gate (moderation trumps owner consent). Otherwise runs the same
 * validation + slug rebuild + TRU-04 rescan as the owner path. The
 * caller MUST have already resolved requireAdmin().
 */
export async function adminUpdateListing(
  adminId: string,
  listingId: string,
  input: UpdateListingInput,
): Promise<Listing> {
  const existing = await prisma.listing.findFirst({
    where: { id: listingId, status: { not: 'DELETED' } },
    select: { id: true, title: true, cityId: true, ownerId: true },
  })
  if (!existing) throw errors.notFound('Annonce introuvable')

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

  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data,
  })

  if (input.title !== undefined || input.description !== undefined) {
    void autoFlagListingIfNeeded({
      listingId: updated.id,
      title: updated.title,
      description: updated.description,
    })
  }

  return updated
}
