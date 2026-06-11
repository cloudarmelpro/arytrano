import { describe, it, expect, beforeEach, vi } from 'vitest'
import bcrypt from 'bcryptjs'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_SECRET: 'test-secret', NODE_ENV: 'test' },
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    phoneOtp: { findFirst: vi.fn(), update: vi.fn() },
  },
}))

import { verifyPhoneOtp, hasRecentlyVerifiedPhone } from './verify-phone-otp'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.phoneOtp.update).mockResolvedValue({} as never)
})

describe('verifyPhoneOtp', () => {
  it('returns ok and sets verifiedAt when code matches', async () => {
    const codeHash = await bcrypt.hash('123456', 4)
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue({
      id: 'cotp_1',
      codeHash,
      attempts: 0,
    } as never)
    const result = await verifyPhoneOtp({
      phoneE164: '+261341234567',
      code: '123456',
    })
    expect(result.kind).toBe('ok')
    const updateArg = vi.mocked(prisma.phoneOtp.update).mock.calls[0]?.[0]
    expect(updateArg?.data).toHaveProperty('verifiedAt')
  })

  it('returns no_pending_code when no live row exists', async () => {
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(null as never)
    const result = await verifyPhoneOtp({
      phoneE164: '+261341234567',
      code: '000000',
    })
    expect(result.kind).toBe('no_pending_code')
  })

  it('increments attempts on wrong code and surfaces attemptsLeft', async () => {
    const codeHash = await bcrypt.hash('999999', 4)
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue({
      id: 'cotp_1',
      codeHash,
      attempts: 0,
    } as never)
    const result = await verifyPhoneOtp({
      phoneE164: '+261341234567',
      code: '000000',
    })
    expect(result.kind).toBe('invalid_code')
    if (result.kind === 'invalid_code') expect(result.attemptsLeft).toBe(2)
    const updateArg = vi.mocked(prisma.phoneOtp.update).mock.calls[0]?.[0]
    expect(updateArg?.data).toMatchObject({ attempts: 1 })
    expect(updateArg?.data).not.toHaveProperty('consumedAt')
  })

  it('burns the row when the cap is reached on the wrong attempt', async () => {
    const codeHash = await bcrypt.hash('999999', 4)
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue({
      id: 'cotp_1',
      codeHash,
      attempts: 2,
    } as never)
    const result = await verifyPhoneOtp({
      phoneE164: '+261341234567',
      code: '000000',
    })
    expect(result.kind).toBe('invalid_code')
    if (result.kind === 'invalid_code') expect(result.attemptsLeft).toBe(0)
    const updateArg = vi.mocked(prisma.phoneOtp.update).mock.calls[0]?.[0]
    expect(updateArg?.data).toHaveProperty('consumedAt')
  })

  it('rejects already-capped rows defensively + marks consumed', async () => {
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue({
      id: 'cotp_1',
      codeHash: '$2a$04$irrelevant',
      attempts: 3,
    } as never)
    const result = await verifyPhoneOtp({
      phoneE164: '+261341234567',
      code: '123456',
    })
    expect(result.kind).toBe('too_many_attempts')
    const updateArg = vi.mocked(prisma.phoneOtp.update).mock.calls[0]?.[0]
    expect(updateArg?.data).toHaveProperty('consumedAt')
  })
})

describe('hasRecentlyVerifiedPhone', () => {
  it('returns true when a recently verified row exists', async () => {
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue({ id: 'x' } as never)
    expect(await hasRecentlyVerifiedPhone('+261341234567')).toBe(true)
  })
  it('returns false when no recent verification exists', async () => {
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(null as never)
    expect(await hasRecentlyVerifiedPhone('+261341234567')).toBe(false)
  })
})
