import 'server-only'
import { prisma } from '@/lib/db'

export type OwnerDigestListing = {
  id: string
  title: string
  citySlug: string
  neighborhoodSlug: string
  slug: string
  status: string
  views7d: number
  favorites7d: number
  contacts7d: number
  expiresAt: Date | null
}

export type OwnerWeeklyDigestPayload = {
  ownerId: string
  email: string
  name: string | null
  locale: string
  totals: {
    publishedListings: number
    views7d: number
    favorites7d: number
    contacts7d: number
    expiringSoon: number
  }
  topListings: OwnerDigestListing[]
  windowStart: Date
  windowEnd: Date
}

/**
 * OWN-04 — computes the per-owner weekly snapshot for the Monday
 * digest. Returns null when the owner has zero PUBLISHED listings so
 * we don't email inactive users. Owners who opted out of
 * leaseUpdatesEnabled are excluded by the sender, not here.
 *
 * All counts use `> windowStart` to include today's activity so a
 * Monday 08:00 send accurately reports "last 7 days of ops".
 */
const WINDOW_DAYS = 7
const EXPIRING_HORIZON_DAYS = 10 // gently pre-warn owners

export async function listOwnersDueDigest(): Promise<string[]> {
  const rows = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      leaseUpdatesEnabled: true,
      emailDisabledAt: null,
      listings: { some: { status: 'PUBLISHED' } },
    },
    select: { id: true },
  })
  return rows.map((r) => r.id)
}

export async function computeOwnerWeeklyDigest(
  ownerId: string,
): Promise<OwnerWeeklyDigestPayload | null> {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { id: true, email: true, name: true, locale: true },
  })
  if (!owner) return null

  const now = new Date()
  const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const expiringHorizon = new Date(
    now.getTime() + EXPIRING_HORIZON_DAYS * 24 * 60 * 60 * 1000,
  )

  const listings = await prisma.listing.findMany({
    where: { ownerId, status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      expiresAt: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
      _count: {
        select: {
          views: { where: { createdAt: { gte: windowStart } } },
          favorites: { where: { createdAt: { gte: windowStart } } },
          contactEvents: { where: { createdAt: { gte: windowStart } } },
        },
      },
    },
  })

  if (listings.length === 0) return null

  const rows: OwnerDigestListing[] = listings.map((l) => ({
    id: l.id,
    title: l.title,
    citySlug: l.city.slug,
    neighborhoodSlug: l.neighborhood.slug,
    slug: l.slug,
    status: l.status,
    views7d: l._count.views,
    favorites7d: l._count.favorites,
    contacts7d: l._count.contactEvents,
    expiresAt: l.expiresAt,
  }))

  const totals = rows.reduce(
    (acc, r) => {
      acc.publishedListings += 1
      acc.views7d += r.views7d
      acc.favorites7d += r.favorites7d
      acc.contacts7d += r.contacts7d
      if (r.expiresAt && r.expiresAt <= expiringHorizon) acc.expiringSoon += 1
      return acc
    },
    {
      publishedListings: 0,
      views7d: 0,
      favorites7d: 0,
      contacts7d: 0,
      expiringSoon: 0,
    },
  )

  // Rank top 3 by contacts7d desc then views7d desc — the owner cares
  // about "who's ringing my phone" first.
  const topListings = [...rows]
    .sort((a, b) =>
      b.contacts7d !== a.contacts7d
        ? b.contacts7d - a.contacts7d
        : b.views7d - a.views7d,
    )
    .slice(0, 3)

  return {
    ownerId: owner.id,
    email: owner.email,
    name: owner.name,
    locale: owner.locale,
    totals,
    topListings,
    windowStart,
    windowEnd: now,
  }
}
