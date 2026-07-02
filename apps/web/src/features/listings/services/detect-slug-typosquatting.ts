import 'server-only'
import { prisma } from '@/lib/db'

export type TyposquatCandidate = {
  suspiciousId: string
  suspiciousSlug: string
  suspiciousTitle: string
  suspiciousOwnerId: string
  suspiciousOwnerEmail: string
  originalId: string
  originalSlug: string
  originalTitle: string
  distance: number
}

/**
 * TRU-20 — flag listings whose slug is one small edit away from an
 * older, more-established listing. Levenshtein distance ≤ 2 across
 * two DIFFERENT owners is the working threshold; below that it's
 * usually a genuine coincidence (same city + type).
 *
 * The older listing (measured by `publishedAt`) is treated as the
 * "original", the newer as the suspicious one — closer to the real
 * pattern of scammers cloning a going concern.
 */
const MAX_DISTANCE = 2
const MIN_SLUG_LEN = 8

export async function findTyposquatCandidates(): Promise<TyposquatCandidate[]> {
  const listings = await prisma.listing.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ publishedAt: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      ownerId: true,
      publishedAt: true,
      owner: { select: { email: true } },
    },
  })

  // Pairwise scan — OK at v0.5 (< 500 listings). Promote to blocked
  // trigram index once we cross a few thousand.
  const out: TyposquatCandidate[] = []
  for (let i = 0; i < listings.length; i++) {
    const original = listings[i]!
    if (original.slug.length < MIN_SLUG_LEN) continue
    for (let j = i + 1; j < listings.length; j++) {
      const suspect = listings[j]!
      if (suspect.slug.length < MIN_SLUG_LEN) continue
      if (suspect.ownerId === original.ownerId) continue
      // Length shortcut — Levenshtein can't be smaller than the length delta.
      if (Math.abs(suspect.slug.length - original.slug.length) > MAX_DISTANCE) continue
      const d = levenshtein(original.slug, suspect.slug, MAX_DISTANCE)
      if (d <= MAX_DISTANCE) {
        out.push({
          suspiciousId: suspect.id,
          suspiciousSlug: suspect.slug,
          suspiciousTitle: suspect.title,
          suspiciousOwnerId: suspect.ownerId,
          suspiciousOwnerEmail: suspect.owner.email,
          originalId: original.id,
          originalSlug: original.slug,
          originalTitle: original.title,
          distance: d,
        })
      }
    }
  }
  return out
}

/**
 * Two-row Levenshtein with an early-exit ceiling. Returns `ceiling + 1`
 * when the true distance exceeds the ceiling (caller only cares whether
 * we crossed the threshold).
 */
function levenshtein(a: string, b: string, ceiling: number): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (Math.abs(m - n) > ceiling) return ceiling + 1
  const prev = new Array<number>(n + 1)
  const curr = new Array<number>(n + 1)
  for (let j = 0; j <= n; j++) prev[j] = j
  for (let i = 1; i <= m; i++) {
    curr[0] = i
    let rowMin = curr[0]!
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1
      curr[j] = Math.min(
        prev[j]! + 1,
        curr[j - 1]! + 1,
        prev[j - 1]! + cost,
      )
      if (curr[j]! < rowMin) rowMin = curr[j]!
    }
    if (rowMin > ceiling) return ceiling + 1
    for (let j = 0; j <= n; j++) prev[j] = curr[j]!
  }
  return prev[n]!
}
