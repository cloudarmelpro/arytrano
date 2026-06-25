import 'server-only'
import { prisma } from '@/lib/db'

/**
 * T-058 — owner dashboard view stats for a single listing.
 *
 * Returns the 7-day + 30-day totals + a per-day breakdown for the
 * dashboard sparkline. One round-trip (groupBy by day) so it stays
 * cheap even when the owner has dozens of listings.
 *
 * Indexed via `Listing.@@index([listingId, createdAt(sort: Desc)])`.
 */

export type ListingViewStats = {
  views7d: number
  views30d: number
  // Per-day view counts, oldest first, 7 entries. Days with 0 views
  // are filled to keep the sparkline width constant.
  series7d: Array<{ day: string; count: number }>
}

const DAY_MS = 24 * 60 * 60 * 1000

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10) // YYYY-MM-DD UTC
}

export async function getListingViewStats(
  listingId: string,
): Promise<ListingViewStats> {
  const now = new Date()
  const start30d = new Date(now.getTime() - 30 * DAY_MS)
  const start7d = new Date(now.getTime() - 7 * DAY_MS)

  const rows = await prisma.listingView.findMany({
    where: { listingId, createdAt: { gte: start30d } },
    select: { createdAt: true },
  })

  let views30d = 0
  let views7d = 0
  const perDay = new Map<string, number>()
  for (const r of rows) {
    views30d += 1
    if (r.createdAt >= start7d) {
      views7d += 1
      const k = dayKey(r.createdAt)
      perDay.set(k, (perDay.get(k) ?? 0) + 1)
    }
  }

  // Fill the 7 days so the sparkline stays a fixed width even when
  // some days have zero views.
  const series7d: ListingViewStats['series7d'] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS)
    const k = dayKey(d)
    series7d.push({ day: k, count: perDay.get(k) ?? 0 })
  }

  return { views7d, views30d, series7d }
}
