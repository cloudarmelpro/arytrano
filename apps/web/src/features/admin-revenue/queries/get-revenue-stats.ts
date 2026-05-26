import 'server-only'
import { prisma } from '@/lib/db'
import type { LeaseStatus } from '@prisma/client'

/**
 * Admin revenue snapshot.
 *
 * AryTrano runs a success-based fee model (E-T26) — no recurring MRR /
 * subscriptions, so the original E-T19 MRR/ARR/Churn shape was scrapped.
 * Instead we aggregate Payments where `purpose = LEASE_SUCCESS_FEE`
 * and the linked Lease reached an actionable terminal state (we count
 * a fee as "earned" the moment the tenant signs — ACTIVE — so refused
 * / disputed leases don't inflate the totals).
 *
 * Returns counts + total amounts:
 *   - thisMonth / lastMonth / allTime
 *   - per-status payment breakdown (CONFIRMED / REFUND_PENDING / etc.)
 *   - signed lease count (ACTIVE leases this month)
 *   - dispute rate (DISPUTED / ACTIVE leases — should stay near 0%)
 */

export type RevenueStats = {
  thisMonthMGA: number
  lastMonthMGA: number
  allTimeMGA: number
  thisMonthCount: number
  lastMonthCount: number
  allTimeCount: number
  /** Active leases this month — the "things going well" counter. */
  signedLeasesThisMonth: number
  /** REFUND_PENDING + REFUNDED count, all-time. Triage hint. */
  refundCount: number
  /** % of leases ever DISPUTED out of total ACTIVE+TERMINATED+DISPUTED. */
  disputeRatePct: number | null
  /** Per-status payment count snapshot (active + terminal). */
  statusBreakdown: Record<string, number>
}

function startOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
}

function startOfNextMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1))
}

export async function getRevenueStats(): Promise<RevenueStats> {
  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)),
  )
  const nextMonthStart = startOfNextMonth(now)

  // Only CONFIRMED payments with the success-fee purpose count as earned
  // revenue. REFUND_PENDING / REFUNDED stay out of the totals — admin
  // sees them in the breakdown row instead.
  const earnedWhere = {
    purpose: 'LEASE_SUCCESS_FEE' as const,
    status: 'CONFIRMED' as const,
  }

  const [
    thisMonthAgg,
    lastMonthAgg,
    allTimeAgg,
    refundsAgg,
    breakdownGroups,
    activeLeasesThisMonth,
    disputedLeases,
    terminatedLeases,
    activeLeasesAllTime,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        ...earnedWhere,
        completedAt: { gte: thisMonthStart, lt: nextMonthStart },
      },
      _sum: { amountMGA: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        ...earnedWhere,
        completedAt: { gte: lastMonthStart, lt: thisMonthStart },
      },
      _sum: { amountMGA: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: earnedWhere,
      _sum: { amountMGA: true },
      _count: true,
    }),
    prisma.payment.count({
      where: {
        purpose: 'LEASE_SUCCESS_FEE',
        status: { in: ['REFUND_PENDING', 'REFUNDED'] },
      },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      where: { purpose: 'LEASE_SUCCESS_FEE' },
      _count: true,
    }),
    prisma.lease.count({
      where: {
        status: 'ACTIVE',
        tenantSignedAt: { gte: thisMonthStart, lt: nextMonthStart },
      },
    }),
    prisma.lease.count({
      where: { status: 'DISPUTED' satisfies LeaseStatus },
    }),
    prisma.lease.count({
      where: { status: 'TERMINATED' satisfies LeaseStatus },
    }),
    prisma.lease.count({
      where: { status: 'ACTIVE' satisfies LeaseStatus },
    }),
  ])

  const disputeDenom =
    activeLeasesAllTime + terminatedLeases + disputedLeases
  const disputeRatePct =
    disputeDenom > 0
      ? Math.round((disputedLeases / disputeDenom) * 10_000) / 100
      : null

  return {
    thisMonthMGA: thisMonthAgg._sum.amountMGA ?? 0,
    lastMonthMGA: lastMonthAgg._sum.amountMGA ?? 0,
    allTimeMGA: allTimeAgg._sum.amountMGA ?? 0,
    thisMonthCount: thisMonthAgg._count,
    lastMonthCount: lastMonthAgg._count,
    allTimeCount: allTimeAgg._count,
    signedLeasesThisMonth: activeLeasesThisMonth,
    refundCount: refundsAgg,
    disputeRatePct,
    statusBreakdown: Object.fromEntries(
      breakdownGroups.map((g) => [g.status, g._count]),
    ),
  }
}
