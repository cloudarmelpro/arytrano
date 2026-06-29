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
      updateMany: vi.fn(),
    },
    paymentEvent: {
      create: vi.fn(),
      // PAY-14 — pre-check for replays before any other work.
      findUnique: vi.fn(),
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
  // PAY-14 — default: no prior replay row, so recordWebhookEvent falls
  // through to the real state machine. Tests that exercise the replay
  // path override this in-test.
  vi.mocked(prisma.paymentEvent.findUnique).mockResolvedValue(null as never)
  // Support both shapes : array (legacy batch form, used by other
  // services) and async callback (interactive form, used here for the
  // race-safe conditional update). Default `updateMany.count = 1` so
  // the happy path is "we won the race".
  vi.mocked(prisma.payment.updateMany).mockResolvedValue({ count: 1 } as never)
  vi.mocked(prisma.$transaction).mockImplementation(
    async (opsOrCb: unknown) => {
      if (Array.isArray(opsOrCb)) return Promise.all(opsOrCb)
      if (typeof opsOrCb === 'function') {
        // Pass the prisma mock itself as the `tx` argument — the inner
        // calls go through the same vi.fn() mocks set up above.
        return (opsOrCb as (tx: unknown) => unknown)(prisma)
      }
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
    // Audit H2 fix — must use updateMany (with status filter) not
    // update, so concurrent webhooks don't both commit the transition.
    expect(prisma.payment.updateMany).toHaveBeenCalledOnce()
    expect(prisma.payment.update).not.toHaveBeenCalled()
  })

  it('returns noop when a concurrent webhook flipped the row first (race-lost)', async () => {
    // The findUnique sees a stale INITIATED, but by the time we hit
    // updateMany the row was already moved to a terminal status by a
    // concurrent handler — the conditional WHERE matches 0 rows.
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_race',
      status: 'INITIATED',
      amountMGA: 15000,
      providerTxId: null,
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)
    vi.mocked(prisma.payment.updateMany).mockResolvedValueOnce({
      count: 0,
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)

    expect(outcome).toEqual({
      kind: 'noop',
      paymentId: 'pay_race',
      existingStatus: 'INITIATED',
    })
    // Audit row STILL written — we want the event in the trail even
    // when it didn't drive a transition.
    expect(prisma.paymentEvent.create).toHaveBeenCalledOnce()
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

  it('rejects payment.success with amount=0 as mismatch (audit P-M3)', async () => {
    // Zod schema accepts `nonnegative` so 0 passes validation. But no
    // legitimate Mobile Money success goes through at 0 — must be a
    // provider bug or upstream amountMGA=0 leak. Service must flag it.
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_zero',
      status: 'INITIATED',
      amountMGA: 0,
      providerTxId: null,
      purpose: 'LEASE_SUCCESS_FEE',
    } as never)

    const outcome = await recordWebhookEvent({
      ...baseEvent,
      amountMGA: 0,
    })

    expect(outcome).toEqual({
      kind: 'mismatch',
      paymentId: 'pay_zero',
      reason: 'amount',
    })
    expect(prisma.$transaction).not.toHaveBeenCalled()
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

  it('PAY-14: short-circuits on exact-replay via PaymentEvent.dedupKey', async () => {
    // A prior event with the same dedupKey already exists.
    vi.mocked(prisma.paymentEvent.findUnique).mockResolvedValue({
      paymentId: 'pay_1',
      payment: { status: 'CONFIRMED' },
    } as never)

    const outcome = await recordWebhookEvent(baseEvent)
    expect(outcome.kind).toBe('noop')
    if (outcome.kind === 'noop') {
      expect(outcome.paymentId).toBe('pay_1')
      expect(outcome.existingStatus).toBe('CONFIRMED')
    }
    // We skip ALL downstream work — no Payment lookup, no insert.
    expect(prisma.payment.findUnique).not.toHaveBeenCalled()
    expect(prisma.paymentEvent.create).not.toHaveBeenCalled()
    expect(prisma.payment.updateMany).not.toHaveBeenCalled()
  })
})
