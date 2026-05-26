import 'server-only'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeaseTenantSignedEmail } from '@/lib/email/templates/lease-tenant-signed'
import { fromPrismaLocale } from '@/lib/i18n/config'

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
      owner: {
        select: { id: true, name: true, email: true, locale: true },
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

  return { kind: 'ok', leaseId: lease.id }
}
