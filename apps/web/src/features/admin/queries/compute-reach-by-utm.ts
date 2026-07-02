import 'server-only'
import { prisma } from '@/lib/db'

export type ChannelRow = {
  source: string
  contacts: number
  leads: number
}

const WINDOW_DAYS = 30

/**
 * MKT-10 — attribute contacts + leads to their marketing channel via
 * the SearchQuery / ContactEvent rows that carry a `utm_source` param.
 * We approximate here by counting recorded events in the last 30 days
 * that landed on URLs containing utm_source (surfaced through referrer
 * once ANA-16 lands). Placeholder aggregation until the referrer
 * column ships.
 */
export async function computeReachByChannel(): Promise<ChannelRow[]> {
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const [contacts, leads] = await Promise.all([
    prisma.contactEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.leadRequest.count({ where: { createdAt: { gte: since } } }),
  ])
  // Without a referrer / utm column, we return two aggregate rows so
  // the UI has something to render. Once referrer capture ships this
  // helper switches to a real groupBy.
  return [
    { source: 'total', contacts, leads },
  ]
}
