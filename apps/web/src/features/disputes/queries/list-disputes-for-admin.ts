import 'server-only'
import { prisma } from '@/lib/db'

const OPEN_STATUSES = ['OPEN', 'IN_REVIEW'] as const

export async function listDisputesForAdmin(filter?: {
  status?: 'ALL' | 'OPEN' | 'IN_REVIEW' | 'RESOLVED'
}) {
  const where: import('@prisma/client').Prisma.DisputeWhereInput = {}
  if (!filter?.status || filter.status === 'ALL') {
    // default = open dashboard
    where.status = { in: [...OPEN_STATUSES] }
  } else if (filter.status === 'OPEN' || filter.status === 'IN_REVIEW') {
    where.status = filter.status
  } else {
    where.status = {
      in: ['RESOLVED_OWNER', 'RESOLVED_TENANT', 'RESOLVED_SPLIT', 'WITHDRAWN'],
    }
  }

  return prisma.dispute.findMany({
    where,
    orderBy: [{ slaDueAt: 'asc' }, { createdAt: 'asc' }],
    take: 100,
    select: {
      id: true,
      status: true,
      openedByRole: true,
      amountAtStakeMGA: true,
      slaDueAt: true,
      resolvedAt: true,
      createdAt: true,
      lease: {
        select: {
          id: true,
          monthlyRentMGA: true,
          listing: { select: { title: true } },
          owner: { select: { name: true } },
          tenant: { select: { name: true } },
        },
      },
      resolvedBy: { select: { id: true, name: true } },
    },
  })
}
