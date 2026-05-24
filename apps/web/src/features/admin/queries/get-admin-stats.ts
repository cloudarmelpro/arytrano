import 'server-only'
import { prisma } from '@/lib/db'

export type AdminStats = {
  listings: {
    total: number
    DRAFT: number
    PUBLISHED: number
    UNAVAILABLE: number
    SUSPENDED: number
    DELETED: number
  }
  reports: {
    open: number
  }
  users: {
    total: number
    OWNER: number
    STUDENT: number
    ADMIN: number
  }
}

/**
 * Aggregate counts for the admin overview dashboard.
 *
 * Uses `groupBy` to avoid issuing one query per status — each `groupBy`
 * returns at most ~5 rows so the cost is bounded. Fail-safe: missing
 * statuses (e.g. SUSPENDED with zero rows) get coerced to 0.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [listingsByStatus, openReports, usersByRole] = await Promise.all([
    prisma.listing.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { _all: true },
      where: { status: 'ACTIVE' },
    }),
  ])

  const listings = {
    total: 0,
    DRAFT: 0,
    PUBLISHED: 0,
    UNAVAILABLE: 0,
    SUSPENDED: 0,
    DELETED: 0,
  }
  for (const row of listingsByStatus) {
    const c = row._count._all
    listings[row.status] = c
    listings.total += c
  }

  const users = { total: 0, OWNER: 0, STUDENT: 0, ADMIN: 0 }
  for (const row of usersByRole) {
    const c = row._count._all
    users[row.role] = c
    users.total += c
  }

  return {
    listings,
    reports: { open: openReports },
    users,
  }
}
