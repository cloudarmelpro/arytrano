import 'server-only'
import type { LeadStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * E-T28 — list leads for the operator queue (/admin/leads).
 *
 * Filterable by status + claimed-by-me toggle + city slug. Sorted by
 * SLA urgency : `slaDueAt asc nulls last`, then `createdAt asc` so
 * fresh NEW leads bubble up alongside stale CLAIMED ones.
 *
 * Returns the projection the admin queue table renders + the
 * listing/owner/tenant minis needed for the row.
 */

const PAGE_SIZE = 50

export type OperatorLeadsFilter = {
  status?: LeadStatus | 'ALL_OPEN'
  claimedByMe?: boolean
  operatorId: string
  citySlug?: string
}

export type OperatorLeadRow = {
  id: string
  status: LeadStatus
  source: string
  createdAt: Date
  slaDueAt: Date | null
  firstContactedAt: Date | null
  tenantName: string
  tenantPhone: string
  moveInWindow: string
  budgetConfirmed: boolean
  claimedBy: { id: string; name: string | null } | null
  listing: {
    id: string
    slug: string
    title: string
    priceMonthlyMGA: number
    city: { slug: string; nameFr: string }
    neighborhood: { slug: string; nameFr: string }
    owner: { id: string; name: string | null; phone: string | null }
  }
}

const OPEN_STATUSES: LeadStatus[] = [
  'NEW',
  'CLAIMED',
  'IN_DISCUSSION',
  'AWAITING_OWNER',
  'AWAITING_TENANT',
]

export async function listLeadsForOperator(
  filter: OperatorLeadsFilter,
): Promise<OperatorLeadRow[]> {
  const where: import('@prisma/client').Prisma.LeadRequestWhereInput = {}

  // Default = open statuses (everything that's not terminal).
  if (filter.status === 'ALL_OPEN' || !filter.status) {
    where.status = { in: OPEN_STATUSES }
  } else {
    where.status = filter.status
  }

  if (filter.claimedByMe) {
    where.claimedByUserId = filter.operatorId
  }
  if (filter.citySlug) {
    where.listing = { city: { slug: filter.citySlug } }
  }

  return prisma.leadRequest.findMany({
    where,
    take: PAGE_SIZE,
    orderBy: [{ slaDueAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
    select: {
      id: true,
      status: true,
      source: true,
      createdAt: true,
      slaDueAt: true,
      firstContactedAt: true,
      tenantName: true,
      tenantPhone: true,
      moveInWindow: true,
      budgetConfirmed: true,
      claimedBy: { select: { id: true, name: true } },
      listing: {
        select: {
          id: true,
          slug: true,
          title: true,
          priceMonthlyMGA: true,
          city: { select: { slug: true, nameFr: true } },
          neighborhood: { select: { slug: true, nameFr: true } },
          owner: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  })
}
