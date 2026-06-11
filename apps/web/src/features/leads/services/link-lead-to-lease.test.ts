import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/db', () => ({
  prisma: { $transaction: vi.fn() },
}))

import { linkLeadToLease } from './link-lead-to-lease'
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

describe('linkLeadToLease', () => {
  it('flips CLAIMED → CONVERTED with leaseId and writes CONVERTED activity', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_1',
      leaseId: null,
    })
    const result = await linkLeadToLease(
      { leadId: 'clead_1', leaseId: 'clease_1' },
      'coperator_1',
    )
    expect(result.kind).toBe('ok')
    const data = currentTx.leadRequest.update.mock.calls[0]?.[0]?.data
    expect(data?.status).toBe('CONVERTED')
    expect(data?.leaseId).toBe('clease_1')
    expect(currentTx.leadActivity.create).toHaveBeenCalledOnce()
  })

  it('returns ok idempotently when already CONVERTED to the same leaseId', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CONVERTED',
      claimedByUserId: 'coperator_1',
      leaseId: 'clease_1',
    })
    const result = await linkLeadToLease(
      { leadId: 'clead_1', leaseId: 'clease_1' },
      'coperator_1',
    )
    expect(result.kind).toBe('ok')
    expect(currentTx.leadRequest.update).not.toHaveBeenCalled()
  })

  it('returns already_linked_to_other when leaseId mismatches', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CONVERTED',
      claimedByUserId: 'coperator_1',
      leaseId: 'cdifferentlease',
    })
    const result = await linkLeadToLease(
      { leadId: 'clead_1', leaseId: 'clease_1' },
      'coperator_1',
    )
    expect(result.kind).toBe('already_linked_to_other')
  })

  it('rejects when the operator is not the current claimer', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'CLAIMED',
      claimedByUserId: 'coperator_other',
      leaseId: null,
    })
    const result = await linkLeadToLease(
      { leadId: 'clead_1', leaseId: 'clease_1' },
      'coperator_1',
    )
    expect(result.kind).toBe('not_claimer')
  })

  it('rejects when status is NEW (must claim first)', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'NEW',
      claimedByUserId: 'coperator_1',
      leaseId: null,
    })
    const result = await linkLeadToLease(
      { leadId: 'clead_1', leaseId: 'clease_1' },
      'coperator_1',
    )
    expect(result.kind).toBe('invalid_status')
  })

  it('rejects when status is LAPSED', async () => {
    currentTx.leadRequest.findUnique.mockResolvedValue({
      id: 'clead_1',
      status: 'LAPSED',
      claimedByUserId: 'coperator_1',
      leaseId: null,
    })
    const result = await linkLeadToLease(
      { leadId: 'clead_1', leaseId: 'clease_1' },
      'coperator_1',
    )
    expect(result.kind).toBe('invalid_status')
  })
})
