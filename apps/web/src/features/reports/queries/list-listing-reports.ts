import 'server-only'
import type { ReportReason, ReportStatus } from '@prisma/client'
import { prisma } from '@/lib/db'

/**
 * Owner-side read of reports against a specific listing. Used in the listing
 * edit page's Moderation section. Caller MUST verify ownership before invoking
 * — typically that's the page-level auth check (only the owner reaches edit).
 *
 * Strips reporter identity entirely (privacy: owner doesn't need to know who
 * reported, only what + the admin's resolution note).
 */
export type OwnerVisibleReport = {
  id: string
  reason: ReportReason
  status: ReportStatus
  adminNote: string | null
  createdAt: Date
  resolvedAt: Date | null
}

export async function listListingReportsForOwner(
  listingId: string,
): Promise<OwnerVisibleReport[]> {
  return prisma.report.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      reason: true,
      status: true,
      adminNote: true,
      createdAt: true,
      resolvedAt: true,
    },
  })
}
