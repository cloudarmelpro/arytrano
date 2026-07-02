import 'server-only'
import { prisma } from '@/lib/db'

export type InactiveOwnerRow = {
  ownerId: string
  name: string | null
  email: string
  listingCount: number
  publishedSince: Date | null
}

const INACTIVITY_DAYS = 30

/**
 * TRU-15 — surface owners who have PUBLISHED listings but received
 * zero contacts in the last 30 days. Signal is ambiguous : could be
 * price too high, wrong photo, wrong quartier, dead listing that
 * should be UNAVAILABLE. Admin can decide whether to reach out or
 * suggest the owner refresh the listing.
 */
export async function detectInactiveOwners(): Promise<InactiveOwnerRow[]> {
  const cutoff = new Date(Date.now() - INACTIVITY_DAYS * 24 * 60 * 60 * 1000)

  // Owners with at least one PUBLISHED listing.
  const owners = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      listings: { some: { status: 'PUBLISHED' } },
    },
    select: {
      id: true,
      name: true,
      email: true,
      _count: { select: { listings: { where: { status: 'PUBLISHED' } } } },
      listings: {
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'asc' },
        take: 1,
        select: { publishedAt: true },
      },
    },
  })

  if (owners.length === 0) return []

  // Fetch contact events for these owners in the window.
  const active = await prisma.contactEvent.groupBy({
    by: ['listingId'],
    where: { createdAt: { gte: cutoff } },
    _count: true,
  })
  const listingsWithContacts = new Set(active.map((r) => r.listingId))

  // Now pull ownerIds for listings-with-contact.
  const contactedListings = await prisma.listing.findMany({
    where: {
      id: { in: Array.from(listingsWithContacts) },
    },
    select: { ownerId: true },
  })
  const ownersWithContact = new Set(contactedListings.map((l) => l.ownerId))

  return owners
    .filter((o) => !ownersWithContact.has(o.id))
    .map((o) => ({
      ownerId: o.id,
      name: o.name,
      email: o.email,
      listingCount: o._count.listings,
      publishedSince: o.listings[0]?.publishedAt ?? null,
    }))
    .sort(
      (a, b) =>
        (a.publishedSince?.getTime() ?? Infinity) -
        (b.publishedSince?.getTime() ?? Infinity),
    )
}
