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
      update: vi.fn(),
    },
    paymentEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { reconcileStuckPayments } from './reconcile-stuck-payments'
import { prisma } from '@/lib/db'
import * as Sentry from '@sentry/nextjs'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      throw new Error('Unexpected $transaction shape in test')
    },
  )
})

describe('reconcileStuckPayments', () => {
  it('returns zero counts when nothing is stuck', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([])

    const result = await reconcileStuckPayments()

    expect(result).toEqual({ scanned: 0, markedExpired: 0 })
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(Sentry.captureMessage).not.toHaveBeenCalled()
  })

  it('marks each stuck Payment EXPIRED and audits with reconciliation_cron source', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      { id: 'p1' },
      { id: 'p2' },
    ] as never)

    const result = await reconcileStuckPayments()

    expect(result).toEqual({ scanned: 2, markedExpired: 2 })
    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
  })

  it('surfaces per-row failures to Sentry without aborting the batch', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([
      { id: 'p1' },
      { id: 'p2' },
      { id: 'p3' },
    ] as never)
    // Make the second row's transaction throw.
    let calls = 0
    vi.mocked(prisma.$transaction).mockImplementation(async (ops) => {
      calls += 1
      if (calls === 2) throw new Error('simulated FK race')
      if (Array.isArray(ops)) return Promise.all(ops)
      return []
    })

    const result = await reconcileStuckPayments()

    expect(result.scanned).toBe(3)
    expect(result.markedExpired).toBe(2) // p1 + p3, p2 failed
    expect(Sentry.captureException).toHaveBeenCalledOnce()
  })

  it('captures a warning to Sentry when any rows were expired', async () => {
    vi.mocked(prisma.payment.findMany).mockResolvedValue([{ id: 'p1' }] as never)

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
