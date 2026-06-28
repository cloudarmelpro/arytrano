import 'server-only'
import { prisma } from '@/lib/db'
import {
  detectScamSignals,
  summarizeSignals,
} from '@/lib/moderation/scam-detector'

/**
 * TRU-04 — best-effort auto-flagging of newly created or updated
 * listings when scam-keyword detection trips above the threshold.
 *
 * Behavior :
 *  - Owner is NEVER blocked (low false-positive tolerance) — just
 *    flagged for admin review.
 *  - We open a SCAM Report row with reporterId=null + details prefixed
 *    "[AUTO-FLAG]" so the admin queue can distinguish from human reports.
 *  - Dedup : if an OPEN auto-flag already exists for this listing in
 *    the last 24h, we don't add another (avoid noise on every save).
 *  - Errors swallowed — moderation is best-effort, never blocks
 *    create/update.
 */
export async function autoFlagListingIfNeeded(args: {
  listingId: string
  title: string
  description: string
}): Promise<{ flagged: boolean; confidence?: number }> {
  try {
    const report = detectScamSignals({
      title: args.title,
      description: args.description,
    })
    if (!report.shouldFlag) return { flagged: false }

    // Dedup window — same listing, OPEN, AUTO-FLAG, last 24h.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existing = await prisma.report.findFirst({
      where: {
        listingId: args.listingId,
        status: 'OPEN',
        reporterId: null,
        createdAt: { gte: since },
        details: { startsWith: '[AUTO-FLAG]' },
      },
      select: { id: true },
    })
    if (existing) {
      return { flagged: true, confidence: report.confidence }
    }

    await prisma.report.create({
      data: {
        listingId: args.listingId,
        reporterId: null,
        reason: 'SCAM',
        details: `[AUTO-FLAG] confidence=${report.confidence.toFixed(2)} · ${summarizeSignals(report.signals)}`,
        status: 'OPEN',
      },
    })
    return { flagged: true, confidence: report.confidence }
  } catch {
    return { flagged: false }
  }
}
