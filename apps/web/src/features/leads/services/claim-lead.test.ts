import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db', () => ({
  prisma: { $transaction: vi.fn() },
}))

import { claimLead, WIP_CAP_PER_OPERATOR } from './claim-lead'
import { prisma } from '@/lib/db'

type TxStub = {
  leadRequest: {
    findUnique: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    updateMany: ReturnType<typeof vi.fn>
  }
  leadActivity: { create: ReturnType<typeof vi.fn> }
}

function makeTx(): TxStub {
  return {
    leadRequest: {
      findUnique: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    leadActivity: { create: vi.fn().mockResolvedValue({ id: 'cact_1', createdAt: new Date() }) },
  }
}

let currentTx: TxStub

beforeEach(() => {
  vi.clearAllMocks()
  currentTx = makeTx()
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
    return (fn as (tx: TxStub) => Promise<unknown>)(currentTx)
  })
})

describe('claimLead', () => {
  it('claims a NEW lead and sets slaDueAt = now + 4h', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'NEW',
      claimedByUserId: null,
    })
    const before = Date.now()
    const result = await claimLead('clead_1', 'coperator_1')
    const after = Date.now()

    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      const sla = result.slaDueAt.getTime()
      expect(sla).toBeGreaterThanOrEqual(before + 4 * 60 * 60 * 1000)
      expect(sla).toBeLessThanOrEqual(after + 4 * 60 * 60 * 1000 + 100)
    }
  })

  it('returns lead_not_found when the lead is missing', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue(null)
    const result = await claimLead('cmissing_1', 'coperator_1')
    expect(result.kind).toBe('lead_not_found')
  })

  it('returns already_claimed when the lead is in CLAIMED state', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_other',
    })
    const result = await claimLead('clead_1', 'coperator_1')
    expect(result.kind).toBe('already_claimed')
    if (result.kind === 'already_claimed') {
      expect(result.claimedByUserId).toBe('coperator_other')
    }
  })

  it('returns invalid_status for non-NEW non-CLAIMED states', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'LAPSED',
      claimedByUserId: null,
    })
    const result = await claimLead('clead_1', 'coperator_1')
    expect(result.kind).toBe('invalid_status')
  })

  it('returns wip_cap_reached when operator already holds 6 active leads', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'NEW',
      claimedByUserId: null,
    })
    currentTx.leadRequest.count.mockResolvedValue(WIP_CAP_PER_OPERATOR)
    const result = await claimLead('clead_1', 'coperator_1')
    expect(result.kind).toBe('wip_cap_reached')
    if (result.kind === 'wip_cap_reached') {
      expect(result.cap).toBe(WIP_CAP_PER_OPERATOR)
      expect(result.currentCount).toBe(WIP_CAP_PER_OPERATOR)
    }
  })

  it('returns already_claimed when conditional updateMany lost the race', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'NEW',
      claimedByUserId: null,
    })
    currentTx.leadRequest.updateMany.mockResolvedValue({ count: 0 })
    const result = await claimLead('clead_1', 'coperator_1')
    expect(result.kind).toBe('already_claimed')
  })

  it('writes a CLAIMED activity on success', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'NEW',
      claimedByUserId: null,
    })
    await claimLead('clead_1', 'coperator_1')
    expect(currentTx.leadActivity.create).toHaveBeenCalledTimes(1)
    const data = currentTx.leadActivity.create.mock.calls[0]?.[0]?.data
    expect(data?.type).toBe('CLAIMED')
    expect(data?.actorRole).toBe('OPERATOR')
    expect(data?.actorUserId).toBe('coperator_1')
  })
})
