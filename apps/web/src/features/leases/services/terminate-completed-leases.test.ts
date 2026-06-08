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
// `$transaction` is mocked to invoke the callback with the same
// `prisma` stub (treating it as `tx`) so the inner updateMany calls
// route through the mocked methods. The H-3 audit fix wrapped the
// lease+listing flip in `prisma.$transaction(async (tx) => …)`.
vi.mock('@/lib/db', () => {
  const prisma = {
    lease: { findMany: vi.fn(), updateMany: vi.fn() },
    listing: { updateMany: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn(prisma),
    ),
  }
  return { prisma }
})
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))

import { terminateCompletedLeases } from './terminate-completed-leases'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.lease.updateMany).mockResolvedValue({
    count: 1,
  } as never)
  vi.mocked(prisma.listing.updateMany).mockResolvedValue({
    count: 1,
  } as never)
  // Re-apply the $transaction stub after clearAllMocks() wipes it.
  vi.mocked(prisma.$transaction).mockImplementation(
    async (fn: unknown) =>
      (fn as (tx: unknown) => Promise<unknown>)(prisma),
  )
})

const mkLease = (id: string, startDate: Date, durationMonths: number) => ({
  id,
  startDate,
  durationMonths,
  listingId: `listing_${id}`,
  owner: {
    id: `owner_${id}`,
    name: 'Hery R.',
    email: 'owner@example.mg',
    locale: 'FR_MG',
  },
  tenant: {
    id: `tenant_${id}`,
    name: 'Mialy R.',
    email: 'tenant@example.mg',
    locale: 'FR_MG',
  },
  listing: { title: 'Studio Andrainjato' },
})

describe('terminateCompletedLeases', () => {
  it('returns zero counts when no ACTIVE leases exist', async () => {
    vi.mocked(prisma.lease.findMany).mockResolvedValue([] as never)
    const result = await terminateCompletedLeases()
    expect(result).toEqual({ scanned: 0, terminated: 0 })
  })

  it('terminates leases whose end date has passed', async () => {
    // Lease started 13 months ago for 12 months → ended 1 month ago.
    const start = new Date()
    start.setMonth(start.getMonth() - 13)
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease('lease_ended', start, 12),
    ] as never)

    const result = await terminateCompletedLeases()

    expect(result.scanned).toBe(1)
    expect(result.terminated).toBe(1)
    expect(prisma.lease.updateMany).toHaveBeenCalledOnce()
    expect(prisma.listing.updateMany).toHaveBeenCalledOnce()
  })

  it('skips leases still within their term', async () => {
    // Lease started 3 months ago for 12 months → still 9 months left.
    const start = new Date()
    start.setMonth(start.getMonth() - 3)
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease('lease_active', start, 12),
    ] as never)

    const result = await terminateCompletedLeases()

    expect(result.scanned).toBe(1)
    expect(result.terminated).toBe(0)
    expect(prisma.lease.updateMany).not.toHaveBeenCalled()
    expect(prisma.listing.updateMany).not.toHaveBeenCalled()
  })

  it('handles a mixed batch — only the expired ones are processed', async () => {
    const oldStart = new Date()
    oldStart.setMonth(oldStart.getMonth() - 14)
    const recentStart = new Date()
    recentStart.setMonth(recentStart.getMonth() - 1)

    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease('lease_old', oldStart, 12),
      mkLease('lease_recent', recentStart, 12),
    ] as never)

    const result = await terminateCompletedLeases()

    expect(result.scanned).toBe(2)
    expect(result.terminated).toBe(1)
    expect(prisma.lease.updateMany).toHaveBeenCalledOnce()
    expect(prisma.listing.updateMany).toHaveBeenCalledOnce()
  })

  it('skips race-lost rows (updateMany returns count=0)', async () => {
    const start = new Date()
    start.setMonth(start.getMonth() - 14)
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease('lease_racey', start, 12),
    ] as never)
    vi.mocked(prisma.lease.updateMany).mockResolvedValueOnce({
      count: 0,
    } as never)

    const result = await terminateCompletedLeases()

    expect(result.terminated).toBe(0)
    expect(prisma.listing.updateMany).not.toHaveBeenCalled()
  })

  it('continues the batch when a single transition throws', async () => {
    const start = new Date()
    start.setMonth(start.getMonth() - 14)
    vi.mocked(prisma.lease.findMany).mockResolvedValue([
      mkLease('lease_throws', start, 12),
      mkLease('lease_ok', start, 12),
    ] as never)
    vi.mocked(prisma.lease.updateMany)
      .mockRejectedValueOnce(new Error('simulated DB blip'))
      .mockResolvedValueOnce({ count: 1 } as never)

    const result = await terminateCompletedLeases()

    expect(result.terminated).toBe(1)
  })
})
