import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    leadRequest: { findMany: vi.fn(), updateMany: vi.fn() },
    leadActivity: { findFirst: vi.fn(), create: vi.fn() },
  },
}))

import { sweepLapsedLeads } from './sweep-lapsed-leads'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.leadActivity.create).mockResolvedValue({
    id: 'cact_1',
    createdAt: new Date(),
  } as never)
})

describe('sweepLapsedLeads', () => {
  it('returns zeros when nothing is in-flight + stale', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([] as never)
    const result = await sweepLapsedLeads()
    expect(result).toEqual({ scanned: 0, lapsed: 0, failed: 0 })
  })

  it('archives leads with no human activity in 14 days', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', status: 'IN_DISCUSSION' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst).mockResolvedValue(null as never)
    vi.mocked(prisma.leadRequest.updateMany).mockResolvedValue({ count: 1 } as never)
    const result = await sweepLapsedLeads()
    expect(result.lapsed).toBe(1)
    const updateData = vi.mocked(prisma.leadRequest.updateMany).mock.calls[0]?.[0]
    expect(updateData?.data).toMatchObject({ status: 'LAPSED' })
    expect(prisma.leadActivity.create).toHaveBeenCalledOnce()
  })

  it('does NOT archive when a recent human activity exists', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_recent', status: 'AWAITING_OWNER' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst).mockResolvedValue({
      createdAt: new Date(),
    } as never)
    const result = await sweepLapsedLeads()
    expect(result.lapsed).toBe(0)
    expect(prisma.leadRequest.updateMany).not.toHaveBeenCalled()
  })

  it('skips race-lost rows (status flipped between findMany and updateMany)', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_1', status: 'IN_DISCUSSION' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst).mockResolvedValue(null as never)
    vi.mocked(prisma.leadRequest.updateMany).mockResolvedValue({ count: 0 } as never)
    const result = await sweepLapsedLeads()
    expect(result.lapsed).toBe(0)
    expect(prisma.leadActivity.create).not.toHaveBeenCalled()
  })

  it('captures per-row errors and continues', async () => {
    vi.mocked(prisma.leadRequest.findMany).mockResolvedValue([
      { id: 'clead_throws', status: 'IN_DISCUSSION' },
      { id: 'clead_ok', status: 'IN_DISCUSSION' },
    ] as never)
    vi.mocked(prisma.leadActivity.findFirst).mockResolvedValue(null as never)
    vi.mocked(prisma.leadRequest.updateMany)
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce({ count: 1 } as never)
    const result = await sweepLapsedLeads()
    expect(result.failed).toBe(1)
    expect(result.lapsed).toBe(1)
  })
})
