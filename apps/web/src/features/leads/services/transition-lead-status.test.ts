import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db', () => ({
  prisma: { $transaction: vi.fn() },
}))

import { transitionLeadStatus } from './transition-lead-status'
import { prisma } from '@/lib/db'

type TxStub = {
  leadRequest: {
    findUnique: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  leadActivity: { create: ReturnType<typeof vi.fn> }
}

function makeTx(): TxStub {
  return {
    leadRequest: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    leadActivity: { create: vi.fn().mockResolvedValue({ id: 'cact_1', createdAt: new Date() }) },
  }
}

let currentTx: TxStub
beforeEach(() => {
  vi.clearAllMocks()
  currentTx = makeTx()
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) =>
    (fn as (tx: TxStub) => Promise<unknown>)(currentTx),
  )
})

describe('transitionLeadStatus', () => {
  it('allows CLAIMED → IN_DISCUSSION with a channel and stamps firstContactedAt', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_1',
      firstContactedAt: null,
    })
    const result = await transitionLeadStatus(
      { leadId: 'clead_1', nextStatus: 'IN_DISCUSSION', channel: 'whatsapp' },
      'coperator_1',
    )
    expect(result.kind).toBe('ok')
    const updateData = currentTx.leadRequest.update.mock.calls[0]?.[0]?.data
    expect(updateData?.status).toBe('IN_DISCUSSION')
    expect(updateData?.firstContactedAt).toBeInstanceOf(Date)
    const activityType = currentTx.leadActivity.create.mock.calls[0]?.[0]?.data?.type
    expect(activityType).toBe('MESSAGED')
  })

  it('writes NOTE when nothing flips status semantics (no channel, not REJECTED)', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_1',
      firstContactedAt: new Date('2026-06-10T08:00:00Z'),
    })
    await transitionLeadStatus(
      { leadId: 'clead_1', nextStatus: 'AWAITING_OWNER', note: 'attente confirmation' },
      'coperator_1',
    )
    const activityType = currentTx.leadActivity.create.mock.calls[0]?.[0]?.data?.type
    expect(activityType).toBe('NOTE')
  })

  it('writes REJECTED activity when nextStatus=REJECTED regardless of channel', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'IN_DISCUSSION',
      claimedByUserId: 'coperator_1',
      firstContactedAt: new Date(),
    })
    await transitionLeadStatus(
      { leadId: 'clead_1', nextStatus: 'REJECTED', channel: 'phone', note: 'owner off-platform' },
      'coperator_1',
    )
    const activityType = currentTx.leadActivity.create.mock.calls[0]?.[0]?.data?.type
    expect(activityType).toBe('REJECTED')
  })

  it('rejects CLAIMED → CONVERTED (must go through linkLeadToLease)', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_1',
      firstContactedAt: null,
    })
    const result = await transitionLeadStatus(
      { leadId: 'clead_1', nextStatus: 'CONVERTED' },
      'coperator_1',
    )
    expect(result.kind).toBe('invalid_transition')
  })

  it('rejects when the caller is not the current claimer', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_other',
      firstContactedAt: null,
    })
    const result = await transitionLeadStatus(
      { leadId: 'clead_1', nextStatus: 'IN_DISCUSSION', channel: 'whatsapp' },
      'coperator_1',
    )
    expect(result.kind).toBe('not_claimer')
  })

  it('returns lead_not_found when the lead is missing', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue(null)
    const result = await transitionLeadStatus(
      { leadId: 'cmissing', nextStatus: 'IN_DISCUSSION' },
      'coperator_1',
    )
    expect(result.kind).toBe('lead_not_found')
  })

  it('does not overwrite firstContactedAt once it is set', async () => {
    const original = new Date('2026-06-10T08:00:00Z')
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'IN_DISCUSSION',
      claimedByUserId: 'coperator_1',
      firstContactedAt: original,
    })
    await transitionLeadStatus(
      { leadId: 'clead_1', nextStatus: 'AWAITING_OWNER', channel: 'whatsapp' },
      'coperator_1',
    )
    const updateData = currentTx.leadRequest.update.mock.calls[0]?.[0]?.data
    expect(updateData?.firstContactedAt).toBeUndefined()
  })
})
