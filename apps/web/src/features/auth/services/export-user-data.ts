import 'server-only'
import { prisma } from '@/lib/db'

/**
 * RGPD-aligned data export (T-052). Collects every piece of personal
 * data + user-owned content tied to a user id, formatted as a single
 * JSON object the user can download from /dashboard/settings.
 *
 * Scope rules :
 *   - Profile fields the user controls (email, name, phone, locale,
 *     image, role, status, dates).
 *   - Listings authored by the user (titles, descriptions, prices —
 *     anything they typed).
 *   - Reviews the user wrote + the owner responses on them (their
 *     own words echoed back).
 *   - Favorites (which listings the user marked).
 *   - Saved searches, quiz submissions, WhatsApp alert subscription.
 *   - Recent login events (last 50) — useful for audit.
 *
 * Out of scope (deliberately) :
 *   - Hashed password, TOTP secret, recovery code hashes — those are
 *     not personal data, they're proofs of identity. Exposing them
 *     would weaken the account, not empower the user.
 *   - Other users' data (a review the user RECEIVED is hidden because
 *     the review author would also have an export claim on it).
 *   - Internal cuids when there's a human-readable equivalent (the
 *     listing slug + city slug, the quartier slug, etc.).
 *
 * Returns a plain object — caller stringifies it. We keep this pure
 * to make unit testing trivial.
 */
export type UserDataExport = {
  schemaVersion: 1
  exportedAt: string
  user: {
    id: string
    email: string
    emailVerified: string | null
    name: string | null
    phone: string | null
    image: string | null
    locale: string
    role: string
    status: string
    contactNotificationsEnabled: boolean
    createdAt: string
    updatedAt: string
  }
  listings: Array<{
    id: string
    slug: string
    title: string
    description: string
    type: string
    priceMonthlyMGA: number
    status: string
    citySlug: string
    neighborhoodSlug: string
    amenities: string[]
    publishedAt: string | null
    expiresAt: string | null
    createdAt: string
  }>
  reviews: Array<{
    listingSlug: string
    citySlug: string
    rating: number
    body: string
    verifiedStay: boolean
    ownerResponse: string | null
    createdAt: string
    updatedAt: string
  }>
  favorites: Array<{
    listingSlug: string
    citySlug: string
    createdAt: string
  }>
  savedSearches: Array<{
    name: string
    filters: Record<string, unknown>
    alertsOn: boolean
    createdAt: string
  }>
  quizSubmissions: Array<{
    locale: string
    answers: Record<string, unknown>
    recommendedSlugs: string[]
    createdAt: string
  }>
  whatsAppAlert: {
    phoneE164: string
    locale: string
    quartierSlug: string | null
    unsubscribedAt: string | null
    createdAt: string
  } | null
  loginEvents: Array<{
    occurredAt: string
    authMethod: string
    browser: string | null
    os: string | null
  }>
}

export async function exportUserData(userId: string): Promise<UserDataExport> {
  const [
    user,
    listings,
    reviews,
    favorites,
    savedSearches,
    quizSubmissions,
    whatsAppAlert,
    loginEvents,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        phone: true,
        image: true,
        locale: true,
        role: true,
        status: true,
        contactNotificationsEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.listing.findMany({
      where: { ownerId: userId, status: { not: 'DELETED' } },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        type: true,
        priceMonthlyMGA: true,
        status: true,
        amenities: true,
        publishedAt: true,
        expiresAt: true,
        createdAt: true,
        city: { select: { slug: true } },
        neighborhood: { select: { slug: true } },
      },
    }),
    prisma.review.findMany({
      where: { authorId: userId },
      select: {
        rating: true,
        body: true,
        verifiedStay: true,
        ownerResponse: true,
        createdAt: true,
        updatedAt: true,
        listing: {
          select: {
            slug: true,
            city: { select: { slug: true } },
          },
        },
      },
    }),
    prisma.favorite.findMany({
      where: { userId },
      select: {
        createdAt: true,
        listing: {
          select: {
            slug: true,
            city: { select: { slug: true } },
          },
        },
      },
    }),
    prisma.savedSearch.findMany({
      where: { userId },
      select: {
        name: true,
        filters: true,
        alertsOn: true,
        createdAt: true,
      },
    }),
    // QuizSubmission only links via email — the quiz flow accepts an
    // optional email at the end. We query both User.email and any
    // alternate emails the user might have used (none today). Empty
    // array if the user never finished the quiz with their email.
    prisma.user
      .findUnique({ where: { id: userId }, select: { email: true } })
      .then((u) =>
        u?.email
          ? prisma.quizSubmission.findMany({
              where: { email: u.email },
              select: {
                locale: true,
                answers: true,
                recommendedSlugs: true,
                createdAt: true,
              },
            })
          : [],
      ),
    // WhatsApp alert is keyed by phone, not userId — we can only
    // match it by the phone the user has on profile. If they
    // subscribed before adding their phone, we can't reliably link.
    prisma.user
      .findUnique({ where: { id: userId }, select: { phone: true } })
      .then(async (u) => {
        if (!u?.phone) return null
        return prisma.whatsAppAlert.findUnique({
          where: { phoneE164: u.phone.startsWith('+') ? u.phone : `+${u.phone}` },
          select: {
            phoneE164: true,
            locale: true,
            quartierSlug: true,
            unsubscribedAt: true,
            createdAt: true,
          },
        })
      }),
    prisma.loginEvent.findMany({
      where: { userId },
      orderBy: { occurredAt: 'desc' },
      take: 50,
      select: {
        occurredAt: true,
        authMethod: true,
        browser: true,
        os: true,
      },
    }),
  ])

  if (!user) {
    throw new Error('User not found')
  }

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      name: user.name,
      phone: user.phone,
      image: user.image,
      locale: user.locale,
      role: user.role,
      status: user.status,
      contactNotificationsEnabled: user.contactNotificationsEnabled,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    listings: listings.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      description: l.description,
      type: l.type,
      priceMonthlyMGA: l.priceMonthlyMGA,
      status: l.status,
      citySlug: l.city.slug,
      neighborhoodSlug: l.neighborhood.slug,
      amenities: l.amenities,
      publishedAt: l.publishedAt?.toISOString() ?? null,
      expiresAt: l.expiresAt?.toISOString() ?? null,
      createdAt: l.createdAt.toISOString(),
    })),
    reviews: reviews.map((r) => ({
      listingSlug: r.listing.slug,
      citySlug: r.listing.city.slug,
      rating: r.rating,
      body: r.body,
      verifiedStay: r.verifiedStay,
      ownerResponse: r.ownerResponse,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    favorites: favorites.map((f) => ({
      listingSlug: f.listing.slug,
      citySlug: f.listing.city.slug,
      createdAt: f.createdAt.toISOString(),
    })),
    savedSearches: savedSearches.map((s) => ({
      name: s.name,
      filters: s.filters as Record<string, unknown>,
      alertsOn: s.alertsOn,
      createdAt: s.createdAt.toISOString(),
    })),
    quizSubmissions: quizSubmissions.map((q) => ({
      locale: q.locale,
      answers: q.answers as Record<string, unknown>,
      recommendedSlugs: q.recommendedSlugs,
      createdAt: q.createdAt.toISOString(),
    })),
    whatsAppAlert: whatsAppAlert
      ? {
          phoneE164: whatsAppAlert.phoneE164,
          locale: whatsAppAlert.locale,
          quartierSlug: whatsAppAlert.quartierSlug,
          unsubscribedAt: whatsAppAlert.unsubscribedAt?.toISOString() ?? null,
          createdAt: whatsAppAlert.createdAt.toISOString(),
        }
      : null,
    loginEvents: loginEvents.map((e) => ({
      occurredAt: e.occurredAt.toISOString(),
      authMethod: e.authMethod,
      browser: e.browser,
      os: e.os,
    })),
  }
}
