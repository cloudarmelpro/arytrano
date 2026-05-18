import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { errors } from '@/lib/api/errors'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { buildReportReceivedEmail } from '@/lib/email/templates/report-received'
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
    select: {
      id: true,
      title: true,
      slug: true,
      city: { select: { slug: true } },
      neighborhood: { select: { slug: true } },
      owner: { select: { id: true, email: true, name: true, locale: true } },
    },
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

  // E-T06: notify the owner. Fire-and-forget; the report is the user-
  // facing success regardless of email outcome. Reason is translated
  // server-side via the owner's locale dictionary so the template stays
  // string-only. We deliberately do NOT include `input.details` — that
  // would let a hostile reporter weaponise the email channel.
  const locale = fromPrismaLocale(listing.owner.locale)
  const t = getT(locale)
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const email = buildReportReceivedEmail(locale, {
    recipientName: listing.owner.name ?? 'Propriétaire',
    listingTitle: listing.title,
    listingUrl: `${baseUrl}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`,
    reasonLabel: t(`report.reason.${input.reason}` as const),
  })
  void sendTransactionalEmail({
    recipientId: listing.owner.id,
    recipientEmail: listing.owner.email,
    eventType: 'report-received',
    ...email,
  })

  return report
}
