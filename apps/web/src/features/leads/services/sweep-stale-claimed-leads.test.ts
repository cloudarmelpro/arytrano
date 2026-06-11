import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    leadRequest: { findMany: vi.fn(), updateMany: vi.fn() },
    leadActivity: { create: vi.fn() },
  },
}))

import { sweepStaleClaimedLeads } from './sweep-stale-claimed-leads'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.leadActivity.create).mockResolvedValue({
    id: 'cact_1',
    createdAt: new Date(),
  } as never)
})

describe('sweepStaleClaimedLeads', () => {
  it('returns zeros when nothing is past slaDueAt', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([] as never)
    const result = await sweepStaleClaimedLeads()
    expect(result).toEqual({ scanned: 0, reverted: 0, failed: 0 })
  })

  it('reverts each stale CLAIMED lead back to NEW + writes REASSIGNED', async () => {
    const slaDueAt = new Date('2026-06-10T00:00:00Z')
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', claimedByUserId: 'coperator_1', slaDueAt },
      { id: 'clead_2', claimedByUserId: 'coperator_2', slaDueAt },
    ] as never)
    vi.mocked(prisma.leadRequest.updateMany).mockResolvedValue({ count: 1 } as never)
    const result = await sweepStaleClaimedLeads()
    expect(result.reverted).toBe(2)
    const firstUpdate = vi.mocked(prisma.leadRequest.updateMany).mock.calls[0]?.[0]
    expect(firstUpdate?.data).toMatchObject({
      status: 'NEW',
      claimedByUserId: null,
      claimedAt: null,
      slaDueAt: null,
    })
    expect(prisma.leadActivity.create).toHaveBeenCalledTimes(2)
  })

  it('skips race-lost rows (updateMany returns count=0)', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', claimedByUserId: 'coperator_1', slaDueAt: new Date() },
    ] as never)
    vi.mocked(prisma.leadRequest.updateMany).mockResolvedValue({ count: 0 } as never)
    const result = await sweepStaleClaimedLeads()
    expect(result.reverted).toBe(0)
    expect(prisma.leadActivity.create).not.toHaveBeenCalled()
  })

  it('captures per-row errors and continues the batch', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_throws', claimedByUserId: 'coperator_x', slaDueAt: new Date() },
      { id: 'clead_ok',     claimedByUserId: 'coperator_y', slaDueAt: new Date() },
    ] as never)
    vi.mocked(prisma.leadRequest.updateMany)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ count: 1 } as never)
    const result = await sweepStaleClaimedLeads()
    expect(result.failed).toBe(1)
    expect(result.reverted).toBe(1)
  })
})
