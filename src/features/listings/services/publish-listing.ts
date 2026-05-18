import 'server-only'
import type { Listing } from '@prisma/client'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildListingPublishedEmail } from '@/lib/email/templates/listing-published'

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
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, ownerId, status: { not: 'DELETED' } },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      priceMonthlyMGA: true,
      cityId: true,
      neighborhoodId: true,
      status: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
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

  const updated = await prisma.listing.update({
    where: { id: listing.id },
    data: { status: 'PUBLISHED', publishedAt: new Date() },
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

  return updated
}
