import { describe, it, expect } from 'vitest'
import { signUpSchema } from './sign-up'

describe('signUpSchema', () => {
  it('accepts a minimal valid payload (email + password)', () => {
    const result = signUpSchema.safeParse({
      email: 'alice@example.com',
      password: 'correct horse battery',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.role).toBe('STUDENT') // default
    }
  })

  it('rejects malformed emails', () => {
    const r = signUpSchema.safeParse({ email: 'not-an-email', password: 'longenough' })
    expect(r.success).toBe(false)
  })

  it('rejects passwords shorter than 8 chars', () => {
    const r = signUpSchema.safeParse({ email: 'a@b.co', password: 'short' })
    expect(r.success).toBe(false)
  })

  it('caps password at 128 chars', () => {
    const r = signUpSchema.safeParse({
      email: 'a@b.co',
      password: 'x'.repeat(129),
    })
    expect(r.success).toBe(false)
  })

  it('accepts an optional name with min/max bounds', () => {
    const tooShort = signUpSchema.safeParse({
      email: 'a@b.co',
      password: 'longenough',
      name: 'A',
    })
    expect(tooShort.success).toBe(false)

    const ok = signUpSchema.safeParse({
      email: 'a@b.co',
      password: 'longenough',
      name: 'Alice',
    })
    expect(ok.success).toBe(true)
  })

  it('only accepts STUDENT or OWNER role', () => {
    const r = signUpSchema.safeParse({
      email: 'a@b.co',
      password: 'longenough',
      role: 'ADMIN',
    })
    expect(r.success).toBe(false)
  })
})
