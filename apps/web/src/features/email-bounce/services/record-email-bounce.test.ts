import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@/lib/env', () => ({
  env: { EMAIL_BOUNCE_HARD_THRESHOLD: 3 },
}))
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { recordEmailBounce } from './record-email-bounce'
import { prisma } from '@/lib/db'

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.user.update).mockResolvedValue({} as never)
})

describe('recordEmailBounce', () => {
  it('ignores soft bounces', async () => {
    const out = await recordEmailBounce({ email: 'a@b.mg', kind: 'soft' })
    expect(out.kind).toBe('soft_ignored')
    expect(prisma.user.findFirst).not.toHaveBeenCalled()
  })

  it('returns no_match when no User exists for the address', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null as never)
    const out = await recordEmailBounce({ email: 'unknown@b.mg', kind: 'hard' })
    expect(out.kind).toBe('no_match')
  })

  it('increments the counter without disabling on hard #1', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      emailBouncesHard: 0,
      emailDisabledAt: null,
    } as never)
    const out = await recordEmailBounce({ email: 'a@b.mg', kind: 'hard' })
    expect(out).toMatchObject({ kind: 'recorded', userId: 'u1', nowDisabled: false })
    expect(vi.mocked(prisma.user.update).mock.calls[0]?.[0]).toMatchObject({
      data: { emailBouncesHard: 1 },
    })
  })

  it('disables the user when the threshold is crossed', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      emailBouncesHard: 2,
      emailDisabledAt: null,
    } as never)
    const out = await recordEmailBounce({ email: 'a@b.mg', kind: 'hard' })
    expect(out).toMatchObject({ kind: 'recorded', userId: 'u1', nowDisabled: true })
    const updateData = vi.mocked(prisma.user.update).mock.calls[0]?.[0].data
    expect(updateData).toHaveProperty('emailDisabledAt')
    expect(updateData?.emailBouncesHard).toBe(3)
  })

  it('does not re-stamp emailDisabledAt for an already-disabled user', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'u1',
      emailBouncesHard: 5,
      emailDisabledAt: new Date(),
    } as never)
    const out = await recordEmailBounce({ email: 'a@b.mg', kind: 'hard' })
    expect(out).toMatchObject({ nowDisabled: false })
    const updateData = vi.mocked(prisma.user.update).mock.calls[0]?.[0].data
    expect(updateData).not.toHaveProperty('emailDisabledAt')
    expect(updateData?.emailBouncesHard).toBe(6)
  })
})
