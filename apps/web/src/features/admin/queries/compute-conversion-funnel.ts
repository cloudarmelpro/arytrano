import 'server-only'
import { prisma } from '@/lib/db'

/**
 * ANA-04 — five-step conversion funnel (view → contact → lead → lease
 * initiated → lease active). Aggregates across the last 60 days.
 * The counts are absolute — the UI can compute drop-off percentages.
 */
export type ConversionFunnel = {
  windowDays: number
  views: number
  contacts: number
  leads: number
  leasesInitiated: number
  leasesActive: number
}

export async function computeConversionFunnel(
  windowDays = 60,
): Promise<ConversionFunnel> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)
  const [views, contacts, leads, leasesInit, leasesActive] = await Promise.all([
    prisma.listingView.count({ where: { createdAt: { gte: since } } }),
    prisma.contactEvent.count({ where: { createdAt: { gte: since } } }),
    prisma.leadRequest.count({ where: { createdAt: { gte: since } } }),
    prisma.lease.count({ where: { createdAt: { gte: since } } }),
    prisma.lease.count({
      where: {
        status: 'ACTIVE',
        tenantSignedAt: { gte: since },
      },
    }),
  ])
  return {
    windowDays,
    views,
    contacts,
    leads,
    leasesInitiated: leasesInit,
    leasesActive,
  }
}
