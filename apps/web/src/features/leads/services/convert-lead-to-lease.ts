import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { calculatePlatformFee } from '@/features/leases'
import { linkLeadToLease } from './link-lead-to-lease'
import { writeLeadActivity } from './write-lead-activity'

/**
 * E-T28 T-RES-07 — operator converts a CLAIMED lead into a Lease.
 *
 * The operator orchestrator differs from the owner-initiated
 * `initiateLease` in two ways :
 *
 *  1) Authorization is keyed off the LeadRequest (operator must hold
 *     it, must be ADMIN — caller gates ADMIN at the action / handler
 *     boundary; the service double-checks claimedByUserId).
 *  2) Owner Terms gate is BYPASSED — operators are vouching for the
 *     owner's verbal acceptance during the off-platform WhatsApp
 *     negotiation. The runbook (T-RES-12) requires the operator to
 *     verbally confirm CGU acceptance before triggering the
 *     conversion.
 *
 * Side effects (atomic in one transaction) :
 *  - Lease created in PENDING_TENANT with ownerSignedAt = now
 *  - LeadRequest.status flipped to CONVERTED + leaseId stamped
 *  - LeadActivity(CONVERTED) written referencing the operator
 *
 * The post-create tenant invite email lives in the Lease wizard
 * path today ; for v1 we DO NOT send it from this operator path —
 * the tenant already knows (they declared interest via the lead),
 * the operator follows up via WhatsApp using the leaseLink template
 * (T-RES-08). Adding email here is a v1.1 enhancement once the
 * email template signaling is reviewed.
 */

const convertInputSchema = z.object({
  leadId: z
    .string()
    .regex(/^c[a-z0-9]{20,40}$/, 'Identifiant lead invalide'),
  tenantEmail: z.string().email().toLowerCase().max(254),
  startDate: z.coerce.date().refine(
    (d) => d.getTime() >= startOfTodayUtc(),
    'startDate cannot be in the past',
  ),
  durationMonths: z
    .coerce
    .number()
    .int()
    .positive()
    .max(60, 'Au-delà de 5 ans, renouveler le bail.'),
})

export type ConvertLeadInput = z.infer<typeof convertInputSchema>

export type ConvertLeadOutcome =
  | {
      kind: 'ok'
      leaseId: string
      leadId: string
      platformFeeMGA: number
    }
  | { kind: 'lead_not_found' }
  | { kind: 'not_claimer'; actualClaimer: string | null }
  | { kind: 'invalid_status'; currentStatus: string }
  | { kind: 'listing_not_rentable'; currentStatus: string }
  | { kind: 'tenant_not_found'; tenantEmail: string }
  | { kind: 'tenant_is_owner' }
  | { kind: 'existing_lease'; existingLeaseId: string; status: string }
  | {
      kind: 'validation_failed'
      issues: Array<{ path: string; message: string }>
    }

export async function convertLeadToLease(
  rawInput: unknown,
  operatorId: string,
): Promise<ConvertLeadOutcome> {
  const parsed = convertInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return {
      kind: 'validation_failed',
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    }
  }
  const input = parsed.data

  // 1) Load lead + listing snapshot atomically. Reject early if the
  //    operator can't act (not claimer / wrong status).
  const lead = await prisma.leadRequest.findUnique({
    where: { id: input.leadId },
    select: {
      id: true,
      status: true,
      claimedByUserId: true,
      leaseId: true,
      listing: {
        select: {
          id: true,
          ownerId: true,
          status: true,
          priceMonthlyMGA: true,
          cautionMonths: true,
        },
      },
    },
  })
  if (!lead) return { kind: 'lead_not_found' }
  if (lead.claimedByUserId !== operatorId) {
    return { kind: 'not_claimer', actualClaimer: lead.claimedByUserId }
  }
  const inFlight = ['CLAIMED', 'IN_DISCUSSION', 'AWAITING_OWNER', 'AWAITING_TENANT']
  if (!inFlight.includes(lead.status)) {
    return { kind: 'invalid_status', currentStatus: lead.status }
  }
  if (lead.listing.status !== 'PUBLISHED') {
    return {
      kind: 'listing_not_rentable',
      currentStatus: lead.listing.status,
    }
  }

  // 2) Tenant must already have an AryTrano account. Operator is
  //    responsible for asking the visitor to create one if missing.
  const tenant = await prisma.user.findUnique({
    where: { email: input.tenantEmail },
    select: { id: true, status: true },
  })
  if (!tenant || tenant.status !== 'ACTIVE') {
    return { kind: 'tenant_not_found', tenantEmail: input.tenantEmail }
  }
  if (tenant.id === lead.listing.ownerId) {
    return { kind: 'tenant_is_owner' }
  }

  // 3) Reject if a blocking Lease already exists on this listing.
  const blockingLease = await prisma.lease.findFirst({
    where: {
      listingId: lead.listing.id,
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

  // 4) Snapshot the fee derived from the listing's current monthly rent
  //    (SEC-H2 audit pattern — never trust client-supplied rent).
  //    Round — cautionMonths is Float (½-mois supported), MGA has no
  //    subunit.
  const cautionMGA = Math.round(
    lead.listing.priceMonthlyMGA * lead.listing.cautionMonths,
  )
  const { platformFeeMGA } = calculatePlatformFee({
    monthlyRentMGA: lead.listing.priceMonthlyMGA,
  })

  // 5) Create Lease + LeadActivity in one transaction so a crash
  //    between the two writes can't leave an orphan Lease without a
  //    convert-event trail.
  const now = new Date()
  const { lease, linkOutcome } = await prisma.$transaction(async (tx) => {
    const lease = await tx.lease.create({
      data: {
        listingId: lead.listing.id,
        ownerId: lead.listing.ownerId,
        tenantId: tenant.id,
        monthlyRentMGA: lead.listing.priceMonthlyMGA,
        cautionMGA,
        startDate: input.startDate,
        durationMonths: input.durationMonths,
        platformFeeMGA,
        status: 'PENDING_TENANT',
        ownerSignedAt: now,
      },
      select: { id: true },
    })
    // Custom activity write — `linkLeadToLease` uses its own tx, but
    // here we want everything in one. Inline both moves : flip lead
    // status + write the CONVERTED activity.
    const updated = await tx.leadRequest.updateMany({
      where: { id: lead.id, status: lead.status },
      data: { status: 'CONVERTED', leaseId: lease.id },
    })
    let linkOutcome: 'ok' | 'race_lost' = 'ok'
    if (updated.count === 0) linkOutcome = 'race_lost'
    else {
      await writeLeadActivity(tx, {
        leadId: lead.id,
        type: 'CONVERTED',
        actorRole: 'OPERATOR',
        actorUserId: operatorId,
        payload: { leaseId: lease.id, fromStatus: lead.status },
      })
    }
    return { lease, linkOutcome }
  })

  if (linkOutcome === 'race_lost') {
    // Someone else flipped the lead between read and write — best-
    // effort idempotent link via the dedicated service.
    await linkLeadToLease(
      { leadId: lead.id, leaseId: lease.id },
      operatorId,
    )
  }

  return {
    kind: 'ok',
    leaseId: lease.id,
    leadId: lead.id,
    platformFeeMGA,
  }
}

function startOfTodayUtc(): number {
  const now = new Date()
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}
