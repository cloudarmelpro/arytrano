import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    payment: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    paymentEvent: {
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { reconcileStuckPayments } from './reconcile-stuck-payments'
import { prisma } from '@/lib/db'
import * as Sentry from '@sentry/nextjs'

beforeEach(() => {
  vi.clearAllMocks()
  // Bulk path: $transaction returns [updateManyResult, createManyResult].
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) {
        // Resolve each op so any inner mock returns flow through.
        const resolved = await Promise.all(ops)
        return resolved
      }
      throw new Error('Unexpected $transaction shape in test')
    },
  )
  vi.mocked(prisma.payment.updateMany).mockResolvedValue({ count: 0 } as never)
  vi.mocked(prisma.paymentEvent.createMany).mockResolvedValue({ count: 0 } as never)
})

describe('reconcileStuckPayments', () => {
  it('returns zero counts when nothing is stuck', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([])

    const result = await reconcileStuckPayments()

    expect(result).toEqual({ scanned: 0, markedExpired: 0 })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('issues a single bulk updateMany + createMany transaction for the whole batch', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      { id: 'p1' },
      { id: 'p2' },
      { id: 'p3' },
    ] as never)
    vi.mocked(prisma.payment.updateMany).mockResolvedValue({ count: 3 } as never)
    vi.mocked(prisma.paymentEvent.createMany).mockResolvedValue({ count: 3 } as never)

    const result = await reconcileStuckPayments()

    expect(result).toEqual({ scanned: 3, markedExpired: 3 })
    // PERF-M2 — one transaction regardless of batch size.
    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(prisma.payment.updateMany).toHaveBeenCalledOnce()
    expect(prisma.paymentEvent.createMany).toHaveBeenCalledOnce()
  })

  it('surfaces a batch failure to Sentry without throwing', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      { id: 'p1' },
      { id: 'p2' },
    ] as never)
    vi.mocked(prisma.$transaction).mockRejectedValueOnce(new Error('simulated DB blip'))

    const result = await reconcileStuckPayments()

    expect(result.scanned).toBe(2)
    expect(result.markedExpired).toBe(0)
    expect(Sentry.captureException).toHaveBeenCalledOnce()
  })

  it('captures a warning to Sentry when any rows were expired', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([{ id: 'p1' }] as never)
    vi.mocked(prisma.payment.updateMany).mockResolvedValue({ count: 1 } as never)

    await reconcileStuckPayments()

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('expired stuck rows'),
      expect.objectContaining({ level: 'warning' }),
    )
  })

  it('respects custom staleAfterMinutes', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([])
    await reconcileStuckPayments({ staleAfterMinutes: 240 })

    const call = vi.mocked(prisma.payment.findMany).mock.calls[0]?.[0]
    expect(call?.where?.createdAt).toBeDefined()
    // Threshold ~ 240 min ago. Just sanity check it's > 200 min in the past.
    const threshold = (call?.where?.createdAt as { lt: Date }).lt.getTime()
    expect(Date.now() - threshold).toBeGreaterThan(200 * 60_000)
  })
})
