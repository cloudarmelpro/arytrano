import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { LISTING_TTL_MS } from './publish-listing'

/**
 * Owner-triggered extension of a listing's expiration date. Resets
 * `expiresAt` to `now + 60d` and clears `expirationAlertSentAt` so
 * the next cycle's warning fires fresh.
 *
 * Works on both PUBLISHED listings (typical case — owner clicks
 * "Prolonger" before expiry) AND on UNAVAILABLE listings whose
 * status came from the auto-expire cron (re-publish path). For
 * UNAVAILABLE → PUBLISHED transition, we flip the status too so
 * the listing reappears in the public catalog. SUSPENDED listings
 * are refused — extension would let a moderation case slip back.
 *
 * Owner-only — caller passes `ownerId`, and the WHERE filters on
 * it so a tampered listingId from another owner returns notFound.
 */
export async function extendListingExpiration(
  ownerId: string,
  listingId: string,
): Promise<{ expiresAt: Date; statusChanged: boolean }> {
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId },
    select: { id: true, status: true },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  if (listing.status === 'DELETED') {
    throw errors.conflict('Annonce supprimée — création d\'une nouvelle annonce requise')
  }
  if (listing.status === 'SUSPENDED') {
    throw errors.forbidden(
      'Annonce suspendue par la modération — contacte le support',
    )
  }

  const newExpiresAt = new Date(Date.now() + LISTING_TTL_MS)
  const statusChanged = listing.status === 'UNAVAILABLE'

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      expiresAt: newExpiresAt,
      expirationAlertSentAt: null,
      // Re-publishing path: UNAVAILABLE → PUBLISHED. PUBLISHED → stays
      // PUBLISHED. DRAFT extend is a no-op on status (still DRAFT) but
      // we still set the expiresAt so the clock is primed if the
      // owner publishes later — UX nicety.
      ...(statusChanged
        ? { status: 'PUBLISHED', publishedAt: new Date() }
        : {}),
    },
  })

  return { expiresAt: newExpiresAt, statusChanged }
}
