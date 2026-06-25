import 'server-only'
import type { Amenity, ListingStatus, ListingType } from '@prisma/client'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

export type OwnerListingDetail = {
  id: string
  ownerId: string
  title: string
  slug: string
  description: string
  type: ListingType
  status: ListingStatus
  priceMonthlyMGA: number
  cautionMonths: number
  surfaceM2: number | null
  bedrooms: number | null
  bathrooms: number | null
  furnished: boolean
  amenities: Amenity[]
  customAmenities: string[]
  cityId: string
  neighborhoodId: string
  city: { id: string; slug: string; nameFr: string }
  neighborhood: { id: string; slug: string; nameFr: string }
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  photos: Array<{
    id: string
    url: string
    cloudinaryId: string
    width: number
    height: number
    position: number
    altFr: string | null
  }>
  /** T-059 — walkthrough video, null when none uploaded yet. */
  video: {
    url: string
    posterUrl: string
    durationSec: number
    bytes: number
    /** Moderation status — owners see "Masquée par AryTrano" when HIDDEN_BY_ADMIN. */
    status: 'PUBLISHED' | 'HIDDEN_BY_ADMIN'
    hiddenReason: string | null
  } | null
}

/**
 * Full listing for the owner edit screen. 404 if the listing doesn't
 * belong to the user — same response whether non-existent or wrong owner
 * to avoid leaking existence.
 */
export async function getOwnerListing(
  ownerId: string,
  listingId: string,
): Promise<OwnerListingDetail> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: {
      id: true,
      ownerId: true,
      title: true,
      slug: true,
      description: true,
      type: true,
      status: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
      surfaceM2: true,
      bedrooms: true,
      bathrooms: true,
      furnished: true,
      amenities: true,
      customAmenities: true,
      cityId: true,
      neighborhoodId: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      city: { select: { id: true, slug: true, nameFr: true } },
      neighborhood: { select: { id: true, slug: true, nameFr: true } },
      photos: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          url: true,
          cloudinaryId: true,
          width: true,
          height: true,
          position: true,
          altFr: true,
        },
      },
      video: {
        select: {
          url: true,
          posterUrl: true,
          durationSec: true,
          bytes: true,
          status: true,
          hiddenReason: true,
        },
      },
    },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  return {
    ...listing,
    priceMonthlyMGA: listing.priceMonthlyMGA,
  }
}
