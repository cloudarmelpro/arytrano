import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import type { CreateReportInput } from '../schemas/create-report'

export type CreateReportResult = {
  id: string
}

/**
 * Create a `Report` against a listing (T-025).
 *
 * - Visitor doesn't need to be authenticated — `reporterId` is optional.
 * - We verify the listing exists AND is PUBLISHED (no point reporting
 *   a DRAFT / DELETED / SUSPENDED listing) to avoid wasteful rows.
 * - Rate-limiting happens in the Server Action (per IP + per IP×listing).
 */
export async function createReport(input: {
  listingId: string
  reason: CreateReportInput['reason']
  details: string | null
  reporterId: string | null
}): Promise<CreateReportResult> {
  const listing = await prisma.listing.findFirst({
    where: { id: input.listingId, status: 'PUBLISHED' },
    select: { id: true },
  })
  if (!listing) {
    throw errors.notFound('Annonce introuvable')
  }

  // Dedup: if the same signed-in reporter already filed a report against this
  // listing in the same OPEN/IN_REVIEW state within the last 24h with the
  // same reason, return the existing id (idempotent success). Anti pile-on;
  // anon reporters are bounded by the per-IP rate-limit in the action layer.
  if (input.reporterId) {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existing = await prisma.report.findFirst({
      where: {
        listingId: input.listingId,
        reporterId: input.reporterId,
        reason: input.reason,
        status: { in: ['OPEN', 'IN_REVIEW'] },
        createdAt: { gte: dayAgo },
      },
      select: { id: true },
    })
    if (existing) return existing
  }

  const report = await prisma.report.create({
    data: {
      listingId: input.listingId,
      reason: input.reason,
      details: input.details && input.details.trim() ? input.details.trim() : null,
      reporterId: input.reporterId,
      status: 'OPEN',
    },
    select: { id: true },
  })
  return report
}
