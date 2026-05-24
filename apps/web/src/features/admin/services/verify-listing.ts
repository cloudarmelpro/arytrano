import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildListingVerifiedEmail } from '@/lib/email/templates/listing-verified'

export type VerifyListingResult = {
  /** Whether the marker was just turned ON (true) or OFF (false). Drives
   *  the "first verification" branch in the caller (email notification). */
  nowVerified: boolean
}

/**
 * Admin toggles the "Annonce vérifiée" marker on a listing (T-033).
 *
 * Idempotent on the same direction:
 *   - Verifying an already-verified listing refreshes `verifiedBy` to the
 *     current admin and keeps `verifiedAt` untouched (audit continuity).
 *   - Un-verifying an unverified listing is a no-op.
 *
 * The caller (Server Action / REST handler) is responsible for the
 * `requireAdmin()` guard and downstream effects like emailing the owner
 * on first verification.
 */
export async function verifyListing(
  adminId: string,
  listingId: string,
): Promise<VerifyListingResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      status: true,
      verifiedAt: true,
      title: true,
      slug: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
      owner: { select: { id: true, email: true, name: true, locale: true } },
    },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')
  if (listing.status === 'DELETED') {
    throw errors.conflict('Impossible de vérifier une annonce supprimée')
  }

  const wasVerified = Boolean(listing.verifiedAt)
  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      verifiedBy: adminId,
      // Preserve the original verifiedAt on re-verify so the badge keeps
      // signalling "verified since X" rather than re-resetting on every
      // admin touch.
      ...(wasVerified ? {} : { verifiedAt: new Date() }),
    },
  })

  // T-034: notify the owner on FIRST verification only (re-verify after
  // an unverify cycle would also fire — acceptable, the message stays
  // positive). Fail-soft email — never blocks the admin action.
  if (!wasVerified) {
    const baseUrl = env.AUTH_URL.replace(/\/$/, '')
    const email = buildListingVerifiedEmail(
      fromPrismaLocale(listing.owner.locale),
      {
        recipientName: listing.owner.name ?? 'Propriétaire',
        listingTitle: listing.title,
        listingUrl: `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`,
      },
    )
    void sendTransactionalEmail({
      recipientId: listing.owner.id,
      recipientEmail: listing.owner.email,
      eventType: 'listing-verified',
      ...email,
    })
  }

  return { nowVerified: !wasVerified }
}

export async function unverifyListing(
  adminId: string,
  listingId: string,
): Promise<VerifyListingResult> {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, verifiedAt: true },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')
  if (!listing.verifiedAt) return { nowVerified: false } // already unverified

  await prisma.listing.update({
    where: { id: listing.id },
    data: {
      verifiedAt: null,
      // Keep `verifiedBy` so the audit trail survives a re-toggle cycle;
      // it gets overwritten the next time someone verifies.
      verifiedBy: adminId,
    },
  })
  return { nowVerified: false }
}
