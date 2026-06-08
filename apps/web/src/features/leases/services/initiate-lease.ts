import 'server-only'
import { after } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { sanitizeEmailHeaderValue } from '@/lib/email/sanitize-header'
import { buildLeaseInviteTenantEmail } from '@/lib/email/templates/lease-invite-tenant'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { formatAriary } from '@/lib/format/currency'
import { ownerTermsAcceptedFor } from '@/features/auth/server'
import {
  initiateLeaseInputSchema,
  type InitiateLeaseInput,
} from '../schemas/lease-input'
import { calculatePlatformFee } from '../calculate-fees'

/**
 * Owner-initiated lease creation (revised E-T26, 2026-05-27).
 *
 * NEW MODEL : the owner pays NOTHING to AryTrano. The tenant pays the
 * platform fee (= 20% × monthlyRent, snapshotted) when they ACCEPT
 * the lease via the dashboard. Rent + caution still flow OFFLINE
 * between tenant and owner.
 *
 * Flow :
 *   1. Validate input (Zod)
 *   2. Verify the listing belongs to the caller and is rentable
 *   3. Find the tenant User by email (must already have an AryTrano account)
 *   4. Reject if the listing already has an active or pending lease
 *   5. Snapshot the platform fee (% × monthly rent) on the Lease row
 *   6. Create Lease in `PENDING_TENANT` straight away — `ownerSignedAt`
 *      = now, since "creating the lease" is the owner's commitment.
 *   7. Return the leaseId — the wizard redirects to the detail page.
 *
 * No GoalPay call here anymore. The Payment row is created only when
 * the tenant clicks "Accepter et payer" (see tenant-initiate-payment).
 */

export type InitiateLeaseResult =
  | {
      kind: 'ok'
      leaseId: string
      platformFeeMGA: number
    }
  | { kind: 'owner_terms_not_accepted' }
  | { kind: 'listing_not_found' }
  | { kind: 'listing_not_owned' }
  | { kind: 'listing_not_rentable'; currentStatus: string }
  | { kind: 'tenant_not_found'; tenantEmail: string }
  | { kind: 'tenant_is_owner' }
  | { kind: 'existing_lease'; existingLeaseId: string; status: string }
  | { kind: 'validation_failed'; issues: Array<{ path: string; message: string }> }

export async function initiateLease(
  ownerId: string,
  rawInput: unknown,
): Promise<InitiateLeaseResult> {
  // 0) Owner Terms gate — defense in depth. The dashboard layout
  //    redirects unaccepted owners to /onboarding/owner/terms, but
  //    a mobile client hitting POST /api/v1/leases with a bearer
  //    token would otherwise skip the gate entirely. Audit C1.
  const accepted = await ownerTermsAcceptedFor(ownerId)
  if (!accepted) {
    return { kind: 'owner_terms_not_accepted' }
  }

  // 1) Validate input
  const parsed = initiateLeaseInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      kind: 'validation_failed',
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    }
  }
  const input: InitiateLeaseInput = parsed.data

  // 2) Verify listing ownership + rentable status. Read priceMonthlyMGA
  //    + cautionMonths here so the cautionMGA and platformFeeMGA are
  //    DERIVED server-side (single source of truth on the listing).
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: {
      id: true,
      ownerId: true,
      status: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
    },
  })
  if (!listing) return { kind: 'listing_not_found' }
  if (listing.ownerId !== ownerId) return { kind: 'listing_not_owned' }
  if (listing.status !== 'PUBLISHED') {
    return { kind: 'listing_not_rentable', currentStatus: listing.status }
  }

  // 3) Find tenant by email — must exist. We also pull the locale + name
  //    here so the invite email is rendered without a second roundtrip.
  const tenant = await prisma.user.findUnique({
    where: { email: input.tenantEmail },
    select: { id: true, status: true, name: true, locale: true },
  })
  if (!tenant || tenant.status !== 'ACTIVE') {
    return { kind: 'tenant_not_found', tenantEmail: input.tenantEmail }
  }
  if (tenant.id === ownerId) {
    return { kind: 'tenant_is_owner' }
  }

  // Also pull listing title + owner name for the invite email.
  const ownerForEmail = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { name: true, email: true },
  })
  const listingForEmail = await prisma.listing.findUnique({
    where: { id: listing.id },
    select: { title: true },
  })

  // 4) Reject if the listing already has an active or pending lease.
  const blockingLease = await prisma.lease.findFirst({
    where: {
      listingId: listing.id,
      status: { in: ['PENDING_TENANT', 'ACTIVE', 'DISPUTED'] },
    },
    select: { id: true, status: true },
  })
  if (blockingLease) {
    return {
      kind: 'existing_lease',
      existingLeaseId: blockingLease.id,
      status: blockingLease.status,
    }
  }

  // 5) Snapshot the fee derived from the listing's current monthly rent.
  const cautionMGA = listing.priceMonthlyMGA * listing.cautionMonths
  const { platformFeeMGA } = calculatePlatformFee({
    monthlyRentMGA: listing.priceMonthlyMGA,
  })

  // 6) Create the Lease in PENDING_TENANT straight away — owner
  //    commits by creating, no payment step required.
  const now = new Date()
  const lease = await prisma.lease.create({
    data: {
      listingId: listing.id,
      ownerId,
      tenantId: tenant.id,
      // SEC-H2 audit fix — monthlyRentMGA + cautionMGA sourced server-side.
      monthlyRentMGA: listing.priceMonthlyMGA,
      cautionMGA,
      startDate: input.startDate,
      durationMonths: input.durationMonths,
      platformFeeMGA,
      status: 'PENDING_TENANT',
      ownerSignedAt: now,
    },
    select: { id: true },
  })

  // 7) Notify the tenant via email. Deferred via `after()` so the wizard
  //    redirect happens immediately and the SMTP round-trip doesn't
  //    block the owner's response.
  if (ownerForEmail && listingForEmail) {
    const leaseUrl = `${env.AUTH_URL.replace(/\/$/, '')}/dashboard/leases/${lease.id}`
    const recipientName = sanitizeEmailHeaderValue(tenant.name ?? 'locataire')
    const ownerName = sanitizeEmailHeaderValue(
      ownerForEmail.name ?? ownerForEmail.email,
    )
    const listingTitle = sanitizeEmailHeaderValue(listingForEmail.title)
    const deferEmail = async () => {
      try {
        const built = buildLeaseInviteTenantEmail(
          fromPrismaLocale(tenant.locale),
          {
            recipientName,
            ownerName,
            listingTitle,
            monthlyRentFormatted: formatAriary(listing.priceMonthlyMGA),
            cautionFormatted:
              cautionMGA > 0 ? formatAriary(cautionMGA) : '0 Ar',
            platformFeeFormatted: formatAriary(platformFeeMGA),
            leaseUrl,
          },
        )
        await sendTransactionalEmail({
          recipientId: tenant.id,
          recipientEmail: input.tenantEmail,
          eventType: 'lease-invite-tenant',
          subject: built.subject,
          html: built.html,
          text: built.text,
        })
      } catch (err) {
        Sentry.captureException(err, {
          tags: { kind: 'lease-invite-tenant-after' },
          extra: { leaseId: lease.id },
        })
      }
    }
    try {
      after(deferEmail)
    } catch {
      void deferEmail()
    }
  }

  return {
    kind: 'ok',
    leaseId: lease.id,
    platformFeeMGA,
  }
}
