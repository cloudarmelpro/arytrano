import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * Soft-delete a listing. The row is kept (status=DELETED) for 30 days so
 * admin can restore in case of mistake (per T-011). Photos are kept in
 * Cloudinary until the cleanup cron purges them.
 */
export async function deleteListing(ownerId: string, listingId: string): Promise<void> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: { id: true },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  await prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'DELETED' },
  })
}
