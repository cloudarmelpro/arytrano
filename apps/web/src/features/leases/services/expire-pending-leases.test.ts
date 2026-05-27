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
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    lease: { findMany: vi.fn(), updateMany: vi.fn() },
    payment: { update: vi.fn() },
    paymentEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))

import { expirePendingLeases } from './expire-pending-leases'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      throw new Error('Unexpected $transaction shape')
    },
  )
  vi.mocked(prisma.lease.updateMany).mockResolvedValue({
    count: 1,
  } as never)
})

const mkLease = (overrides: Partial<{ id: string; paymentStatus: string | null }>) => ({
  id: overrides.id ?? 'lease_1',
  paymentId: overrides.paymentStatus ? 'pay_1' : null,
  owner: {
    id: 'owner_1',
    name: 'Hery R.',
    email: 'owner@example.mg',
    locale: 'FR_MG',
  },
  tenant: {
    id: 'tenant_1',
    name: 'Mialy R.',
    email: 'tenant@example.mg',
    locale: 'FR_MG',
  },
  listing: { title: 'Studio Andrainjato' },
  payment: overrides.paymentStatus
    ? { id: 'pay_1', status: overrides.paymentStatus }
    : null,
})

describe('expirePendingLeases', () => {
  it('returns zero counts when no stale lease exists', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([] as never)

    const result = await expirePendingLeases()

    expect(result).toEqual({ scanned: 0, expired: 0, refundQueued: 0 })
    expect(prisma.lease.updateMany).not.toHaveBeenCalled()
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('expires stale leases and queues refund when Payment is CONFIRMED', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease({ id: 'lease_1', paymentStatus: 'CONFIRMED' }),
      mkLease({ id: 'lease_2', paymentStatus: 'CONFIRMED' }),
    ] as never)

    const result = await expirePendingLeases()

    expect(result.scanned).toBe(2)
    expect(result.expired).toBe(2)
    expect(result.refundQueued).toBe(2)
    // Refund path : 1 $transaction call per refund-queued lease
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
    expect(prisma.lease.updateMany).toHaveBeenCalledTimes(2)
  })

  it('expires the lease but skips refund queue when no Payment is linked', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease({ id: 'lease_1', paymentStatus: null }),
    ] as never)

    const result = await expirePendingLeases()

    expect(result.expired).toBe(1)
    expect(result.refundQueued).toBe(0)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('does not queue refund when Payment is not CONFIRMED', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease({ id: 'lease_1', paymentStatus: 'INITIATED' }),
    ] as never)

    const result = await expirePendingLeases()

    expect(result.expired).toBe(1)
    expect(result.refundQueued).toBe(0)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('skips race-lost rows (updateMany returns count=0)', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease({ id: 'lease_winner', paymentStatus: 'CONFIRMED' }),
      mkLease({ id: 'lease_racey', paymentStatus: 'CONFIRMED' }),
    ] as never)
    // First lease : we win the race. Second : tenant accepted in the
    // meantime, the WHERE status='PENDING_TENANT' filter matches 0.
    vi.mocked(prisma.lease.updateMany)
      .mockResolvedValueOnce({ count: 1 } as never)
      .mockResolvedValueOnce({ count: 0 } as never)

    const result = await expirePendingLeases()

    expect(result.scanned).toBe(2)
    expect(result.expired).toBe(1)
    expect(result.refundQueued).toBe(1)
    // Only 1 refund $transaction (skipped on the race-lost row)
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })

  it('continues batch when a single transition throws', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease({ id: 'lease_throws', paymentStatus: 'CONFIRMED' }),
      mkLease({ id: 'lease_ok', paymentStatus: 'CONFIRMED' }),
    ] as never)
    vi.mocked(prisma.lease.updateMany)
      .mockRejectedValueOnce(new Error('simulated DB blip'))
      .mockResolvedValueOnce({ count: 1 } as never)

    const result = await expirePendingLeases()

    // First failed silently, second succeeded → batch survives
    expect(result.scanned).toBe(2)
    expect(result.expired).toBe(1)
    expect(result.refundQueued).toBe(1)
  })

  it('respects custom staleAfterDays', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([] as never)

    await expirePendingLeases({ staleAfterDays: 7 })

    const call = vi.mocked(prisma.lease.findMany).mock.calls[0]?.[0]
    expect(call?.where?.createdAt).toBeDefined()
    const threshold = (call?.where?.createdAt as { lt: Date }).lt.getTime()
    // Sanity check : threshold is between 6.5d and 7.5d in the past.
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    expect(Date.now() - threshold).toBeGreaterThan(sevenDays - 1_000_000)
    expect(Date.now() - threshold).toBeLessThan(sevenDays + 1_000_000)
  })
})
