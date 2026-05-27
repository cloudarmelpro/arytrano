import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_URL: 'https://arytrano.test', NODE_ENV: 'test' },
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    lease: { findUnique: vi.fn(), update: vi.fn() },
    payment: { findUnique: vi.fn(), update: vi.fn() },
    paymentEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))
vi.mock('@/lib/email/send-transactional', () => ({
  sendTransactionalEmail: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/lib/push/send-push', () => ({
  sendPush: vi.fn().mockResolvedValue({ accepted: 0, rejected: 0, tickets: [] }),
}))
vi.mock('@/lib/push/receipts', () => ({
  recordTickets: vi.fn().mockResolvedValue(undefined),
}))

import { refuseLease } from './refuse-lease'
import { sendPush } from '@/lib/push/send-push'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.$transaction).mockImplementation(
    async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      throw new Error('Unexpected $transaction shape')
    },
  )
})

const baseLease = {
  id: 'lease_1',
  status: 'PENDING_TENANT',
  tenantId: 'tenant_1',
  paymentId: 'pay_1',
  owner: {
    id: 'owner_1',
    name: 'Hery R.',
    email: 'owner@example.mg',
    locale: 'FR_MG',
    expoPushToken: null,
  },
  tenant: { name: 'Mialy R.', email: 'tenant@example.mg' },
  listing: { title: 'Studio Andrainjato' },
}

describe('refuseLease', () => {
  it('returns not_tenant for unauthorized callers', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(baseLease as never)

    const result = await refuseLease('lease_1', 'someone_else', 'reason')

    expect(result).toEqual({ kind: 'not_tenant', leaseId: 'lease_1' })
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('queues refund when linked Payment is CONFIRMED', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(baseLease as never)
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'CONFIRMED',
    } as never)

    const result = await refuseLease(
      'lease_1',
      'tenant_1',
      'Conditions différentes du verbal',
    )

    expect(result).toEqual({
      kind: 'ok',
      leaseId: 'lease_1',
      paymentRefundQueued: true,
    })
  })

  it('does not queue refund when Payment was not CONFIRMED', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(baseLease as never)
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'FAILED',
    } as never)

    const result = await refuseLease('lease_1', 'tenant_1', '')

    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.paymentRefundQueued).toBe(false)
    }
  })

  it('strips null bytes from reason before persisting (M3 fix)', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue(baseLease as never)
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'CONFIRMED',
    } as never)

    const nulByte = String.fromCharCode(0)
    await refuseLease('lease_1', 'tenant_1', `bad${nulByte}reason`)

    // The transaction ops include paymentEvent.create with a sanitized
    // `note`. We inspect the captured calls.
    const eventCalls = vi.mocked(prisma.paymentEvent.create).mock.calls
    expect(eventCalls.length).toBeGreaterThan(0)
    const note = (
      eventCalls[0]?.[0]?.data?.rawPayload as { note?: string } | undefined
    )?.note
    expect(note).toBeDefined()
    expect(note).not.toContain(nulByte)
    expect(note).toContain('bad')
    expect(note).toContain('reason')
  })

  it('rejects when lease is not PENDING_TENANT', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      ...baseLease,
      status: 'ACTIVE',
    } as never)

    const result = await refuseLease('lease_1', 'tenant_1', 'too late')
    expect(result).toEqual({
      kind: 'invalid_status',
      leaseId: 'lease_1',
      currentStatus: 'ACTIVE',
    })
  })

  it('fires owner push when expoPushToken is set (S2-25)', async () => {
    vi.mocked(prisma.lease.findUnique).mockResolvedValue({
      ...baseLease,
      owner: {
        ...baseLease.owner,
        expoPushToken: 'ExponentPushToken[abc123]',
      },
    } as never)
    vi.mocked(prisma.payment.findUnique).mockResolvedValue({
      id: 'pay_1',
      status: 'CONFIRMED',
    } as never)

    const result = await refuseLease('lease_1', 'tenant_1', 'on a trouvé autre')

    expect(result.kind).toBe('ok')
    expect(sendPush).toHaveBeenCalledOnce()
    const args = vi.mocked(sendPush).mock.calls[0]?.[0]
    expect(args![0]?.to).toBe('ExponentPushToken[abc123]')
    // Reason MUST NOT travel through the push payload — PII + lock screen.
    expect(args![0]?.body).not.toContain('on a trouvé autre')
    expect(args![0]?.data?.kind).toBe('leaseTenantRefused')
    expect(args![0]?.data?.leaseId).toBe('lease_1')
  })
})
