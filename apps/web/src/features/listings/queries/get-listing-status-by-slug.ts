import 'server-only'
import type { ListingStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Cheap status-only lookup keyed on the public URL triple. Returns the
 * raw status when the slug path resolves to any listing — including
 * non-PUBLISHED rows that `getPublicListing` deliberately hides.
 *
 * Used by the detail page to decide between 200 (PUBLISHED), redirect
 * (UNAVAILABLE → /annonces) and 404 (DELETED / SUSPENDED / DRAFT / null).
 * Doing this in one extra cheap query avoids a wider refactor of
 * `getPublicListing`, which has many call sites that rely on its
 * status-filtered contract.
 */
export async function getListingStatusBySlug(
  citySlug: string,
  neighborhoodSlug: string,
  listingSlug: string,
): Promise<ListingStatus | null> {
  const row = await prisma.listing.findFirst({
    where: {
      slug: listingSlug,
      city: { slug: citySlug },
      neighborhood: { slug: neighborhoodSlug },
    },
    select: { status: true },
  })
  return row?.status ?? null
}
