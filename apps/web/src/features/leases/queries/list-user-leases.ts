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
 */

export type ListLeasesOptions = {
  role?: 'OWNER' | 'TENANT'
  status?: LeaseStatus | ReadonlyArray<LeaseStatus>
  limit?: number
}

export async function listUserLeases(
  userId: string,
  options: ListLeasesOptions = {},
) {
  const where: Prisma.LeaseWhereInput =
    options.role === 'OWNER'
      ? { ownerId: userId }
      : options.role === 'TENANT'
        ? { tenantId: userId }
        : { OR: [{ ownerId: userId }, { tenantId: userId }] }

  if (options.status) {
    if (Array.isArray(options.status)) {
      where.status = { in: [...options.status] as LeaseStatus[] }
    } else {
      where.status = options.status as LeaseStatus
    }
  }

  return prisma.lease.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 50,
    select: {
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
      owner: { select: { id: true, name: true, email: true } },
      tenant: { select: { id: true, name: true, email: true } },
    },
  })
}

export type LeaseListItem = Awaited<ReturnType<typeof listUserLeases>>[number]
