import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildListingPublishedEmail } from '@/lib/email/templates/listing-published'
import { ownerTermsAcceptedFor } from '@/features/auth/server'
import { notifySavedSearchMatches } from '@/features/search/server'

/**
 * Listing TTL — 60 days from publication (T-049). Past this date the
 * daily cron flips the listing to UNAVAILABLE and emails the owner.
 * The owner can extend with one click from the dashboard, which sets
 * a fresh `expiresAt` 60 days out and clears `expirationAlertSentAt`.
 */
export const LISTING_TTL_DAYS = 60
export const LISTING_TTL_MS = LISTING_TTL_DAYS * 24 * 60 * 60 * 1000

/**
 * DRAFT → PUBLISHED. Validates the listing has the minimum required content:
 *   - title, description (already enforced by schema at create/update time)
 *   - priceMonthlyMGA > 0
 *   - cityId, neighborhoodId
 *   - at least 1 photo
 * Owner-only.
 *
 * Side effect on PUBLISH (T-034): owner gets a "Annonce publiée" email.
 * The send is fire-and-forget (`sendTransactionalEmail` is fail-soft) so a
 * down SMTP relay never blocks the publish flow.
 */
export async function publishListing(ownerId: string, listingId: string): Promise<Listing> {
  // Audit Archi H-1 (2026-05-29) — Owner Terms gate. The dashboard
  // layout redirects unaccepted owners but a mobile bearer call to
  // POST /api/v1/listings/:id/publish would otherwise bypass it.
  if (!(await ownerTermsAcceptedFor(ownerId))) {
    throw errors.conflict(
      'Tu dois accepter les Conditions d’utilisation Propriétaire avant de publier une annonce.',
    )
  }

  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      type: true,
      amenities: true,
      priceMonthlyMGA: true,
      cityId: true,
      neighborhoodId: true,
      status: true,
      city: { select: { slug: true, nameFr: true, nameMg: true } },
      neighborhood: {
        select: { slug: true, nameFr: true, nameMg: true },
      },
      owner: { select: { id: true, email: true, name: true, locale: true } },
      _count: { select: { photos: true } },
    },
  })
  if (!listing) throw errors.notFound('Annonce introuvable')

  if (listing.status === 'PUBLISHED') {
    return prisma.listing.findUniqueOrThrow({ where: { id: listingId } })
  }
  if (listing.status === 'SUSPENDED') {
    throw errors.forbidden('Annonce suspendue par la modération — contacte le support')
  }

  if (!listing.title || listing.title.length < 5) {
    throw errors.validation('Titre manquant ou trop court')
  }
  if (!listing.description || listing.description.length < 20) {
    throw errors.validation('Description manquante ou trop courte')
  }
  if (listing.priceMonthlyMGA <= 0) {
    throw errors.validation('Prix invalide')
  }
  if (listing._count.photos < 1) {
    throw errors.validation('Ajoute au moins 1 photo avant de publier')
  }

  const now = new Date()
  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: now,
      // T-049 — start the 60-day TTL on first publish. Re-publishing
      // (after auto-expire or owner-toggle UNAVAILABLE→PUBLISHED) also
      // resets the clock here, which is what the user expects.
      expiresAt: new Date(now.getTime() + LISTING_TTL_MS),
      // Fresh publish = fresh warning window. Cron will alert the
      // owner 7 days before this new expiresAt.
      expirationAlertSentAt: null,
    },
  })

  // T-034: fire-and-forget owner email. `sendTransactionalEmail` is
  // fail-soft (never throws), so we don't need a try/catch — a failing
  // SMTP relay won't block the publish flow.
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const email = buildListingPublishedEmail(fromPrismaLocale(listing.owner.locale), {
    recipientName: listing.owner.name ?? 'Propriétaire',
    listingTitle: listing.title,
    listingUrl: `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`,
    dashboardUrl: `${baseUrl}/dashboard/listings`,
  })
  void sendTransactionalEmail({
    recipientId: listing.owner.id,
    recipientEmail: listing.owner.email,
    eventType: 'listing-published',
    ...email,
  })

  // E-T22 push fanout — notify every saved-search subscriber whose
  // filters match this newly-published listing. Fire-and-forget,
  // never blocks the publish flow (errors swallowed internally).
  void notifySavedSearchMatches({
    id: listing.id,
    slug: listing.slug,
    ownerId: listing.owner.id,
    type: listing.type,
    priceMonthlyMGA: listing.priceMonthlyMGA,
    title: listing.title,
    description: listing.description,
    amenities: listing.amenities,
    city: { slug: listing.city.slug },
    neighborhood: { slug: listing.neighborhood.slug },
    // E-T09 — localized labels used by the email fallback for web-only
    // subscribers (push subscribers get a generic body — see Security
    // P1-2 in notify-saved-search-matches).
    cityNameFr: listing.city.nameFr,
    cityNameMg: listing.city.nameMg,
    neighborhoodNameFr: listing.neighborhood.nameFr,
    neighborhoodNameMg: listing.neighborhood.nameMg,
  })

  return updated
}
