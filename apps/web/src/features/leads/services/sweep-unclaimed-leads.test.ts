import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    leadRequest: { findMany: vi.fn() },
    leadActivity: { findFirst: vi.fn(), create: vi.fn() },
  },
}))

import { sweepUnclaimedLeads } from './sweep-unclaimed-leads'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.leadActivity.create).mockResolvedValue({
    id: 'cact_1',
    createdAt: new Date(),
  } as never)
})

describe('sweepUnclaimedLeads', () => {
  it('returns zero counts when no NEW leads are stale', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([] as never)
    const result = await sweepUnclaimedLeads()
    expect(result).toEqual({ scanned: 0, escalated: 0, skippedRecentWarn: 0 })
  })

  it('writes a NO_RESPONSE_WARN activity for each unclaimed lead older than 4h', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', listingId: 'clist_1' },
      { id: 'clead_2', listingId: 'clist_2' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst).mockResolvedValue(null as never)
    const result = await sweepUnclaimedLeads()
    expect(result.escalated).toBe(2)
    expect(result.skippedRecentWarn).toBe(0)
    expect(prisma.leadActivity.create).toHaveBeenCalledTimes(2)
  })

  it('skips leads that already got a NO_RESPONSE_WARN within the dedupe window', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', listingId: 'clist_1' },
      { id: 'clead_2', listingId: 'clist_2' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst)
      .mockResolvedValueOnce({ id: 'crecentwarn' } as never)
      .mockResolvedValueOnce(null as never)
    const result = await sweepUnclaimedLeads()
    expect(result.escalated).toBe(1)
    expect(result.skippedRecentWarn).toBe(1)
  })

  it('continues the batch when an individual activity write fails', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', listingId: 'clist_1' },
      { id: 'clead_2', listingId: 'clist_2' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst).mockResolvedValue(null as never)
    vi.mocked(prisma.leadActivity.create)
      .mockRejectedValueOnce(new Error('db blip'))
      .mockResolvedValueOnce({ id: 'cact_2', createdAt: new Date() } as never)
    const result = await sweepUnclaimedLeads()
    expect(result.escalated).toBe(1)
  })
})
