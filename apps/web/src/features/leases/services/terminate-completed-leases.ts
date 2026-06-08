import 'server-only'
import { after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeaseTerminatedEmail } from '@/lib/email/templates/lease-terminated'
import { fromPrismaLocale } from '@/lib/i18n/config'

/**
 * S2-24 — auto-TERMINATE leases whose `startDate + durationMonths`
 * has elapsed. Companion to S2-23 (PENDING_TENANT expire) and the
 * owner-side manual cancel.
 *
 * Trigger frequency : daily.
 *
 * For v0 we don't store a pre-computed `endDate` column — the
 * lease volume is small enough that pulling all ACTIVE rows and
 * filtering in JS is cheaper than a schema migration + index.
 * Switch to a raw-SQL `startDate + interval` query when the table
 * gets above ~5000 active rows.
 *
 * Transitions :
 *   Lease   ACTIVE  → TERMINATED          (terminatedAt = now)
 *   Listing RENTED  → PUBLISHED           (frees the listing so the
 *                                          owner can re-publish, draft
 *                                          it, or start a new lease)
 *
 * Notifications : one email per party (owner + tenant), deferred
 * via after() so the cron response is flushed first.
 *
 * Race safety : the `updateMany` filters on `status = ACTIVE` so a
 * concurrent dispute / manual transition that wins the race won't
 * be clobbered.
 */

export type TerminateCompletedLeasesResult = {
  scanned: number
  terminated: number
}

export async function terminateCompletedLeases(opts?: {
  /** Override the "now" reference (used in tests). */
  now?: Date
}): Promise<TerminateCompletedLeasesResult> {
  const now = opts?.now ?? new Date()

  // Pull ACTIVE leases. We filter the end-date in JS — see header note.
  const active = await prisma.lease.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      startDate: true,
      durationMonths: true,
      listingId: true,
      owner: {
        select: { id: true, name: true, email: true, locale: true },
      },
      tenant: {
        select: { id: true, name: true, email: true, locale: true },
      },
      listing: { select: { title: true } },
    },
    take: 1000,
    orderBy: { createdAt: 'asc' },
  })

  const expired = active.filter((l) => {
    const end = new Date(l.startDate)
    end.setMonth(end.getMonth() + l.durationMonths)
    return end <= now
  })

  if (expired.length === 0) {
    return { scanned: active.length, terminated: 0 }
  }

  let terminated = 0
  const notifyQueue: Array<{
    leaseId: string
    listingTitle: string
    owner: { id: string; name: string | null; email: string; locale: string }
    tenant: { id: string; name: string | null; email: string; locale: string }
  }> = []

  for (const lease of expired) {
    try {
      // Payment audit H-3 (2026-05-29) — wrap the lease+listing flip in
      // a single transaction. Pre-fix the lease was set TERMINATED
      // with a separate listing.update call — if the worker crashed
      // (or the listing.update threw because the row had been deleted
      // mid-cron) between the two calls, the DB ended up with the
      // orphan pair `Lease.TERMINATED + Listing.RENTED`, which keeps
      // the listing locked out of re-publish and the partial unique
      // `Lease_listing_active_unique` from accepting a new lease.
      // The reconcile-stuck-lease-activations cron now sweeps any
      // remaining orphans (H-4), but the source-of-truth path here
      // shouldn't manufacture them in the first place.
      //
      // Both writes are updateMany-on-status so a concurrent dispute
      // / manual transition that wins the race won't be clobbered.
      const txResult = await prisma.$transaction(async (tx) => {
        const leaseUpdate = await tx.lease.updateMany({
          where: { id: lease.id, status: 'ACTIVE' },
          data: { status: 'TERMINATED', terminatedAt: now },
        })
        if (leaseUpdate.count === 0) return { transitioned: false }
        await tx.listing.updateMany({
          where: { id: lease.listingId, status: 'RENTED' },
          data: { status: 'PUBLISHED' },
        })
        return { transitioned: true }
      })

      if (!txResult.transitioned) continue
      terminated += 1

      notifyQueue.push({
        leaseId: lease.id,
        listingTitle: lease.listing.title,
        owner: lease.owner,
        tenant: lease.tenant,
      })
    } catch (err) {
      Sentry.captureException(err, {
        tags: { cron: 'terminate-completed-leases', step: 'transition' },
        extra: { leaseId: lease.id },
      })
    }
  }

  if (terminated > 0) {
    Sentry.captureMessage('terminate-completed-leases swept', {
      level: 'info',
      tags: { cron: 'terminate-completed-leases' },
      extra: { scanned: active.length, terminated },
    })
  }

  const deferEmails = async () => {
    const base = env.AUTH_URL.replace(/\/$/, '')
    const ownerDashboardUrl = `${base}/dashboard/listings`
    const catalogUrl = `${base}/annonces`

    for (const item of notifyQueue) {
      const leaseUrl = `${base}/dashboard/leases/${item.leaseId}`
      const listingTitle = sanitizeEmailHeaderValue(item.listingTitle)

      // Owner email
      try {
        const ownerName = sanitizeEmailHeaderValue(
          item.owner.name ?? item.owner.email,
        )
        const email = buildLeaseTerminatedEmail(
          fromPrismaLocale(item.owner.locale as never),
          {
            recipientName: ownerName,
            audience: 'owner',
            listingTitle,
            leaseUrl,
            ctaUrl: ownerDashboardUrl,
          },
        )
        await sendTransactionalEmail({
          recipientId: item.owner.id,
          recipientEmail: item.owner.email,
          eventType: 'lease-terminated-owner',
          subject: email.subject,
          html: email.html,
          text: email.text,
        })
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            cron: 'terminate-completed-leases',
            step: 'notify-owner',
          },
          extra: { leaseId: item.leaseId },
        })
      }

      // Tenant email
      try {
        const tenantName = sanitizeEmailHeaderValue(
          item.tenant.name ?? 'locataire',
        )
        const email = buildLeaseTerminatedEmail(
          fromPrismaLocale(item.tenant.locale as never),
          {
            recipientName: tenantName,
            audience: 'tenant',
            listingTitle,
            leaseUrl,
            ctaUrl: catalogUrl,
          },
        )
        await sendTransactionalEmail({
          recipientId: item.tenant.id,
          recipientEmail: item.tenant.email,
          eventType: 'lease-terminated-tenant',
          subject: email.subject,
          html: email.html,
          text: email.text,
        })
      } catch (err) {
        Sentry.captureException(err, {
          tags: {
            cron: 'terminate-completed-leases',
            step: 'notify-tenant',
          },
          extra: { leaseId: item.leaseId },
        })
      }
    }
  }

  try {
    after(deferEmails)
  } catch {
    void deferEmails()
  }

  return { scanned: active.length, terminated }
}
