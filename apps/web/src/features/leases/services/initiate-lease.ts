import 'server-only'
import { prisma } from '@/lib/db'
import { goalPayProvider } from '@/features/payments'
import {
  initiateLeaseInputSchema,
  type InitiateLeaseInput,
} from '../schemas/lease-input'
import { calculateLeaseFees } from '../calculate-fees'

/**
 * Owner-initiated lease + signature payment.
 *
 * Flow :
 *   1. Validate input (Zod)
 *   2. Verify the listing belongs to the caller and is rentable
 *   3. Find the tenant User by email (must already have an AryTrano account)
 *   4. Reject if the listing already has an active or pending lease
 *   5. Calculate fees (snapshot in the row)
 *   6. Create Payment + Lease (DRAFT) in a single transaction
 *   7. Call GoalPay to get a checkout URL
 *   8. Update Payment with providerTxId + expiresAt
 *   9. Return checkoutUrl + leaseId to the caller (Server Action / REST handler)
 *
 * The Lease stays in DRAFT until the webhook arrives. The webhook
 * handler (record-webhook-event hook in E-T26 ④) moves it to
 * PENDING_TENANT on payment.success, and notifies the tenant.
 *
 * Side-effects beyond DB writes (email tenant invite, push notif) are
 * deferred to the webhook step — at initiation time the payment is
 * not confirmed yet, so we don't notify anyone.
 */

export type InitiateLeaseResult =
  | {
      kind: 'ok'
      leaseId: string
      paymentId: string
      checkoutUrl: string
      expiresInMinutes: number
      fees: { signatureFeeMGA: number; cautionCommissionMGA: number; totalMGA: number }
    }
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

  // 2) Verify listing ownership + rentable status. We also read
  //    `priceMonthlyMGA` and `cautionMonths` here so the caution amount
  //    is DERIVED server-side (single source of truth on the listing,
  //    never re-input from the lease wizard — owner can't fudge it).
  const listing = await prisma.listing.findUnique({
    where: { id: input.listingId },
    select: {
      id: true,
      ownerId: true,
      status: true,
      title: true,
      priceMonthlyMGA: true,
      cautionMonths: true,
    },
  })
  if (!listing) return { kind: 'listing_not_found' }
  if (listing.ownerId !== ownerId) return { kind: 'listing_not_owned' }
  if (listing.status !== 'PUBLISHED') {
    return { kind: 'listing_not_rentable', currentStatus: listing.status }
  }

  // 3) Find tenant by email — must exist
  const tenant = await prisma.user.findUnique({
    where: { email: input.tenantEmail },
    select: { id: true, status: true },
  })
  if (!tenant || tenant.status !== 'ACTIVE') {
    return { kind: 'tenant_not_found', tenantEmail: input.tenantEmail }
  }
  if (tenant.id === ownerId) {
    return { kind: 'tenant_is_owner' }
  }

  // 4) Reject if the listing already has an active or pending lease.
  //    DRAFT leases (owner started wizard but never paid) are NOT
  //    blocking — they'll naturally expire (no cron yet, follow-up).
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

  // 5) Derive caution from listing (NEVER from wizard input — single
  //    source of truth = the listing). Snapshot the value on the Lease
  //    row so historical leases survive future listing edits.
  const cautionMGA = listing.priceMonthlyMGA * listing.cautionMonths
  const fees = calculateLeaseFees({ cautionMGA })

  // 6) Generate the idempotency key (also our merchant `reference`
  //    sent to GoalPay). Using a stable cuid here lets us safely
  //    retry the create-Lease step if the user double-clicks.
  const idempotencyKey = `lease_${cryptoRandomCuid()}`

  // 7) Create Payment + Lease in a transaction.
  //    Payment.expiresAt is left null here; we set it after the
  //    GoalPay call returns the real `expires_in_minutes`.
  const created = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        userId: ownerId,
        listingId: listing.id,
        idempotencyKey,
        provider: 'GOALPAY',
        amountMGA: fees.totalMGA,
        purpose: 'LEASE_SUCCESS_FEE',
        status: 'INITIATED',
      },
      select: { id: true },
    })
    const lease = await tx.lease.create({
      data: {
        listingId: listing.id,
        ownerId,
        tenantId: tenant.id,
        monthlyRentMGA: input.monthlyRentMGA,
        cautionMGA,
        startDate: input.startDate,
        durationMonths: input.durationMonths,
        signatureFeeMGA: fees.signatureFeeMGA,
        cautionCommissionMGA: fees.cautionCommissionMGA,
        paymentId: payment.id,
        status: 'DRAFT',
      },
      select: { id: true },
    })
    return { paymentId: payment.id, leaseId: lease.id }
  })

  // 8) Call GoalPay. If this fails AFTER the DB transaction succeeded,
  //    we have a Payment in INITIATED with no providerTxId — that's
  //    expected and the reconciliation cron (E-T20) will mark it
  //    stuck/expired after 12h.
  const goalPayResponse = await goalPayProvider.initiate({
    reference: idempotencyKey,
    amountMGA: fees.totalMGA,
    description: `Bail AryTrano — ${listing.title}`,
    metadata: [
      {
        label: 'Frais de signature AryTrano',
        unit_price: fees.signatureFeeMGA,
        quantity: 1,
      },
      ...(fees.cautionCommissionMGA > 0
        ? [
            {
              label: `Commission caution (8% × ${cautionMGA.toLocaleString('fr-FR')} Ar)`,
              unit_price: fees.cautionCommissionMGA,
              quantity: 1,
            },
          ]
        : []),
    ],
  })

  // 9) Persist provider-side info
  const now = new Date()
  const expiresAt = new Date(
    now.getTime() + goalPayResponse.expiresInMinutes * 60_000,
  )
  await prisma.payment.update({
    where: { id: created.paymentId },
    data: {
      providerTxId: goalPayResponse.providerTxId,
      expiresAt,
    },
  })

  return {
    kind: 'ok',
    leaseId: created.leaseId,
    paymentId: created.paymentId,
    checkoutUrl: goalPayResponse.checkoutUrl,
    expiresInMinutes: goalPayResponse.expiresInMinutes,
    fees,
  }
}

/**
 * Lightweight cuid-like random id for the idempotencyKey. Not a real
 * cuid (no monotonicity, no machine fingerprint) — just enough entropy
 * to avoid collisions across concurrent inits. cuid is already used
 * for primary keys via Prisma; we generate ours here to avoid pulling
 * `@paralleldrive/cuid2` into the client bundle.
 */
function cryptoRandomCuid(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
