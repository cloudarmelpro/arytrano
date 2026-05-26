import 'server-only'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { PaymentStatus } from '@prisma/client'
import { env } from '@/lib/env'
import { formatAriary } from '@/lib/format/currency'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeaseInviteTenantEmail } from '@/lib/email/templates/lease-invite-tenant'
import { fromPrismaLocale } from '@/lib/i18n/config'
import type { Locale as PrismaLocaleEnum } from '@prisma/client'

/**
 * Apply the Lease-side state transition that follows a Payment status
 * change. Called by the webhook route after `recordWebhookEvent` has
 * persisted the Payment update — keeps cross-feature concerns out of
 * the payments service.
 *
 * Transitions handled :
 *   Payment CONFIRMED   + Lease DRAFT  →  Lease PENDING_TENANT (+ ownerSignedAt = now)
 *   Payment FAILED      + Lease DRAFT  →  noop (owner can re-initiate)
 *   Payment CANCELED    + Lease DRAFT  →  noop
 *   Payment EXPIRED     + Lease DRAFT  →  noop
 *   Anything else                      →  noop
 *
 * Idempotent : if the Lease is already PENDING_TENANT (replay), we
 * return `already_pending` without rewriting `ownerSignedAt`.
 *
 * Side effects beyond the DB write (tenant email invite, push notif)
 * are intentionally NOT in this service — they belong to a follow-up
 * "notify-tenant" service so this one stays unit-testable without
 * mocking the email pipeline.
 */

export type LeaseSideEffectOutcome =
  | { kind: 'no_lease_linked'; paymentId: string }
  | { kind: 'noop'; paymentId: string; reason: string }
  | { kind: 'lease_now_pending_tenant'; leaseId: string }
  | { kind: 'already_pending'; leaseId: string }
  /** H1 audit fix — race lost: another lease on the same listing
   *  reached PENDING_TENANT first. We marked this one REFUSED and
   *  queued its Payment for manual refund. */
  | { kind: 'race_lost_marked_refused'; leaseId: string }

export async function applyLeasePaymentSideEffect(
  paymentId: string,
  newStatus: PaymentStatus,
): Promise<LeaseSideEffectOutcome> {
  // Only ACT on the success path. Other terminal payment statuses leave
  // the Lease in DRAFT — the owner can re-initiate, creating a fresh
  // Payment + Lease pair.
  if (newStatus !== 'CONFIRMED') {
    return { kind: 'noop', paymentId, reason: `status=${newStatus}` }
  }

  const lease = await prisma.lease.findUnique({
    where: { paymentId },
    select: {
      id: true,
      status: true,
      monthlyRentMGA: true,
      cautionMGA: true,
      owner: { select: { name: true, email: true } },
      tenant: {
        select: { id: true, name: true, email: true, locale: true },
      },
      listing: { select: { title: true } },
    },
  })

  if (!lease) {
    // Payment may have been for a different purpose (legacy PREMIUM_LISTING,
    // FEATURED_PLACEMENT) — those don't link to a Lease. Not an error.
    return { kind: 'no_lease_linked', paymentId }
  }

  if (lease.status === 'PENDING_TENANT') {
    // Replay / duplicate webhook. The Payment service is already
    // idempotent on its end; we're idempotent on ours too.
    return { kind: 'already_pending', leaseId: lease.id }
  }

  if (lease.status !== 'DRAFT') {
    // Out-of-sequence state (ACTIVE / REFUSED / etc.) — should not
    // happen in normal flow, but don't clobber a more advanced state.
    return {
      kind: 'noop',
      paymentId,
      reason: `lease in unexpected status ${lease.status}`,
    }
  }

  // H1 audit fix — Postgres partial unique index `Lease_listing_active_unique`
  // forbids two PENDING_TENANT/ACTIVE/DISPUTED leases on the same
  // listing. If we lose the race against a concurrent webhook, mark
  // this lease REFUSED + queue the linked Payment for manual refund.
  try {
    await prisma.lease.update({
      where: { id: lease.id },
      data: {
        status: 'PENDING_TENANT',
        ownerSignedAt: new Date(),
      },
    })
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
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
              note: 'Another lease on the same listing reached PENDING_TENANT first; refund queued.',
            },
          },
        }),
      ])
      return { kind: 'race_lost_marked_refused', leaseId: lease.id }
    }
    throw err
  }

  // Fire-and-forget tenant invite email. `sendTransactionalEmail`
  // catches its own errors per design — the lease transition must
  // remain durable even if SMTP hiccups.
  await notifyTenantInvite({
    leaseId: lease.id,
    tenant: lease.tenant,
    ownerName: lease.owner.name ?? lease.owner.email,
    listingTitle: lease.listing.title,
    monthlyRentMGA: lease.monthlyRentMGA,
    cautionMGA: lease.cautionMGA,
  })

  return { kind: 'lease_now_pending_tenant', leaseId: lease.id }
}

/**
 * Build + send the tenant invite email. Sanitizes name fields against
 * CRLF injection (memory `feedback_email_header_injection`) before
 * they flow into the Subject header.
 */
async function notifyTenantInvite(input: {
  leaseId: string
  tenant: {
    id: string
    name: string | null
    email: string
    locale: PrismaLocaleEnum
  }
  ownerName: string
  listingTitle: string
  monthlyRentMGA: number
  cautionMGA: number
}): Promise<void> {
  // Memory `feedback_debug_logs_no_pii` adjacent: never leak the email
  // local-part to the recipient. When `name` is null, fall back to a
  // neutral label rather than `email.split('@')[0]`.
  const tenantName = sanitizeEmailHeaderValue(
    input.tenant.name ?? 'locataire',
  )
  const ownerName = sanitizeEmailHeaderValue(input.ownerName)
  const listingTitle = sanitizeEmailHeaderValue(input.listingTitle)

  const leaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/dashboard/leases/${input.leaseId}`

  const email = buildLeaseInviteTenantEmail(fromPrismaLocale(input.tenant.locale), {
    recipientName: tenantName,
    ownerName,
    listingTitle,
    monthlyRentFormatted: formatAriary(input.monthlyRentMGA),
    cautionFormatted:
      input.cautionMGA > 0 ? formatAriary(input.cautionMGA) : '0 Ar',
    leaseUrl,
  })

  await sendTransactionalEmail({
    recipientId: input.tenant.id,
    recipientEmail: input.tenant.email,
    eventType: 'lease-invite-tenant',
    subject: email.subject,
    html: email.html,
    text: email.text,
  })
}
