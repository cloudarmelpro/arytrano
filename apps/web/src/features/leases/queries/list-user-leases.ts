import 'server-only'
import { prisma } from '@/lib/db'
import type { LeaseStatus, Prisma } from '@prisma/client'

/**
 * List leases where the user is owner OR tenant. Used by the
 * `/dashboard/leases` page to populate the visitor's lease inbox.
 *
 * Caller can scope the query to a specific role and/or status:
 *   listUserLeases(userId)                     — all roles, all statuses
 *   listUserLeases(userId, { role: 'OWNER' })  — owner-side only
 *   listUserLeases(userId, { status: 'PENDING_TENANT' })
 *
 * PERF-H3 audit fix — when no role is specified, we run TWO parallel
 * queries (one per role) and merge in JS instead of `OR: [ownerId, tenantId]`.
 * Reason: an OR across two FK columns cannot use the composite indexes
 * `@@index([ownerId, status])` or `@@index([tenantId, status])` — Postgres
 * either bitmap-ORs two index scans (acceptable on small tables) or
 * degrades to a sequential scan as the Lease table grows. Splitting the
 * query keeps both sides index-covered and scales linearly.
 */

export type ListLeasesOptions = {
  role?: 'OWNER' | 'TENANT'
  status?: LeaseStatus | ReadonlyArray<LeaseStatus>
  limit?: number
}

const LEASE_SELECT = {
  id: true,
  status: true,
  monthlyRentMGA: true,
  cautionMGA: true,
  startDate: true,
  durationMonths: true,
  ownerSignedAt: true,
  tenantSignedAt: true,
  createdAt: true,
  listing: {
    select: { id: true, title: true, slug: true },
  },
  // PERF-M4 audit fix — drop `email` from the list select. The list UI
  // only needs `name` (with a generic localized fallback for null
  // names); pulling email leaks PII into memory + transfer for no
  // visible benefit. The lease detail page still fetches email
  // separately when the visitor actually opens a row.
  owner: { select: { id: true, name: true } },
  tenant: { select: { id: true, name: true } },
} satisfies Prisma.LeaseSelect

function applyStatus(
  where: Prisma.LeaseWhereInput,
  status: ListLeasesOptions['status'],
): Prisma.LeaseWhereInput {
  if (!status) return where
  if (Array.isArray(status)) {
    return { ...where, status: { in: [...status] as LeaseStatus[] } }
  }
  return { ...where, status: status as LeaseStatus }
}

export async function listUserLeases(
  userId: string,
  options: ListLeasesOptions = {},
) {
  const limit = options.limit ?? 50

  // Single-role path — one indexed query, return as-is.
  if (options.role === 'OWNER' || options.role === 'TENANT') {
    const where = applyStatus(
      options.role === 'OWNER'
        ? { ownerId: userId }
        : { tenantId: userId },
      options.status,
    )
    return prisma.lease.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: LEASE_SELECT,
    })
  }

  // Both-roles path — two parallel indexed queries, merge + re-sort + trim.
  // Each side fetches `limit` rows so the union covers the worst case
  // (all newest rows on one side); we then take the top `limit` after
  // merging.
  const [asOwner, asTenant] = await Promise.all([
    prisma.lease.findMany({
      where: applyStatus({ ownerId: userId }, options.status),
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: LEASE_SELECT,
    }),
    prisma.lease.findMany({
      where: applyStatus({ tenantId: userId }, options.status),
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: LEASE_SELECT,
    }),
  ])

  // Dedup defensively (shouldn't happen — owner !== tenant per service
  // invariant — but cheap insurance against future bugs).
  const seen = new Set<string>()
  const merged: typeof asOwner = []
  for (const row of [...asOwner, ...asTenant]) {
    if (seen.has(row.id)) continue
    seen.add(row.id)
    merged.push(row)
  }
  merged.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  return merged.slice(0, limit)
}

export type LeaseListItem = Awaited<ReturnType<typeof listUserLeases>>[number]
