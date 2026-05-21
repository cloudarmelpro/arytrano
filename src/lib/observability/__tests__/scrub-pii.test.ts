import { describe, it, expect } from 'vitest'
import { scrubPii, maskPii } from '../scrub-pii'
import type { Event } from '@sentry/nextjs'

describe('maskPii', () => {
  it('replaces emails with <email>', () => {
    expect(maskPii('Failed for user@example.com')).toBe('Failed for <email>')
    expect(maskPii('multiple: a@b.co + c@d.mg')).toBe('multiple: <email> + <email>')
  })

  it('replaces +261 phone numbers with <phone>', () => {
    expect(maskPii('Call +261 32 12 345 67')).toBe('Call <phone>')
    expect(maskPii('phone=+261321234567')).toContain('<phone>')
  })

  it('replaces 12-digit CIN with <cin>', () => {
    expect(maskPii('CIN 101234567890 invalid')).toBe('CIN <cin> invalid')
  })

  it('leaves text without PII untouched', () => {
    expect(maskPii('Database connection lost')).toBe('Database connection lost')
  })
})

describe('scrubPii', () => {
  it('strips Authorization and Cookie headers', () => {
    const event: Event = {
      request: {
        headers: {
          authorization: 'Bearer secret-token',
          Cookie: 'sid=abc',
          'user-agent': 'Mozilla/5.0',
        } as Record<string, string>,
      },
    }
    const out = scrubPii(event)
    const headers = out.request!.headers as Record<string, string>
    expect(headers.authorization).toBeUndefined()
    expect(headers.Cookie).toBeUndefined()
    expect(headers['user-agent']).toBe('Mozilla/5.0')
  })

  it('drops the request body', () => {
    const event: Event = {
      request: {
        data: { password: 'hunter2', email: 'a@b.mg' },
      },
    }
    const out = scrubPii(event)
    expect(out.request?.data).toBeUndefined()
  })

  it('removes user.email and user.ip_address but keeps user.id', () => {
    const event: Event = {
      user: {
        id: 'user_123',
        email: 'a@b.mg',
        ip_address: '1.2.3.4',
        username: 'andry',
      },
    }
    const out = scrubPii(event)
    expect(out.user!.id).toBe('user_123')
    expect(out.user!.email).toBeUndefined()
    expect(out.user!.ip_address).toBeUndefined()
    expect(out.user!.username).toBeUndefined()
  })

  it('masks PII in exception messages', () => {
    const event: Event = {
      exception: {
        values: [
          {
            value: 'Owner a@b.mg with phone +261 33 11 22 33 not found',
            type: 'Error',
          },
        ],
      },
    }
    const out = scrubPii(event)
    expect(out.exception!.values![0]!.value).toBe(
      'Owner <email> with phone <phone> not found',
    )
  })

  it('masks PII in breadcrumb messages', () => {
    const event: Event = {
      breadcrumbs: [
        {
          message: 'POST /api/contact with email a@b.mg',
          data: { email: 'a@b.mg', userId: 'safe' },
        },
      ],
    }
    const out = scrubPii(event)
    expect(out.breadcrumbs![0]!.message).toBe(
      'POST /api/contact with email <email>',
    )
    expect(
      (out.breadcrumbs![0]!.data as Record<string, string>)!.email,
    ).toBe('<email>')
    expect(
      (out.breadcrumbs![0]!.data as Record<string, string>)!.userId,
    ).toBe('safe')
  })

  it('returns the event (never drops it entirely)', () => {
    const event: Event = { message: 'something went wrong' }
    const out = scrubPii(event)
    expect(out).toBe(event)
  })
})
