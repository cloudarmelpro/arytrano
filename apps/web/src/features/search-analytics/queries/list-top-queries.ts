import 'server-only'
import { prisma } from '@/lib/db'

export type QueryRow = {
  q: string
  count: number
  avgResultCount: number
}

/**
 * ANA-09 — top N queries by frequency in the last `days` days.
 * Group by `q`. Includes the average result count so admins can spot
 * "trending but zero-result" queries first.
 */
export async function listTopSearchQueries(input: {
  days: number
  limit: number
  onlyZeroResult?: boolean
}): Promise<QueryRow[]> {
  const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000)
  const rows = await prisma.searchQuery.groupBy({
    by: ['q'],
    where: {
      createdAt: { gte: since },
      ...(input.onlyZeroResult ? { resultCount: 0 } : {}),
    },
    _count: { _all: true },
    _avg: { resultCount: true },
    orderBy: { _count: { q: 'desc' } },
    take: input.limit,
  })
  return rows.map((r) => ({
    q: r.q,
    count: r._count._all,
    avgResultCount: Math.round(r._avg.resultCount ?? 0),
  }))
}
