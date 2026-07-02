import 'server-only'
import { prisma } from '@/lib/db'

export type DuplicateCandidate = {
  id: string
  title: string
  ownerId: string
  ownerEmail: string
  ownerName: string | null
  status: string
  citySlug: string
  neighborhoodSlug: string
  slug: string
}

export type DuplicateGroup = {
  key: string
  reason: 'same-title' | 'same-phone'
  listings: DuplicateCandidate[]
}

/**
 * TRU-07 — surface duplicate-listing groups for admin review. We
 * detect two shapes: (a) identical normalized title across two or
 * more PUBLISHED listings by DIFFERENT owners — usually a copy-paste
 * scam attempting to piggyback on a real listing's photos. (b) same
 * owner phone reused across N listings past a threshold — legitimate
 * multi-property owners exist, but a spike is worth reviewing.
 */
export async function findDuplicateGroups(): Promise<DuplicateGroup[]> {
  const listings = await prisma.listing.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      id: true,
      title: true,
      slug: true,
      ownerId: true,
      status: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
      owner: { select: { name: true, email: true, phone: true } },
    },
  })

  // --- Group by normalized title ---------------------------------
  const byTitle = new Map<string, DuplicateCandidate[]>()
  for (const l of listings) {
    const key = normalizeTitle(l.title)
    if (key.length < 12) continue
    const arr = byTitle.get(key) ?? []
    arr.push({
      id: l.id,
      title: l.title,
      slug: l.slug,
      ownerId: l.ownerId,
      ownerEmail: l.owner.email,
      ownerName: l.owner.name,
      status: l.status,
      citySlug: l.city.slug,
      neighborhoodSlug: l.neighborhood.slug,
    })
    byTitle.set(key, arr)
  }

  const titleGroups: DuplicateGroup[] = []
  for (const [key, arr] of byTitle.entries()) {
    const uniqueOwners = new Set(arr.map((a) => a.ownerId))
    if (arr.length >= 2 && uniqueOwners.size >= 2) {
      titleGroups.push({ key, reason: 'same-title', listings: arr })
    }
  }

  // --- Group by owner phone with a spike threshold ---------------
  const byPhone = new Map<string, DuplicateCandidate[]>()
  for (const l of listings) {
    const phone = l.owner.phone?.trim()
    if (!phone) continue
    const arr = byPhone.get(phone) ?? []
    arr.push({
      id: l.id,
      title: l.title,
      slug: l.slug,
      ownerId: l.ownerId,
      ownerEmail: l.owner.email,
      ownerName: l.owner.name,
      status: l.status,
      citySlug: l.city.slug,
      neighborhoodSlug: l.neighborhood.slug,
    })
    byPhone.set(phone, arr)
  }
  const PHONE_SPIKE_THRESHOLD = 6
  const phoneGroups: DuplicateGroup[] = []
  for (const [key, arr] of byPhone.entries()) {
    if (arr.length >= PHONE_SPIKE_THRESHOLD) {
      phoneGroups.push({ key: `phone:${key}`, reason: 'same-phone', listings: arr })
    }
  }

  return [...titleGroups, ...phoneGroups]
}

function normalizeTitle(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
