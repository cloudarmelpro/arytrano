import 'server-only'
import { prisma } from '@/lib/db'

export type AlertsStats = {
  total: number
  byLocale: { 'fr-MG': number; mg: number }
  byQuartier: Array<{ quartierSlug: string | null; count: number }>
  unsubscribed: number
  /** Subscribers added in the last 7 days. */
  newThisWeek: number
}

/**
 * Aggregate counts for the admin broadcast dashboard header.
 * Active subscribers only (unsubscribed excluded from byLocale +
 * byQuartier); a separate `unsubscribed` count is exposed for the
 * audit-trail KPI.
 */
export async function getAlertsStats(): Promise<AlertsStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [total, byLocaleRaw, byQuartierRaw, unsubscribed, newThisWeek] =
    await Promise.all([
      prisma.whatsAppAlert.count({ where: { unsubscribedAt: null } }),
      prisma.whatsAppAlert.groupBy({
        by: ['locale'],
        where: { unsubscribedAt: null },
        _count: { _all: true },
      }),
      prisma.whatsAppAlert.groupBy({
        by: ['quartierSlug'],
        where: { unsubscribedAt: null },
        _count: { _all: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.whatsAppAlert.count({
        where: { unsubscribedAt: { not: null } },
      }),
      prisma.whatsAppAlert.count({
        where: {
          unsubscribedAt: null,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ])

  const byLocale: AlertsStats['byLocale'] = { 'fr-MG': 0, mg: 0 }
  for (const row of byLocaleRaw) {
    if (row.locale === 'fr-MG' || row.locale === 'mg') {
      byLocale[row.locale] = row._count._all
    }
  }

  return {
    total,
    byLocale,
    byQuartier: byQuartierRaw.map((r) => ({
      quartierSlug: r.quartierSlug,
      count: r._count._all,
    })),
    unsubscribed,
    newThisWeek,
  }
}
