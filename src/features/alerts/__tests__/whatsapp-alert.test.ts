import { describe, it, expect } from 'vitest'
import { normalizeMgPhone, whatsappAlertSchema } from '../schemas/whatsapp-alert'

describe('normalizeMgPhone', () => {
  it.each([
    ['+261321234567', '+261321234567'],
    ['+261 32 12 345 67', '+261321234567'],
    ['261321234567', '+261321234567'],
    ['0321234567', '+261321234567'],
    ['0 32 12 345 67', '+261321234567'],
    ['321234567', '+261321234567'],
    ['+261 33 11 222 33', '+261331122233'],
    ['034.12.345.67', '+261341234567'],
    ['(032) 12 345 67', '+261321234567'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeMgPhone(input)).toBe(expected)
  })

  it.each([
    ['', 'empty string'],
    ['abc', 'non-digit'],
    ['12345', 'too short'],
    ['0421234567', 'wrong operator (42)'],
    ['0311234567', 'wrong operator (31)'],
    ['0301234567', 'wrong operator (30)'],
    ['+2613212345', 'too short national'],
    ['+261321234567890', 'too long'],
  ])('rejects %s (%s)', (input) => {
    expect(normalizeMgPhone(input)).toBeNull()
  })

  it('accepts all valid operator prefixes (32/33/34/37/38/39)', () => {
    for (const op of ['32', '33', '34', '37', '38', '39']) {
      expect(normalizeMgPhone(`0${op}12345 67`)).toBe(`+261${op}1234567`)
    }
  })
})

describe('whatsappAlertSchema', () => {
  it('parses a valid phone + no quartier', () => {
    const result = whatsappAlertSchema.safeParse({ phone: '0321234567' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('+261321234567')
      expect(result.data.quartierSlug).toBeUndefined()
    }
  })

  it('parses with a quartier slug', () => {
    const result = whatsappAlertSchema.safeParse({
      phone: '0321234567',
      quartierSlug: 'andrainjato',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quartierSlug).toBe('andrainjato')
    }
  })

  it('treats empty quartierSlug as undefined', () => {
    const result = whatsappAlertSchema.safeParse({
      phone: '0321234567',
      quartierSlug: '',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quartierSlug).toBeUndefined()
    }
  })

  it('rejects an invalid phone', () => {
    const result = whatsappAlertSchema.safeParse({ phone: '12345' })
    expect(result.success).toBe(false)
  })

  it('rejects a quartier slug with invalid characters', () => {
    const result = whatsappAlertSchema.safeParse({
      phone: '0321234567',
      quartierSlug: 'Andrainjato Quartier!',
    })
    expect(result.success).toBe(false)
  })
})
