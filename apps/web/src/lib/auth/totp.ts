import 'server-only'
import crypto from 'node:crypto'
import { generateSecret, generateURI, verifySync } from 'otplib'
import { env } from '@/lib/env'

/**
 * TOTP (RFC 6238) helpers for admin 2FA. Built on `otplib` v13 functional API.
 *
 * Configuration:
 *   - 6-digit codes, 30s step (Google Authenticator default).
 *   - ±30s clock-skew tolerance (`epochTolerance: 30` seconds, symmetric)
 *     — strict enough to block replay attacks beyond a minute.
 *
 * Secret storage:
 *   - The TOTP shared secret is AES-256-GCM encrypted at rest. Key is
 *     derived from `AUTH_SECRET` via SHA-256 so we don't add a new env var.
 *   - DB compromise alone (without the app's AUTH_SECRET) doesn't yield
 *     usable TOTP secrets.
 */

const ALGORITHM = 'aes-256-gcm'
const TOTP_PERIOD_SECONDS = 30
const TOTP_TOLERANCE_SECONDS = 30 // accept previous and next 30-second window

function getKey(): Buffer {
  return crypto.createHash('sha256').update(env.AUTH_SECRET).digest()
}

/** Format: `<iv-hex>:<ciphertext-hex>:<auth-tag-hex>` */
export function encryptTotpSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`
}

export function decryptTotpSecret(stored: string): string {
  const [ivHex, ctHex, tagHex] = stored.split(':')
  if (!ivHex || !ctHex || !tagHex) {
    throw new Error('Invalid TOTP secret format')
  }
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ctHex, 'hex')),
    decipher.final(),
  ])
  return decrypted.toString('utf8')
}

/** Generate a fresh base32 TOTP secret. ~160 bits of entropy by default. */
export function generateTotpSecret(): string {
  return generateSecret()
}

/** Build the otpauth:// URI consumed by Google Authenticator / Authy / 1Password. */
export function buildOtpAuthUrl(input: {
  secret: string
  accountLabel: string
  issuer?: string
}): string {
  return generateURI({
    strategy: 'totp',
    issuer: input.issuer ?? 'AryTrano',
    label: input.accountLabel,
    secret: input.secret,
    digits: 6,
    period: TOTP_PERIOD_SECONDS,
  })
}

/** Verify a 6-digit code against an encrypted-stored secret. */
export function verifyTotpCode(input: {
  storedSecret: string
  code: string
}): boolean {
  // Reject non-digit / wrong length BEFORE crypto work — limits timing oracle
  // and saves a decrypt on obvious garbage input.
  if (!/^\d{6}$/.test(input.code)) return false

  let plaintext: string
  try {
    plaintext = decryptTotpSecret(input.storedSecret)
  } catch {
    return false
  }

  const result = verifySync({
    token: input.code,
    secret: plaintext,
    strategy: 'totp',
    digits: 6,
    period: TOTP_PERIOD_SECONDS,
    epochTolerance: TOTP_TOLERANCE_SECONDS,
  })
  return result.valid === true
}
