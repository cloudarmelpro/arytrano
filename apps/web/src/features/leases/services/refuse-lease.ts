import 'server-only'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { stripC0ControlChars } from '@/lib/format/strip-c0'
import { buildLeaseTenantRefusedEmail } from '@/lib/email/templates/lease-tenant-refused'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendPush } from '@/lib/push/send-push'
import { recordTickets } from '@/lib/push/receipts'

/**
 * Tenant refuses the lease. Moves the Lease from PENDING_TENANT to
 * REFUSED and marks the linked Payment as REFUND_PENDING so the admin
 * can trigger the manual refund flow with GoalPay (no refund API).
 *
 * Listing.status stays PUBLISHED — the owner gets the annonce back
 * on the grid and can start a fresh lease wizard.
 *
 * Authorization is the caller's responsibility — verify the requesting
 * user matches `lease.tenantId`.
 */

export type RefuseLeaseOutcome =
  | { kind: 'ok'; leaseId: string; paymentRefundQueued: boolean }
  | { kind: 'not_found'; leaseId: string }
  | { kind: 'not_tenant'; leaseId: string }
  | { kind: 'invalid_status'; leaseId: string; currentStatus: string }

export async function refuseLease(
  leaseId: string,
  tenantId: string,
  reason: string,
): Promise<RefuseLeaseOutcome> {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      tenantId: true,
      paymentId: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          locale: true,
          // S2-25 — owner mobile push (null when only using web).
          expoPushToken: true,
        },
      },
      tenant: { select: { name: true, email: true } },
      listing: { select: { title: true } },
    },
  })

  if (!lease) return { kind: 'not_found', leaseId }
  if (lease.tenantId !== tenantId) return { kind: 'not_tenant', leaseId }
  if (lease.status !== 'PENDING_TENANT') {
    return {
      kind: 'invalid_status',
      leaseId,
      currentStatus: lease.status,
    }
  }

  // Pre-fetch the Payment state outside the transaction — it's a
  // read-only check that decides whether to queue a refund.
  let paymentRefundQueued = false
  if (lease.paymentId) {
    const payment = await prisma.payment.findUnique({
      where: { id: lease.paymentId },
      select: { id: true, status: true },
    })
    if (payment && payment.status === 'CONFIRMED') {
      paymentRefundQueued = true
    }
  }

  // M3 audit fix — sanitize once at the boundary, use everywhere.
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
            reason: 'tenant_refused_lease',
            leaseId: lease.id,
            note: sanitizedNote,
          },
        },
      }),
    )
  }

  await prisma.$transaction(ops)

  // Fire-and-forget owner notification (includes refund reassurance
  // if a Payment was queued for manual refund).
  const leaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/dashboard/leases/${lease.id}`
  const ownerName = sanitizeEmailHeaderValue(
    lease.owner.name ?? lease.owner.email,
  )
  const tenantName = sanitizeEmailHeaderValue(
    lease.tenant.name ?? 'locataire',
  )
  const sanitizedReason = sanitizedNote
    ? sanitizeEmailHeaderValue(sanitizedNote)
    : undefined
  const email = buildLeaseTenantRefusedEmail(
    fromPrismaLocale(lease.owner.locale),
    {
      recipientName: ownerName,
      tenantName,
      listingTitle: sanitizeEmailHeaderValue(lease.listing.title),
      ...(sanitizedReason ? { reason: sanitizedReason } : {}),
      leaseUrl,
    },
  )
  await sendTransactionalEmail({
    recipientId: lease.owner.id,
    recipientEmail: lease.owner.email,
    eventType: 'lease-tenant-refused',
    subject: email.subject,
    html: email.html,
    text: email.text,
  })

  // S2-25 — fire-and-forget owner push. Same security posture as the
  // accept path : generic body, leaseId in data for deep-link routing.
  // Reason is NOT included in the push (PII + lock-screen exposure) —
  // owner reads it inside the app on the lease detail screen.
  if (lease.owner.expoPushToken) {
    const ownerLocale = fromPrismaLocale(lease.owner.locale)
    const pushTitle =
      ownerLocale === 'mg' ? 'Nolavina ny bail' : 'Bail refusé'
    const pushBody =
      ownerLocale === 'mg'
        ? "Nanda ny bail ny mpanofa. Sokafy ny app hijerena."
        : "Le locataire a refusé. Ouvre l'app pour voir les détails."
    void sendPush([
      {
        to: lease.owner.expoPushToken,
        title: pushTitle,
        body: pushBody,
        sound: 'default',
        data: { kind: 'leaseTenantRefused', leaseId: lease.id },
      },
    ]).then((result) =>
      recordTickets(
        result.tickets.map((t) => ({
          userId: lease.owner.id,
          ticketId: t.ticketId,
        })),
      ),
    )
  }

  return { kind: 'ok', leaseId: lease.id, paymentRefundQueued }
}
