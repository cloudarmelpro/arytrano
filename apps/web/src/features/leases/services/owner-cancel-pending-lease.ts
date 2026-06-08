import 'server-only'
import type { Prisma } from '@prisma/client'
import { ownerTermsAcceptedFor } from '@/features/auth/server'
import { after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { stripC0ControlChars } from '@/lib/format/strip-c0'
import { buildLeaseOwnerCanceledEmail } from '@/lib/email/templates/lease-owner-canceled'
import { fromPrismaLocale } from '@/lib/i18n/config'

/**
 * Owner cancels a PENDING_TENANT lease.
 *
 * Use case : tenant never accepted (lost interest, unreachable) OR
 * owner changed mind (found another tenant offline, listing pulled).
 * Without this, a stale PENDING_TENANT lease blocks the Listing via the
 * partial unique index `Lease_listing_active_unique` and the owner
 * can't relaunch a new lease wizard on the same listing.
 *
 * Transition :
 *   Lease   PENDING_TENANT → REFUSED        (frees the listing partial unique)
 *   Payment CONFIRMED      → REFUND_PENDING (admin reviews case-by-case)
 *   PaymentEvent audit row with rawPayload.reason = 'owner_canceled_pending'
 *
 * Refund policy : the signature fee is technically non-refundable
 * (it's our service fee, not a deposit). We queue REFUND_PENDING so the
 * admin can decide on a case-by-case basis via /admin/revenue + GoalPay
 * support — generous gesture in early days, stricter when abuse pattern
 * appears.
 *
 * Authorization is the caller's responsibility — the Server Action
 * MUST verify `lease.ownerId === userId`. The service double-checks via
 * the `not_owner` outcome.
 */

export type OwnerCancelOutcome =
  | { kind: 'ok'; leaseId: string; paymentRefundQueued: boolean }
  | { kind: 'owner_terms_not_accepted'; leaseId: string }
  | { kind: 'not_found'; leaseId: string }
  | { kind: 'not_owner'; leaseId: string }
  | { kind: 'invalid_status'; leaseId: string; currentStatus: string }

export async function ownerCancelPendingLease(
  leaseId: string,
  ownerId: string,
  reason: string,
): Promise<OwnerCancelOutcome> {
  // T-049 Owner Terms gate — audit C1.
  const accepted = await ownerTermsAcceptedFor(ownerId)
  if (!accepted) {
    return { kind: 'owner_terms_not_accepted', leaseId }
  }

  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      ownerId: true,
      paymentId: true,
      owner: { select: { name: true, email: true } },
      tenant: {
        select: { id: true, name: true, email: true, locale: true },
      },
      listing: { select: { title: true } },
    },
  })

  if (!lease) return { kind: 'not_found', leaseId }
  if (lease.ownerId !== ownerId) return { kind: 'not_owner', leaseId }
  if (lease.status !== 'PENDING_TENANT') {
    return {
      kind: 'invalid_status',
      leaseId,
      currentStatus: lease.status,
    }
  }

  // Pre-fetch the Payment state — decides whether to queue the refund
  // audit row. Read outside the transaction; payment status is a write
  // that goes through `recordWebhookEvent` (which is itself idempotent
  // via the conditional updateMany), so a racey concurrent webhook
  // won't corrupt the count.
  let paymentRefundQueued = false
  if (lease.paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: lease.paymentId },
      select: { status: true },
    })
    if (payment && payment.status === 'CONFIRMED') {
      paymentRefundQueued = true
    }
  }

  const sanitizedNote = stripC0ControlChars(reason).trim().slice(0, 500)

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.lease.update({
      where: { id: lease.id },
      data: { status: 'REFUSED' },
    }),
  ]

  if (paymentRefundQueued && lease.paymentId) {
    ops.push(
      prisma.payment.update({
        where: { id: lease.paymentId },
        data: { status: 'REFUND_PENDING' },
      }),
      prisma.paymentEvent.create({
        data: {
          paymentId: lease.paymentId,
          status: 'REFUND_PENDING',
          rawPayload: {
            reason: 'owner_canceled_pending',
            leaseId: lease.id,
            note: sanitizedNote,
          },
        },
      }),
    )
  }

  await prisma.$transaction(ops)

  // Defer the tenant notification email through `after()` so the
  // Server Action response is flushed BEFORE the SMTP round-trip. Same
  // pattern as `apply-lease-payment-side-effect` — keeps the user-
  // perceived latency on the cancel button down to the DB write only.
  const leaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/dashboard/leases/${lease.id}`
  const catalogUrl = `${env.AUTH_URL.replace(/\/$/, '')}/annonces`
  const tenantName = sanitizeEmailHeaderValue(lease.tenant.name ?? 'locataire')
  const ownerName = sanitizeEmailHeaderValue(
    lease.owner.name ?? lease.owner.email,
  )
  const sanitizedReason = sanitizedNote
    ? sanitizeEmailHeaderValue(sanitizedNote)
    : undefined

  const emailInput = {
    tenant: lease.tenant,
    ownerName,
    tenantName,
    listingTitle: sanitizeEmailHeaderValue(lease.listing.title),
    reason: sanitizedReason,
    leaseUrl,
    catalogUrl,
  }
  const deferEmail = async () => {
    try {
      const email = buildLeaseOwnerCanceledEmail(
        fromPrismaLocale(emailInput.tenant.locale),
        {
          recipientName: emailInput.tenantName,
          ownerName: emailInput.ownerName,
          listingTitle: emailInput.listingTitle,
          ...(emailInput.reason ? { reason: emailInput.reason } : {}),
          leaseUrl: emailInput.leaseUrl,
          catalogUrl: emailInput.catalogUrl,
        },
      )
      await sendTransactionalEmail({
        recipientId: emailInput.tenant.id,
        recipientEmail: emailInput.tenant.email,
        eventType: 'lease-owner-canceled',
        subject: email.subject,
        html: email.html,
        text: email.text,
      })
    } catch (err) {
      Sentry.captureException(err, {
        tags: { kind: 'lease-owner-canceled-after' },
        extra: { leaseId: lease.id },
      })
    }
  }
  try {
    after(deferEmail)
  } catch {
    // Out-of-request-scope (tests) — fire-and-forget.
    void deferEmail()
  }

  return { kind: 'ok', leaseId: lease.id, paymentRefundQueued }
}
