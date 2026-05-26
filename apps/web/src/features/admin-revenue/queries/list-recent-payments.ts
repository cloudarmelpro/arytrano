import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Recent payments for the /admin/revenue table. Caps at 30 rows so the
 * page renders cheaply without pagination — admin can drill via
 * Sentry / dashboard alerts when they need older history.
 *
 * Selects only what the table renders: id, amount, status, createdAt,
 * provider transaction id, and the linked lease + listing title (no
 * email / PII on the recent-list view).
 */
export async function listRecentPayments(limit = 30) {
  return prisma.payment.findMany({
    where: { purpose: 'LEASE_SUCCESS_FEE' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      amountMGA: true,
      status: true,
      createdAt: true,
      completedAt: true,
      providerTxId: true,
      lease: {
        select: {
          id: true,
          status: true,
          listing: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  })
}

export type RecentPayment = Awaited<
  ReturnType<typeof listRecentPayments>
>[number]
