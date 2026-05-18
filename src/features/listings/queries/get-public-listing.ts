import 'server-only'
import type { Amenity, ListingType } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Public listing detail — `/[citySlug]/[neighborhoodSlug]/[listingSlug]` (T-013).
 *
 * Matches on the three URL slugs joined to filter to a single PUBLISHED row.
 * Returns null if the listing doesn't exist, isn't published, or the city /
 * neighborhood / listing slugs don't all align — the page maps `null` → 404.
 *
 * Distinct from the owner-side `getOwnerListing`:
 *  - Public projection: no owner email, no owner phone, no ipHash, no timestamps
 *    that leak operational data (we keep `publishedAt` for `datePublished` in JSON-LD)
 *  - Bundles the full photo gallery (not just thumbnail) ordered by `position`
 *  - Includes city + neighborhood lat/lng as fallback when the listing's own
 *    coordinates aren't set (T-013 acceptance: geo via listing||neighborhood||city)
 */
export type PublicListingDetail = {
  id: string
  /** Owner cuid — not PII, used by the detail page to gate owner-only UI
   * (e.g. the "Reply to review" form). Never expose owner email/phone. */
  ownerId: string
  slug: string
  title: string
  description: string
  type: ListingType
  priceMonthlyMGA: number
  surfaceM2: number | null
  bedrooms: number | null
  bathrooms: number | null
  furnished: boolean
  amenities: Amenity[]
  customAmenities: string[]
  publishedAt: Date | null
  /** When set, drives the "Annonce vérifiée" badge on the detail page (T-033). */
  verifiedAt: Date | null
  /** Coordinates: listing.lat || neighborhood.lat || city.lat. Always present. */
  lat: string
  lng: string
  city: {
    id: string
    slug: string
    nameFr: string
    nameMg: string
  }
  neighborhood: {
    id: string
    slug: string
    nameFr: string
    nameMg: string
  }
  owner: {
    /** First name only — privacy: never expose full name or email publicly. */
    displayName: string
    /** Cloudinary URL or null when the owner hasn't uploaded one. */
    image: string | null
    /** True if the owner has a phone on file (for the contact buttons UI). */
    hasPhone: boolean
  }
  photos: Array<{
    id: string
    url: string
    width: number
    height: number
    blurhash: string | null
    altFr: string | null
    altMg: string | null
  }>
}

export async function getPublicListing(
  citySlug: string,
  neighborhoodSlug: string,
  listingSlug: string,
): Promise<PublicListingDetail | null> {
  const row = await prisma.listing.findFirst({
    where: {
      slug: listingSlug,
      status: 'PUBLISHED',
      city: { slug: citySlug },
      neighborhood: { slug: neighborhoodSlug },
    },
    select: {
      id: true,
      ownerId: true,
      slug: true,
      title: true,
      description: true,
      type: true,
      priceMonthlyMGA: true,
      surfaceM2: true,
      bedrooms: true,
      bathrooms: true,
      furnished: true,
      amenities: true,
      customAmenities: true,
      publishedAt: true,
      verifiedAt: true,
      lat: true,
      lng: true,
      city: {
        select: { id: true, slug: true, nameFr: true, nameMg: true, lat: true, lng: true },
      },
      neighborhood: {
        select: { id: true, slug: true, nameFr: true, nameMg: true, lat: true, lng: true },
      },
      owner: { select: { name: true, image: true, phone: true } },
      photos: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          url: true,
          width: true,
          height: true,
          blurhash: true,
          altFr: true,
          altMg: true,
        },
      },
    },
  })

  if (!row) return null

  // Coordinate fallback chain: listing → neighborhood → city.
  const lat = row.lat ?? row.neighborhood.lat ?? row.city.lat
  const lng = row.lng ?? row.neighborhood.lng ?? row.city.lng

  // Privacy: owner name is exposed but trimmed to the first token (first name).
  // If the owner left it null (OAuth signup may not have populated it),
  // fall back to a neutral label.
  const fullName = row.owner.name?.trim() ?? ''
  const displayName = fullName ? fullName.split(/\s+/)[0]! : 'Propriétaire'

  return {
    id: row.id,
    ownerId: row.ownerId,
    slug: row.slug,
    title: row.title,
    description: row.description,
    type: row.type,
    priceMonthlyMGA: row.priceMonthlyMGA,
    surfaceM2: row.surfaceM2,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    furnished: row.furnished,
    amenities: row.amenities,
    customAmenities: row.customAmenities,
    publishedAt: row.publishedAt,
    verifiedAt: row.verifiedAt,
    lat: lat.toString(),
    lng: lng.toString(),
    city: {
      id: row.city.id,
      slug: row.city.slug,
      nameFr: row.city.nameFr,
      nameMg: row.city.nameMg,
    },
    neighborhood: {
      id: row.neighborhood.id,
      slug: row.neighborhood.slug,
      nameFr: row.neighborhood.nameFr,
      nameMg: row.neighborhood.nameMg,
    },
    owner: {
      displayName,
      image: row.owner.image,
      hasPhone: Boolean(row.owner.phone?.trim()),
    },
    photos: row.photos,
  }
}
