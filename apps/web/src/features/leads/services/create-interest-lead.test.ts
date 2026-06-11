import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { AUTH_SECRET: 'test-secret', NODE_ENV: 'test' },
}))
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}))
vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    leadSubmit: vi.fn(),
  },
}))
vi.mock('@/features/phone-otp/server', () => ({
  hasRecentlyVerifiedPhone: vi.fn(),
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    listing: { findUnique: vi.fn() },
    leadRequest: { findFirst: vi.fn(), create: vi.fn() },
    leadActivity: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))

import { createInterestLead } from './create-interest-lead'
import { prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { hasRecentlyVerifiedPhone } from '@/features/phone-otp/server'

const baseInput = {
  listingId: 'cabc1234567890123456789a',
  tenantName: 'Mialy R.',
  tenantPhone: '+261341234567',
  moveInWindow: 'NEXT_MONTH' as const,
  budgetConfirmed: true,
}
const baseContext = {
  tenantUserId: null,
  ipHash: 'iphash-abc',
  source: 'WEB' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(rateLimiters.leadSubmit).mockResolvedValue({ success: true })
  vi.mocked(hasRecentlyVerifiedPhone).mockResolvedValue(true)
  vi.mocked(prisma.listing.findUnique).mockResolvedValue({
    id: baseInput.listingId,
    status: 'PUBLISHED',
  } as never)
  vi.mocked(prisma.leadRequest.findFirst).mockResolvedValue(null as never)
  vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
    const tx = {
      leadRequest: {
        create: vi.fn().mockResolvedValue({
          id: 'cnewleadidnewleadidnewleadid',
          createdAt: new Date('2026-06-10T10:00:00Z'),
        }),
      },
      leadActivity: { create: vi.fn().mockResolvedValue({ id: 'cact_1', createdAt: new Date() }) },
    }
    return (fn as (tx: unknown) => Promise<unknown>)(tx)
  })
})

describe('createInterestLead', () => {
  it('creates a lead in NEW when listing is PUBLISHED and rate-limit passes', async () => {
    const result = await createInterestLead(baseInput, baseContext)
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.leadId).toBe('cnewleadidnewleadidnewleadid')
    }
    expect(rateLimiters.leadSubmit).toHaveBeenCalledWith(
      expect.any(String),
      'iphash-abc',
    )
  })

  it('returns rate_limited when the limiter rejects', async () => {
    vi.mocked(rateLimiters.leadSubmit).mockResolvedValue({ success: false })
    const result = await createInterestLead(baseInput, baseContext)
    expect(result.kind).toBe('rate_limited')
    expect(prisma.listing.findUnique).not.toHaveBeenCalled()
  })

  // T-002 gate
  it('returns otp_required when anonymous submitter has no recent verification', async () => {
    vi.mocked(hasRecentlyVerifiedPhone).mockResolvedValue(false)
    const result = await createInterestLead(baseInput, baseContext)
    expect(result.kind).toBe('otp_required')
    expect(prisma.listing.findUnique).not.toHaveBeenCalled()
  })

  it('skips the OTP gate when tenantUserId is set (signed-in tenant)', async () => {
    vi.mocked(hasRecentlyVerifiedPhone).mockResolvedValue(false)
    const result = await createInterestLead(baseInput, {
      ...baseContext,
      tenantUserId: 'cusersignedinusersignedinuser',
    })
    expect(result.kind).toBe('ok')
    expect(hasRecentlyVerifiedPhone).not.toHaveBeenCalled()
  })

  it('returns listing_not_found when the listing is missing', async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue(null as never)
    const result = await createInterestLead(baseInput, baseContext)
    expect(result.kind).toBe('listing_not_found')
  })

  it('returns listing_not_rentable on DRAFT / RENTED / UNAVAILABLE', async () => {
    vi.mocked(prisma.listing.findUnique).mockResolvedValue({
      id: baseInput.listingId,
      status: 'RENTED',
    } as never)
    const result = await createInterestLead(baseInput, baseContext)
    expect(result.kind).toBe('listing_not_rentable')
    if (result.kind === 'listing_not_rentable') {
      expect(result.currentStatus).toBe('RENTED')
    }
  })

  it('returns duplicate when same phone hit the same listing in the last 24h', async () => {
    vi.mocked(prisma.leadRequest.findFirst).mockResolvedValue({
      id: 'cexistingleadidexistingleadid',
    } as never)
    const result = await createInterestLead(baseInput, baseContext)
    expect(result.kind).toBe('duplicate')
    if (result.kind === 'duplicate') {
      expect(result.existingLeadId).toBe('cexistingleadidexistingleadid')
    }
  })

  it('phoneHash is deterministic for the same phone (rate-limit + dedupe rely on it)', async () => {
    await createInterestLead(baseInput, baseContext)
    await createInterestLead(baseInput, baseContext)
    const calls = vi.mocked(rateLimiters.leadSubmit).mock.calls
    expect(calls[0]?.[0]).toBe(calls[1]?.[0])
  })

  it('sets actorRole=TENANT when context.tenantUserId is set', async () => {
    const activityCreate = vi.fn().mockResolvedValue({ id: 'cact_1', createdAt: new Date() })
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
      const tx = {
        leadRequest: {
          create: vi.fn().mockResolvedValue({
            id: 'cnewleadidnewleadidnewleadid',
            createdAt: new Date(),
          }),
        },
        leadActivity: { create: activityCreate },
      }
      return (fn as (tx: unknown) => Promise<unknown>)(tx)
    })
    await createInterestLead(baseInput, {
      ...baseContext,
      tenantUserId: 'cusertenanttenanttenantuser',
    })
    const payload = activityCreate.mock.calls[0]?.[0]?.data
    expect(payload?.actorRole).toBe('TENANT')
    expect(payload?.actorUserId).toBe('cusertenanttenanttenantuser')
  })

  it('sets actorRole=SYSTEM for anonymous submissions', async () => {
    const activityCreate = vi.fn().mockResolvedValue({ id: 'cact_1', createdAt: new Date() })
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
      const tx = {
        leadRequest: {
          create: vi.fn().mockResolvedValue({
            id: 'cnewleadidnewleadidnewleadid',
            createdAt: new Date(),
          }),
        },
        leadActivity: { create: activityCreate },
      }
      return (fn as (tx: unknown) => Promise<unknown>)(tx)
    })
    await createInterestLead(baseInput, baseContext)
    const payload = activityCreate.mock.calls[0]?.[0]?.data
    expect(payload?.actorRole).toBe('SYSTEM')
    expect(payload?.actorUserId).toBe(null)
  })
})
