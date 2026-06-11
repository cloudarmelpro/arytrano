import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_SECRET: 'test-secret', NODE_ENV: 'test' },
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    phoneOtpRequest: vi.fn(),
  },
}))
vi.mock('@/lib/sms', async () => {
  const actual = await vi.importActual<typeof import('@/lib/sms/types')>(
    '@/lib/sms/types',
  )
  return {
    sendSms: vi.fn(),
    SmsSendError: actual.SmsSendError,
  }
})
vi.mock('@/lib/db', () => ({
  prisma: {
    phoneOtp: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { requestPhoneOtp } from './request-phone-otp'
import { prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { sendSms, SmsSendError } from '@/lib/sms'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimiters.phoneOtpRequest).mockResolvedValue({ success: true })
  vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue(null as never)
  vi.mocked(prisma.phoneOtp.create).mockResolvedValue({ id: 'cotp_new' } as never)
  vi.mocked(prisma.phoneOtp.update).mockResolvedValue({} as never)
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
    const tx = {
      phoneOtp: {
        create: vi.fn().mockResolvedValue({ id: 'cotp_new' }),
        update: vi.fn().mockResolvedValue({}),
      },
    }
    return (fn as (tx: unknown) => Promise<unknown>)(tx)
  })
  vi.mocked(sendSms).mockResolvedValue({
    messageId: 'sms_1',
    provider: 'console',
  })
})

describe('requestPhoneOtp', () => {
  it('creates an OTP row + sends SMS on first request', async () => {
    const result = await requestPhoneOtp(
      { phoneE164: '+261341234567' },
      { ipHash: 'iphash' },
    )
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') expect(result.resent).toBe(false)
    expect(sendSms).toHaveBeenCalledOnce()
    const smsArg = vi.mocked(sendSms).mock.calls[0]?.[0]
    expect(smsArg?.to).toBe('+261341234567')
    expect(smsArg?.body).toMatch(/AryTrano.+\d{6}/)
  })

  it('marks the live row consumed when re-requesting (one-live-OTP invariant)', async () => {
    vi.mocked(prisma.phoneOtp.findFirst).mockResolvedValue({
      id: 'cotp_old',
      codeHash: '$2a$10$irrelevant',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    } as never)
    const result = await requestPhoneOtp(
      { phoneE164: '+261341234567' },
      { ipHash: 'iphash' },
    )
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') expect(result.resent).toBe(true)
    expect(sendSms).toHaveBeenCalledOnce()
  })

  it('returns rate_limited without touching the DB when the limiter fails', async () => {
    vi.mocked(rateLimiters.phoneOtpRequest).mockResolvedValue({
      success: false,
    })
    const result = await requestPhoneOtp(
      { phoneE164: '+261341234567' },
      { ipHash: 'iphash' },
    )
    expect(result.kind).toBe('rate_limited')
    expect(prisma.$transaction).not.toHaveBeenCalled()
    expect(sendSms).not.toHaveBeenCalled()
  })

  it('returns sms_failed with provider error code when SMS provider throws', async () => {
    vi.mocked(sendSms).mockRejectedValue(
      new SmsSendError({
        provider: 'twilio',
        code: 'invalid_recipient',
        message: 'bad number',
      }),
    )
    const result = await requestPhoneOtp(
      { phoneE164: '+1230000' },
      { ipHash: 'iphash' },
    )
    expect(result.kind).toBe('sms_failed')
    if (result.kind === 'sms_failed') expect(result.code).toBe('invalid_recipient')
  })
})
