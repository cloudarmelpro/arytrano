import 'server-only'
import { prisma } from '@/lib/db'

/**
 * ADM-09 — monthly reporting export. Aggregates the twelve months
 * ending in the given anchor month; one CSV row per month covering
 * signups / DAU / new listings / contacts / leases / payments.
 * Investor-friendly shape (comma-separated, UTF-8, YYYY-MM row key).
 */
export async function buildMonthlyStatsCsv(anchor: Date = new Date()): Promise<string> {
  const rows: Array<{
    ym: string
    from: Date
    to: Date
  }> = []
  const anchorMonth = new Date(
    Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1),
  )
  for (let i = 11; i >= 0; i--) {
    const from = new Date(
      Date.UTC(anchorMonth.getUTCFullYear(), anchorMonth.getUTCMonth() - i, 1),
    )
    const to = new Date(
      Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1),
    )
    rows.push({
      ym: `${from.getUTCFullYear()}-${String(from.getUTCMonth() + 1).padStart(2, '0')}`,
      from,
      to,
    })
  }

  const lines: string[] = [
    'month,signups,new_listings_published,contacts,leases_initiated,leases_activated,payments_confirmed_ar,payments_refunded_ar',
  ]

  for (const r of rows) {
    const [
      signups,
      newListings,
      contacts,
      leasesInit,
      leasesActive,
      paidAgg,
      refundedAgg,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: r.from, lt: r.to } },
      }),
      prisma.listing.count({
        where: {
          status: 'PUBLISHED',
          publishedAt: { gte: r.from, lt: r.to },
        },
      }),
      prisma.contactEvent.count({
        where: { createdAt: { gte: r.from, lt: r.to } },
      }),
      prisma.lease.count({
        where: { createdAt: { gte: r.from, lt: r.to } },
      }),
      prisma.lease.count({
        where: {
          status: 'ACTIVE',
          tenantSignedAt: { gte: r.from, lt: r.to },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amountMGA: true },
        where: {
          status: 'CONFIRMED',
          completedAt: { gte: r.from, lt: r.to },
        },
      }),
      prisma.payment.aggregate({
        _sum: { amountMGA: true },
        where: {
          status: 'REFUNDED',
          refundedAt: { gte: r.from, lt: r.to },
        },
      }),
    ])
    lines.push(
      [
        r.ym,
        signups,
        newListings,
        contacts,
        leasesInit,
        leasesActive,
        paidAgg._sum.amountMGA ?? 0,
        refundedAgg._sum.amountMGA ?? 0,
      ].join(','),
    )
  }
  return lines.join('\n') + '\n'
}
