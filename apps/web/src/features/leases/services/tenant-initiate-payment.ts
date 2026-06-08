import 'server-only'
import crypto from 'node:crypto'
import { prisma } from '@/lib/db'
import { goalPayProvider } from '@/features/payments/server'

/**
 * Tenant initiates the GoalPay checkout for a PENDING_TENANT lease
 * (revised E-T26, 2026-05-27).
 *
 * The tenant clicks "Accepter et payer" on the lease detail page;
 * this service :
 *   1. Verifies the lease is in PENDING_TENANT and the caller is the tenant
 *   2. Creates a Payment row (status=INITIATED) snapshot-linking the
 *      platformFeeMGA from the Lease
 *   3. Calls GoalPay → checkoutUrl
 *   4. Persists `providerTxId` + `expiresAt` on the Payment
 *   5. Sets Lease.paymentId on success so the webhook can resolve the
 *      lease from the Payment.idempotencyKey at confirmation time
 *
 * The Lease.status DOES NOT change here — it stays PENDING_TENANT
 * until the GoalPay webhook (HMAC-verified) flips it to ACTIVE via
 * apply-lease-payment-side-effect.
 *
 * Caller authorization is the Server Action's job. Service double-checks
 * via the `not_tenant` outcome.
 */

export type TenantInitiatePaymentResult =
  | {
      kind: 'ok'
      leaseId: string
      paymentId: string
      checkoutUrl: string
      expiresInMinutes: number
      platformFeeMGA: number
    }
  | { kind: 'lease_not_found'; leaseId: string }
  | { kind: 'not_tenant'; leaseId: string }
  | { kind: 'invalid_status'; leaseId: string; currentStatus: string }
  | { kind: 'already_paid'; leaseId: string; paymentId: string }
  /** Audit C2 — another tab / double-click is already mid-checkout.
   *  Tenant should wait or refresh ; the in-flight session expires in
   *  ~10 min, after which a fresh attempt is allowed. */
  | { kind: 'in_progress'; leaseId: string; paymentId: string }

export async function tenantInitiatePayment(
  leaseId: string,
  tenantId: string,
): Promise<TenantInitiatePaymentResult> {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    select: {
      id: true,
      status: true,
      tenantId: true,
      paymentId: true,
      platformFeeMGA: true,
      listing: { select: { title: true } },
      payment: {
        select: {
          status: true,
          providerTxId: true,
          expiresAt: true,
        },
      },
    },
  })

  if (!lease) return { kind: 'lease_not_found', leaseId }
  if (lease.tenantId !== tenantId) return { kind: 'not_tenant', leaseId }
  if (lease.status !== 'PENDING_TENANT') {
    return {
      kind: 'invalid_status',
      leaseId,
      currentStatus: lease.status,
    }
  }

  // If a Payment is already CONFIRMED for this lease, the webhook
  // is in flight or hasn't fired yet — bail with a typed outcome so
  // the action redirects to /transaction/done instead of paying twice.
  if (lease.payment && lease.payment.status === 'CONFIRMED') {
    return {
      kind: 'already_paid',
      leaseId,
      paymentId: lease.paymentId!,
    }
  }

  // Audit C2 fix — if a payment is already INITIATED, return early
  // so a double-click / second tab doesn't spawn a parallel GoalPay
  // session (whose webhook would land on a lease pointing to the
  // OTHER session's payment row → money lost).
  //
  // S2-26 follow-up : the previous INITIATED may simply be a stale
  // checkout the tenant abandoned (browser close, network drop).
  // GoalPay's TTL on the checkout URL is ~10 min ; once `expiresAt`
  // has passed, the session is dead and the tenant must be able to
  // retry. We mark the orphan as EXPIRED (with a `superseded` audit
  // row) so the create path below can proceed cleanly.
  if (lease.payment && lease.payment.status === 'INITIATED') {
    const now = new Date()
    const isStale =
      lease.payment.expiresAt !== null && lease.payment.expiresAt < now
    if (!isStale) {
      // Concurrent click — block.
      return {
        kind: 'in_progress',
        leaseId,
        paymentId: lease.paymentId!,
      }
    }
    // Stale — mark EXPIRED + audit, then continue to create a fresh
    // session. Run BOTH writes in a transaction so a crash mid-step
    // doesn't leave the lease pointing at a row whose status we just
    // started flipping.
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: lease.paymentId! },
        data: { status: 'EXPIRED' },
      }),
      prisma.paymentEvent.create({
        data: {
          paymentId: lease.paymentId!,
          status: 'EXPIRED',
          rawPayload: {
            reason: 'superseded',
            leaseId: lease.id,
            note: 'Stale INITIATED checkout replaced by a fresh tenant retry.',
          },
        },
      }),
    ])
  }

  // Fresh idempotency key per attempt — if a previous Payment is
  // FAILED/EXPIRED/CANCELED we let the tenant retry with a fresh
  // GoalPay session.
  const idempotencyKey = `lease_${cryptoRandomCuid()}`
  const previousPaymentId = lease.paymentId

  // Reserve the lease atomically. The conditional `updateMany` only
  // succeeds if `Lease.paymentId` is still what we read above (null
  // or the previous failed/expired payment). A concurrent transaction
  // that beat us would have set `Lease.paymentId` to its own new
  // payment — our WHERE wouldn't match anymore and `count` returns 0.
  //
  // Postgres row locks serialize the UPDATEs even at READ COMMITTED,
  // so this protects against the C2 race without needing Serializable
  // isolation (which would force retries on every contended lease).
  let payment: { id: string } | null = null
  try {
    payment = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          userId: tenantId,
          listingId: null,
          idempotencyKey,
          provider: 'GOALPAY',
          amountMGA: lease.platformFeeMGA,
          purpose: 'LEASE_SUCCESS_FEE',
          status: 'INITIATED',
        },
        select: { id: true },
      })
      const reserveRes = await tx.lease.updateMany({
        where: {
          id: lease.id,
          paymentId: previousPaymentId,
        },
        data: { paymentId: created.id },
      })
      if (reserveRes.count === 0) {
        // Race lost — another transaction won. Throwing rolls back
        // both the Payment.create and (no-op) Lease.update; we surface
        // 'in_progress' below.
        throw new Error('race_lost')
      }
      return created
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'race_lost') {
      return { kind: 'in_progress', leaseId, paymentId: '' }
    }
    throw err
  }

  if (!payment) {
    return { kind: 'in_progress', leaseId, paymentId: '' }
  }

  // Call GoalPay.
  const goalPayResponse = await goalPayProvider.initiate({
    reference: idempotencyKey,
    amountMGA: lease.platformFeeMGA,
    description: `Frais AryTrano — ${lease.listing.title}`,
    metadata: [
      {
        label: 'Frais AryTrano (20% du loyer)',
        unit_price: lease.platformFeeMGA,
        quantity: 1,
      },
    ],
  })

  const now = new Date()
  const expiresAt = new Date(
    now.getTime() + goalPayResponse.expiresInMinutes * 60_000,
  )
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      providerTxId: goalPayResponse.providerTxId,
      expiresAt,
    },
  })

  return {
    kind: 'ok',
    leaseId: lease.id,
    paymentId: payment.id,
    checkoutUrl: goalPayResponse.checkoutUrl,
    expiresInMinutes: goalPayResponse.expiresInMinutes,
    platformFeeMGA: lease.platformFeeMGA,
  }
}

/** Lightweight cuid-like random id for the idempotencyKey. Same
 *  pattern + security note as initiate-lease.ts's local helper. */
function cryptoRandomCuid(): string {
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
