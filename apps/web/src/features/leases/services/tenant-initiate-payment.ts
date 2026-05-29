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
      payment: { select: { status: true, providerTxId: true } },
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

  // Fresh idempotency key per attempt — if a previous Payment is
  // INITIATED/FAILED/EXPIRED we still let the tenant retry with a
  // fresh GoalPay session.
  const idempotencyKey = `lease_${cryptoRandomCuid()}`

  // Create the new Payment row.
  const payment = await prisma.payment.create({
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

  // Link the lease to the new payment attempt (replaces any prior
  // INITIATED/FAILED row's link).
  await prisma.lease.update({
    where: { id: lease.id },
    data: { paymentId: payment.id },
  })

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
