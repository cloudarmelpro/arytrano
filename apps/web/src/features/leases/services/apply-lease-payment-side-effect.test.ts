import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_URL: 'https://arytrano.test', NODE_ENV: 'test' },
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    lease: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))

import { applyLeasePaymentSideEffect } from './apply-lease-payment-side-effect'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('applyLeasePaymentSideEffect', () => {
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

  it('transitions Lease DRAFT → PENDING_TENANT and sets ownerSignedAt', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'DRAFT',
      monthlyRentMGA: 250_000,
      cautionMGA: 500_000,
      owner: { name: 'Hery R.', email: 'owner@example.mg' },
      tenant: {
        id: 'tenant_1',
        name: 'Mialy R.',
        email: 'tenant@example.mg',
        locale: 'FR_MG',
      },
      listing: { title: 'Studio Andrainjato' },
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out).toEqual({
      kind: 'lease_now_pending_tenant',
      leaseId: 'lease_1',
    })
    expect(prisma.lease.update).toHaveBeenCalledOnce()
    const call = vi.mocked(prisma.lease.update).mock.calls[0]?.[0]
    expect(call).toMatchObject({
      where: { id: 'lease_1' },
      data: { status: 'PENDING_TENANT' },
    })
    expect(call?.data.ownerSignedAt).toBeInstanceOf(Date)
  })

  it('is idempotent — already_pending replay does NOT rewrite ownerSignedAt', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'PENDING_TENANT',
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out).toEqual({
      kind: 'already_pending',
      leaseId: 'lease_1',
    })
    expect(prisma.lease.update).not.toHaveBeenCalled()
  })

  it('does not clobber an already-ACTIVE Lease', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'ACTIVE',
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out.kind).toBe('noop')
    expect(prisma.lease.update).not.toHaveBeenCalled()
  })

  it('does not resurrect a REFUSED Lease', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      id: 'lease_1',
      status: 'REFUSED',
    } as never)

    const out = await applyLeasePaymentSideEffect('pay_1', 'CONFIRMED')

    expect(out.kind).toBe('noop')
    expect(prisma.lease.update).not.toHaveBeenCalled()
  })
})
