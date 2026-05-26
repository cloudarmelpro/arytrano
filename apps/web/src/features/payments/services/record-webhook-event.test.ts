import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { NODE_ENV: 'test' },
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    payment: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    paymentEvent: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

import { recordWebhookEvent } from './record-webhook-event'
import { prisma } from '@/lib/db'
import type { WebhookEvent } from '@/lib/payments/types'

const baseEvent: WebhookEvent = {
  event: 'payment.success',
  orderReference: 'REF_GP_001',
  reference: 'cmh_internal_ref_abc',
  amountMGA: 15000,
  currency: 'Ar',
  description: 'Lease success fee',
}

beforeEach(() => {
  vi.clearAllMocks()
  // Default mock for $transaction: just run the array of promises.
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      throw new Error('Unexpected $transaction shape in test')
    },
  )
})

describe('recordWebhookEvent', () => {
  it('returns unknown_reference when no Payment matches', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue(null)

    const outcome = await recordWebhookEvent(baseEvent)

    expect(outcome).toEqual({
      kind: 'unknown_reference',
      reference: 'cmh_internal_ref_abc',
    })
    expect(prisma.payment.update).not.toHaveBeenCalled()
    expect(prisma.paymentEvent.create).not.toHaveBeenCalled()
  })

  it('returns mismatch when amount differs from stored row', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'INITIATED',
      amountMGA: 99999, // != 15000
      providerTxId: null,
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)

    expect(outcome).toEqual({
      kind: 'mismatch',
      paymentId: 'pay_1',
      reason: 'amount',
    })
    expect(prisma.payment.update).not.toHaveBeenCalled()
  })

  it('returns mismatch when stored providerTxId differs', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'INITIATED',
      amountMGA: 15000,
      providerTxId: 'REF_GP_DIFFERENT',
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)

    expect(outcome).toEqual({
      kind: 'mismatch',
      paymentId: 'pay_1',
      reason: 'providerTxId',
    })
  })

  it('applies the transition on first webhook (INITIATED → CONFIRMED)', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'INITIATED',
      amountMGA: 15000,
      providerTxId: null,
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)

    expect(outcome).toEqual({
      kind: 'applied',
      paymentId: 'pay_1',
      newStatus: 'CONFIRMED',
      purpose: 'LEASE_SUCCESS_FEE',
    })
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })

  it('maps payment.failed → FAILED', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'INITIATED',
      amountMGA: 15000,
      providerTxId: null,
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent({
      ...baseEvent,
      event: 'payment.failed',
      error: 'Insufficient funds',
    })

    expect(outcome).toEqual({
      kind: 'applied',
      paymentId: 'pay_1',
      newStatus: 'FAILED',
      purpose: 'LEASE_SUCCESS_FEE',
    })
  })

  it('maps payment.canceled → CANCELED and payment.expired → EXPIRED', async () => {
    for (const [event, expected] of [
      ['payment.canceled', 'CANCELED'],
      ['payment.expired', 'EXPIRED'],
    ] as const) {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue({
        id: 'pay_x',
        status: 'INITIATED',
        amountMGA: 15000,
        providerTxId: null,
        purpose: 'LEASE_SUCCESS_FEE',
      } as never)
      const outcome = await recordWebhookEvent({ ...baseEvent, event })
      expect(outcome).toMatchObject({
        kind: 'applied',
        newStatus: expected,
        purpose: 'LEASE_SUCCESS_FEE',
      })
    }
  })

  it('is idempotent on terminal status — returns noop, no Payment.update', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'CONFIRMED', // already terminal
      amountMGA: 15000,
      providerTxId: 'REF_GP_001',
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)

    expect(outcome).toEqual({
      kind: 'noop',
      paymentId: 'pay_1',
      existingStatus: 'CONFIRMED',
    })
    // Audit row still gets written even on noop
    expect(prisma.paymentEvent.create).toHaveBeenCalledOnce()
    expect(prisma.payment.update).not.toHaveBeenCalled()
  })

  it('is idempotent for already-refunded payments (no resurrection)', async () => {
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'REFUNDED',
      amountMGA: 15000,
      providerTxId: 'REF_GP_001',
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)
    expect(outcome.kind).toBe('noop')
    if (outcome.kind === 'noop') {
      expect(outcome.existingStatus).toBe('REFUNDED')
    }
  })
})
