import 'server-only'
import { after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeasePendingExpiredOwnerEmail } from '@/lib/email/templates/lease-pending-expired-owner'
import { buildLeasePendingExpiredTenantEmail } from '@/lib/email/templates/lease-pending-expired-tenant'
import { fromPrismaLocale } from '@/lib/i18n/config'

/**
 * S2-23 — auto-REFUSE leases stuck in PENDING_TENANT past their
 * acceptance window. Companion to the owner-side manual cancel
 * (commit cbd13ce) : without this, a tenant who simply ignores the
 * invite leaves the listing masked forever and burdens the owner
 * with the cancellation responsibility.
 *
 * Default threshold : 14 days from lease creation. Owners pay upfront
 * and reasonable tenants reply within a day or two; 14d is generous
 * and covers travel / device issues. Override via `staleAfterDays`
 * for testing or future tuning.
 *
 * Transition mirrors owner-cancel-pending-lease :
 *   Lease   PENDING_TENANT → REFUSED         (frees the listing)
 *   Payment CONFIRMED      → REFUND_PENDING  (admin reviews)
 *   PaymentEvent audit row with reason = 'lease_pending_expired'
 *
 * Race safety : the `updateMany` filters on `status` so a concurrent
 * tenant accept/refuse that wins the race won't be overwritten. Mirror
 * of the reconcile-stuck-payments race fix (commit 604c767).
 *
 * Notifications : the cron emits 2 emails per expired lease — one to
 * the tenant ("ton invitation a expiré"), one to the owner ("ton bail
 * est libéré"). Both deferred via `after()` so the cron response is
 * flushed before the SMTP round-trips.
 */

const DEFAULT_STALE_AFTER_DAYS = 14

export type ExpirePendingLeasesResult = {
  scanned: number
  expired: number
  refundQueued: number
}

export async function expirePendingLeases(opts?: {
  staleAfterDays?: number
}): Promise<ExpirePendingLeasesResult> {
  const days = opts?.staleAfterDays ?? DEFAULT_STALE_AFTER_DAYS
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Find stale candidates with the relations we need for emails. Cap
  // at 200 per run to bound the email burst — a runaway accumulation
  // means something else broke and an admin should investigate before
  // we spam half the userbase.
  const stuck = await prisma.lease.findMany({
    where: {
      status: 'PENDING_TENANT',
      createdAt: { lt: threshold },
    },
    select: {
      id: true,
      paymentId: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          locale: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
          email: true,
          locale: true,
        },
      },
      listing: { select: { title: true } },
      payment: { select: { id: true, status: true } },
    },
    take: 200,
    orderBy: { createdAt: 'asc' },
  })

  if (stuck.length === 0) {
    return { scanned: 0, expired: 0, refundQueued: 0 }
  }

  let expired = 0
  let refundQueued = 0
  const notifyQueue: Array<{
    leaseId: string
    owner: { id: string; name: string | null; email: string; locale: string }
    tenant: { id: string; name: string | null; email: string; locale: string }
    listingTitle: string
  }> = []

  // Process one-by-one : each transition has its own conditional
  // updateMany so the race-loss path (concurrent accept/refuse)
  // skips silently without polluting other rows. The 200-row cap
  // bounds wall time even on a hosted DB.
  for (const lease of stuck) {
    try {
      const updateResult = await prisma.lease.updateMany({
        where: {
          id: lease.id,
          status: 'PENDING_TENANT',
        },
        data: { status: 'REFUSED' },
      })

      if (updateResult.count === 0) {
        // Race lost — tenant accepted or refused between findMany and
        // here. Skip; the winning path already triggered side-effects.
        continue
      }

      expired += 1

      if (
        lease.paymentId &&
        lease.payment &&
        lease.payment.status === 'CONFIRMED'
      ) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: lease.paymentId },
            data: { status: 'REFUND_PENDING' },
          }),
          prisma.paymentEvent.create({
            data: {
              paymentId: lease.paymentId,
              status: 'REFUND_PENDING',
              rawPayload: {
                reason: 'lease_pending_expired',
                leaseId: lease.id,
                source: 'expire-pending-leases-cron',
                staleAfterDays: days,
              },
            },
          }),
        ])
        refundQueued += 1
      }

      notifyQueue.push({
        leaseId: lease.id,
        owner: lease.owner,
        tenant: lease.tenant,
        listingTitle: lease.listing.title,
      })
    } catch (err) {
      // Don't kill the batch on a single row failure. Surface to
      // Sentry, continue.
      Sentry.captureException(err, {
        tags: { cron: 'expire-pending-leases', step: 'transition' },
        extra: { leaseId: lease.id },
      })
    }
  }

  if (notifyQueue.length > 0) {
    Sentry.captureMessage('expire-pending-leases swept stale rows', {
      level: 'warning',
      tags: { cron: 'expire-pending-leases' },
      extra: {
        scanned: stuck.length,
        expired,
        refundQueued,
        staleAfterDays: days,
      },
    })
  }

  // Defer emails behind the cron response. Two emails per expired
  // lease : tenant ("ton invitation a expiré + voici le catalogue")
  // + owner ("ton bail est libéré, tu peux relancer"). Each wrapped
  // in try/catch so one SMTP failure doesn't break the batch.
  const deferEmails = async () => {
    const base = env.AUTH_URL.replace(/\/$/, '')
    const catalogUrl = `${base}/annonces`
    const dashboardUrl = `${base}/dashboard/listings`

    for (const item of notifyQueue) {
      const leaseUrl = `${base}/dashboard/leases/${item.leaseId}`
      const listingTitle = sanitizeEmailHeaderValue(item.listingTitle)

      // Tenant
      try {
        const tenantName = sanitizeEmailHeaderValue(
          item.tenant.name ?? 'locataire',
        )
        const tenantEmail = buildLeasePendingExpiredTenantEmail(
          fromPrismaLocale(item.tenant.locale as never),
          {
            recipientName: tenantName,
            listingTitle,
            leaseUrl,
            catalogUrl,
          },
        )
        await sendTransactionalEmail({
          recipientId: item.tenant.id,
          recipientEmail: item.tenant.email,
          eventType: 'lease-pending-expired-tenant',
          subject: tenantEmail.subject,
          html: tenantEmail.html,
          text: tenantEmail.text,
        })
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            cron: 'expire-pending-leases',
            step: 'notify-tenant',
          },
          extra: { leaseId: item.leaseId },
        })
      }

      // Owner
      try {
        const ownerName = sanitizeEmailHeaderValue(
          item.owner.name ?? item.owner.email,
        )
        const ownerEmail = buildLeasePendingExpiredOwnerEmail(
          fromPrismaLocale(item.owner.locale as never),
          {
            recipientName: ownerName,
            listingTitle,
            leaseUrl,
            dashboardUrl,
          },
        )
        await sendTransactionalEmail({
          recipientId: item.owner.id,
          recipientEmail: item.owner.email,
          eventType: 'lease-pending-expired-owner',
          subject: ownerEmail.subject,
          html: ownerEmail.html,
          text: ownerEmail.text,
        })
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            cron: 'expire-pending-leases',
            step: 'notify-owner',
          },
          extra: { leaseId: item.leaseId },
        })
      }
    }
  }

  try {
    after(deferEmails)
  } catch {
    // Cron routes do have a request scope, so after() should work.
    // Fall back to fire-and-forget if it ever doesn't (e.g. tests).
    void deferEmails()
  }

  return { scanned: stuck.length, expired, refundQueued }
}
