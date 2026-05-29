import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_URL: 'https://arytrano.test', NODE_ENV: 'test' },
}))
vi.mock('next/server', () => ({
  after: vi.fn(() => {
    throw new Error('after() outside request scope (test)')
  }),
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    lease: { findUnique: vi.fn(), update: vi.fn() },
    listing: { update: vi.fn() },
    payment: { update: vi.fn() },
    paymentEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/push/send-push', () => ({
  sendPush: vi.fn().mockResolvedValue({ accepted: 0, rejected: 0, tickets: [] }),
}))
vi.mock('@/lib/push/receipts', () => ({
  recordTickets: vi.fn().mockResolvedValue(undefined),
}))

import { applyLeasePaymentSideEffect } from './apply-lease-payment-side-effect'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      throw new Error('Unexpected $transaction shape')
    },
  )
})

describe('applyLeasePaymentSideEffect (revised E-T26 — tenant pays)', () => {
  it('noop when Payment did not transition to CONFIRMED', async () => {
    const out = await applyLeasePaymentSideEffect('pay_1', 'FAILED')
    expect(out).toEqual({
      kind: 'noop',
      paymentId: 'pay_1',
      reason: 'status=FAILED',
    })
    expect(prisma.lease.findUnique).not.toHaveBeenCalled()
  })

  it.each(['CANCELED', 'EXPIRED', 'INITIATED', 'PENDING', 'REFUNDED'] as const)(
    'noop for non-CONFIRMED status %s',
    async (status) => {
      const out = await applyLeasePaymentSideEffect('pay_1', status)
      expect(out.kind).toBe('noop')
      expect(prisma.lease.findUnique).not.toHaveBeenCalled()
    },
  )

  it('returns no_lease_linked when no Lease is linked (legacy purpose)', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(null)
    const out = await applyLeasePaymentSideEffect('pay_legacy', 'CONFIRMED')
    expect(out).toEqual({ kind: 'no_lease_linked', paymentId: 'pay_legacy' })
  })

  it('transitions Lease PENDING_TENANT → ACTIVE + flips Listing to RENTED', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'PENDING_TENANT',
      listingId: 'listing_1',
      monthlyRentMGA: 250_000,
      cautionMGA: 500_000,
      platformFeeMGA: 50_000,
      owner: {
        id: 'owner_1',
        name: 'Hery R.',
        email: 'owner@example.mg',
        locale: 'FR_MG',
        expoPushToken: null,
      },
      tenant: { name: 'Mialy R.', email: 'tenant@example.mg' },
      listing: { title: 'Studio Andrainjato' },
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out).toEqual({
      kind: 'lease_now_active',
      leaseId: 'lease_1',
    })
    // Single $transaction with the lease + listing updates.
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })

  it('is idempotent — already_active replay is a noop', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'ACTIVE',
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out).toEqual({
      kind: 'already_active',
      leaseId: 'lease_1',
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('does not clobber a DRAFT lease (vestigial state)', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'DRAFT',
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out.kind).toBe('noop')
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('does not resurrect a REFUSED Lease', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'REFUSED',
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out.kind).toBe('noop')
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
