import 'server-only'
import { Prisma } from '@prisma/client'
import { after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import type { PaymentStatus } from '@prisma/client'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeaseTenantSignedEmail } from '@/lib/email/templates/lease-tenant-signed'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendPush } from '@/lib/push/send-push'
import { recordTickets } from '@/lib/push/receipts'

/**
 * Apply the Lease-side state transition that follows a Payment status
 * change. Called by the GoalPay webhook route after `recordWebhookEvent`
 * has persisted the Payment update.
 *
 * Revised E-T26 (2026-05-27) — tenant-pays model :
 *
 *   Payment CONFIRMED + Lease PENDING_TENANT → Lease ACTIVE
 *     (tenantSignedAt = now ; Listing.status = RENTED)
 *
 *   Anything else → noop.
 *
 * The OWNER is notified (email + push) when the tenant payment lands,
 * matching the prior `tenant-sign-lease` semantics.
 *
 * Race safety : another lease on the same listing may have raced to
 * ACTIVE (partial unique index `Lease_listing_active_unique`). If the
 * Lease.update throws P2002, mark this lease REFUSED + queue refund.
 */

export type LeaseSideEffectOutcome =
  | { kind: 'no_lease_linked'; paymentId: string }
  | { kind: 'noop'; paymentId: string; reason: string }
  | { kind: 'lease_now_active'; leaseId: string }
  | { kind: 'already_active'; leaseId: string }
  | { kind: 'race_lost_marked_refused'; leaseId: string }

export async function applyLeasePaymentSideEffect(
  paymentId: string,
  newStatus: PaymentStatus,
): Promise<LeaseSideEffectOutcome> {
  if (newStatus !== 'CONFIRMED') {
    return { kind: 'noop', paymentId, reason: `status=${newStatus}` }
  }

  const lease = await prisma.lease.findUnique({
    where: { paymentId },
    select: {
      id: true,
      status: true,
      listingId: true,
      monthlyRentMGA: true,
      cautionMGA: true,
      platformFeeMGA: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          locale: true,
          expoPushToken: true,
        },
      },
      tenant: { select: { name: true, email: true } },
      listing: { select: { title: true } },
    },
  })

  if (!lease) {
    // Payment may have been for a different purpose (legacy
    // PREMIUM_LISTING, FEATURED_PLACEMENT) — not an error.
    return { kind: 'no_lease_linked', paymentId }
  }

  if (lease.status === 'ACTIVE') {
    // Replay / duplicate webhook. Idempotent.
    return { kind: 'already_active', leaseId: lease.id }
  }

  if (lease.status !== 'PENDING_TENANT') {
    // Out-of-sequence (DRAFT vestigial, REFUSED/TERMINATED) — don't
    // clobber a more advanced state. Surface for forensics.
    return {
      kind: 'noop',
      paymentId,
      reason: `lease in unexpected status ${lease.status}`,
    }
  }

  const now = new Date()

  try {
    await prisma.$transaction([
      prisma.lease.update({
        where: { id: lease.id },
        data: {
          status: 'ACTIVE',
          tenantSignedAt: now,
        },
      }),
      prisma.listing.update({
        where: { id: lease.listingId },
        data: { status: 'RENTED' },
      }),
    ])
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      // Race-lost on the partial unique index — another lease on the
      // same listing reached ACTIVE first. Mark this one REFUSED +
      // queue the tenant's payment for manual refund.
      await prisma.$transaction([
        prisma.lease.update({
          where: { id: lease.id },
          data: { status: 'REFUSED' },
        }),
        prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'REFUND_PENDING' },
        }),
        prisma.paymentEvent.create({
          data: {
            paymentId,
            status: 'REFUND_PENDING',
            rawPayload: {
              reason: 'race_lost_concurrent_lease',
              leaseId: lease.id,
              note: 'Another lease on the same listing reached ACTIVE first; tenant refund queued.',
            },
          },
        }),
      ])
      return { kind: 'race_lost_marked_refused', leaseId: lease.id }
    }
    throw err
  }

  // Defer notifications behind the webhook response so GoalPay receives
  // its 200 immediately even on slow SMTP / push providers.
  const leaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/dashboard/leases/${lease.id}`
  const ownerName = sanitizeEmailHeaderValue(
    lease.owner.name ?? lease.owner.email,
  )
  const tenantName = sanitizeEmailHeaderValue(
    lease.tenant.name ?? 'locataire',
  )

  const deferNotifications = async () => {
    // E-T27.1 — generate the lease PDF in the same deferred batch. Runs
    // BEFORE the email send so the email already mentions the PDF as
    // available in the dashboard. Idempotent on retry.
    try {
      const { generateLeaseContractPdf } = await import(
        './generate-lease-contract-pdf'
      )
      await generateLeaseContractPdf(lease.id)
    } catch (err) {
      Sentry.captureException(err, {
        tags: { kind: 'lease-active-pdf-after' },
        extra: { leaseId: lease.id },
      })
    }

    // Email
    try {
      const email = buildLeaseTenantSignedEmail(
        fromPrismaLocale(lease.owner.locale),
        {
          recipientName: ownerName,
          tenantName,
          listingTitle: sanitizeEmailHeaderValue(lease.listing.title),
          leaseUrl,
        },
      )
      await sendTransactionalEmail({
        recipientId: lease.owner.id,
        recipientEmail: lease.owner.email,
        eventType: 'lease-tenant-signed',
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
    } catch (err) {
      Sentry.captureException(err, {
        tags: { kind: 'lease-active-owner-email-after' },
        extra: { leaseId: lease.id },
      })
    }

    // Push
    if (lease.owner.expoPushToken) {
      try {
        const ownerLocale = fromPrismaLocale(lease.owner.locale)
        const pushTitle =
          ownerLocale === 'mg' ? 'Voasonia ny bail' : 'Ton bail est signé'
        const pushBody =
          ownerLocale === 'mg'
            ? "Naloan'ny mpanofa ny saran'ny sonia. Sokafy ny app hijerena."
            : "Le locataire a payé. Ouvre l'app pour voir les détails."
        const result = await sendPush([
          {
            to: lease.owner.expoPushToken,
            title: pushTitle,
            body: pushBody,
            sound: 'default',
            data: { kind: 'leaseTenantSigned', leaseId: lease.id },
          },
        ])
        await recordTickets(
          result.tickets.map((t) => ({
            userId: lease.owner.id,
            ticketId: t.ticketId,
          })),
        )
      } catch (err) {
        Sentry.captureException(err, {
          tags: { kind: 'lease-active-owner-push-after' },
          extra: { leaseId: lease.id },
        })
      }
    }
  }
  try {
    after(deferNotifications)
  } catch {
    void deferNotifications()
  }

  return { kind: 'lease_now_active', leaseId: lease.id }
}
