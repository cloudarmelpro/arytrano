import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Narrow listing fetch for the lease wizard route. Selects only the
 * fields the wizard reads (title, price, caution, owner check) so the
 * query payload stays minimal.
 *
 * Lives in a query module (not the route) per ARCHITECTURE.md rule 2 :
 * routes don't hit Prisma directly. Lets us add caching / instrumentation
 * later in one place instead of scattered route-level edits.
 */
export type ListingForLeaseWizard = NonNullable<
  Awaited<ReturnType<typeof getListingForLeaseWizard>>
>

export async function getListingForLeaseWizard(listingId: string) {
  return prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      ownerId: true,
      status: true,
      slug: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
    },
  })
}
