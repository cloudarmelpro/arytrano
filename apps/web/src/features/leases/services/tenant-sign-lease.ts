import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeaseTenantSignedEmail } from '@/lib/email/templates/lease-tenant-signed'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { sendPush } from '@/lib/push/send-push'
import { recordTickets } from '@/lib/push/receipts'

/**
 * Tenant accepts the lease. Moves the Lease from PENDING_TENANT to
 * ACTIVE, sets `tenantSignedAt`, and flips the Listing.status to
 * RENTED so the annonce is masked from the public grid.
 *
 * Authorization is the caller's responsibility — the Server Action
 * or REST handler must verify the requesting user is `lease.tenantId`.
 * This service only checks invariants (status, FKs) and applies the
 * transition transactionally.
 */

export type TenantSignOutcome =
  | { kind: 'ok'; leaseId: string }
  | { kind: 'not_found'; leaseId: string }
  | { kind: 'not_tenant'; leaseId: string }
  | { kind: 'invalid_status'; leaseId: string; currentStatus: string }

export async function tenantSignLease(
  leaseId: string,
  tenantId: string,
): Promise<TenantSignOutcome> {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      tenantId: true,
      listingId: true,
      // SEC-M5 audit fix — defense in depth: re-verify the linked Payment
      // is CONFIRMED before activating. The state machine should already
      // guarantee this (only the CONFIRMED webhook moves DRAFT→PENDING_TENANT),
      // but a future bug elsewhere (admin tool, manual SQL fix, replay)
      // that promotes a DRAFT to PENDING_TENANT without payment confirming
      // must NOT let the tenant sign without AryTrano being paid.
      payment: { select: { status: true } },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          locale: true,
          // S2-25 — push to the owner's mobile if they registered a
          // token via the Expo app. null is the common case (owners
          // who only use the web).
          expoPushToken: true,
        },
      },
      tenant: { select: { name: true, email: true } },
      listing: { select: { title: true } },
    },
  })

  if (!lease) return { kind: 'not_found', leaseId }
  if (lease.tenantId !== tenantId) return { kind: 'not_tenant', leaseId }

  // Only PENDING_TENANT can become ACTIVE. DRAFT means the owner
  // hasn't paid yet — the tenant has no business signing.
  if (lease.status !== 'PENDING_TENANT') {
    return {
      kind: 'invalid_status',
      leaseId,
      currentStatus: lease.status,
    }
  }

  // SEC-M5 — Payment must be CONFIRMED. If it isn't, we surface the
  // payment status as the "current status" so observability still
  // captures the divergence.
  if (!lease.payment || lease.payment.status !== 'CONFIRMED') {
    return {
      kind: 'invalid_status',
      leaseId,
      currentStatus: `payment=${lease.payment?.status ?? 'missing'}`,
    }
  }

  const now = new Date()

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

  // Fire-and-forget owner notification.
  const leaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/dashboard/leases/${lease.id}`
  // Never leak the tenant's email local-part to the owner — use a
  // neutral fallback when name is null (memory `feedback_debug_logs_no_pii`).
  const ownerName = sanitizeEmailHeaderValue(
    lease.owner.name ?? lease.owner.email,
  )
  const tenantName = sanitizeEmailHeaderValue(
    lease.tenant.name ?? 'locataire',
  )
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

  // S2-25 — fire-and-forget owner push notification, parallel to the
  // email. Same security posture as notify-owner-contact (M2 audit) :
  // the push BODY is generic (no listingTitle on the lock screen);
  // the data payload carries `leaseId` so the mobile app can deep-link
  // to the detail screen where the title is shown in-app.
  if (lease.owner.expoPushToken) {
    const ownerLocale = fromPrismaLocale(lease.owner.locale)
    const pushTitle =
      ownerLocale === 'mg' ? 'Voasonia ny bail' : 'Ton bail est signé'
    const pushBody =
      ownerLocale === 'mg'
        ? "Nanaiky ny bail ny mpanofa. Sokafy ny app hijerena."
        : "Le locataire a accepté. Ouvre l'app pour voir les détails."
    void sendPush([
      {
        to: lease.owner.expoPushToken,
        title: pushTitle,
        body: pushBody,
        sound: 'default',
        data: { kind: 'leaseTenantSigned', leaseId: lease.id },
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

  return { kind: 'ok', leaseId: lease.id }
}
