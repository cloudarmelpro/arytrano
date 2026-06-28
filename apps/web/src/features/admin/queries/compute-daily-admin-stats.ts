import 'server-only'
import { prisma } from '@/lib/db'

/**
 * ANA-15 — daily snapshot of platform health for the admin digest
 * email. Single pass : everything paralellizes via Promise.all so
 * the cron stays under a few seconds even at scale.
 */

export type DailyAdminStats = {
  generatedAt: Date
  windowStart: Date
  windowEnd: Date
  signups: { today: number; last7d: number; last30d: number; total: number }
  activity: {
    dau: number
    wau: number
    mau: number
  }
  listings: {
    publishedTotal: number
    publishedTodayNew: number
    draftToday: number
  }
  engagement: {
    contactsToday: number
    contactsLast7d: number
    favoritesToday: number
    viewsToday: number
  }
  leases: {
    initiatedToday: number
    activatedToday: number
    disputedOpenToday: number
  }
  payments: {
    paidToday: number
    refundedToday: number
  }
  moderation: {
    openReports: number
    pendingVerifications: number
  }
}

export async function computeDailyAdminStats(): Promise<DailyAdminStats> {
  const now = new Date()
  // Window covers yesterday's full UTC day so the digest reads
  // "what happened on day X" rather than "what happened in the last
  // 24h rolling" — clearer for ops.
  const todayStart = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
  ))
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
  const last7dStart = new Date(todayEnd.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30dStart = new Date(todayEnd.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    signupsToday,
    signupsLast7d,
    signupsLast30d,
    signupsTotal,
    loginsToday,
    loginsLast7d,
    loginsLast30d,
    publishedTotal,
    publishedTodayNew,
    draftToday,
    contactsToday,
    contactsLast7d,
    favoritesToday,
    viewsToday,
    leasesInitiatedToday,
    leasesActivatedToday,
    disputesOpenedToday,
    paymentsPaidToday,
    paymentsRefundedToday,
    openReports,
    pendingVerifications,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.user.count({ where: { createdAt: { gte: last7dStart, lt: todayEnd } } }),
    prisma.user.count({ where: { createdAt: { gte: last30dStart, lt: todayEnd } } }),
    prisma.user.count(),
    prisma.loginEvent.findMany({
      where: { occurredAt: { gte: todayStart, lt: todayEnd } },
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.loginEvent.findMany({
      where: { occurredAt: { gte: last7dStart, lt: todayEnd } },
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.loginEvent.findMany({
      where: { occurredAt: { gte: last30dStart, lt: todayEnd } },
      select: { userId: true },
      distinct: ['userId'],
    }),
    prisma.listing.count({ where: { status: 'PUBLISHED' } }),
    prisma.listing.count({
      where: { status: 'PUBLISHED', publishedAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.listing.count({
      where: { status: 'DRAFT', createdAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.contactEvent.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.contactEvent.count({ where: { createdAt: { gte: last7dStart, lt: todayEnd } } }),
    prisma.favorite.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.listingView.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.lease.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.lease.count({
      where: {
        status: 'ACTIVE',
        // Lease activated means status flipped after first paid signature.
        updatedAt: { gte: todayStart, lt: todayEnd },
      },
    }),
    prisma.dispute.count({
      where: { createdAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.payment.count({
      where: { status: 'CONFIRMED', completedAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.payment.count({
      where: { status: 'REFUNDED', webhookReceivedAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.report.count({ where: { status: 'OPEN' } }),
    // Pending verifications = CIN uploaded but not yet decided.
    prisma.ownerProfile.count({
      where: {
        cinUploadedAt: { not: null },
        verifiedAt: null,
        cinRejectedAt: null,
      },
    }),
  ])

  return {
    generatedAt: now,
    windowStart: todayStart,
    windowEnd: todayEnd,
    signups: {
      today: signupsToday,
      last7d: signupsLast7d,
      last30d: signupsLast30d,
      total: signupsTotal,
    },
    activity: {
      dau: loginsToday.length,
      wau: loginsLast7d.length,
      mau: loginsLast30d.length,
    },
    listings: {
      publishedTotal,
      publishedTodayNew,
      draftToday,
    },
    engagement: {
      contactsToday,
      contactsLast7d,
      favoritesToday,
      viewsToday,
    },
    leases: {
      initiatedToday: leasesInitiatedToday,
      activatedToday: leasesActivatedToday,
      disputedOpenToday: disputesOpenedToday,
    },
    payments: {
      paidToday: paymentsPaidToday,
      refundedToday: paymentsRefundedToday,
    },
    moderation: {
      openReports,
      pendingVerifications,
    },
  }
}
