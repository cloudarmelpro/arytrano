import 'server-only'
import crypto from 'node:crypto'
import { hash as bcryptHash, compare as bcryptCompare } from 'bcryptjs'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import {
  encryptTotpSecret,
  generateTotpSecret,
  verifyTotpCode,
} from '@/lib/auth/totp'

const RECOVERY_CODE_COUNT = 10
const RECOVERY_CODE_BCRYPT_ROUNDS = 10

/**
 * Generate a one-time human-readable recovery code: 10 chars, base32-like
 * (no ambiguous 0/O/1/I). Format: `XXXX-XXXX`. ~50 bits entropy per code.
 */
function generateRecoveryCode(): string {
  const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length]
    if (i === 3) out += '-'
  }
  return out
}

/**
 * Step 1 of setup: generate a fresh TOTP secret (NOT persisted yet) and
 * return the base32 string the user will scan via QR. Persistence happens
 * in `enableTotp` after the user verifies a code from their authenticator
 * app — proves they actually scanned it.
 */
export function startTotpSetup(): { secret: string } {
  return { secret: generateTotpSecret() }
}

/**
 * Step 2 of setup: verify the user's first 6-digit code against the secret
 * they just scanned, then persist the encrypted secret + activation
 * timestamp + 10 freshly-generated recovery codes (returned plaintext ONCE).
 *
 * Returns the recovery codes — the caller MUST show them to the user and
 * make them confirm storage (clipboard / download / re-type). We never
 * re-show them; only their bcrypt hash is in DB.
 */
export async function enableTotp(input: {
  userId: string
  secret: string
  firstCode: string
}): Promise<{ recoveryCodes: string[] }> {
  const tempEncrypted = encryptTotpSecret(input.secret)
  if (!verifyTotpCode({ storedSecret: tempEncrypted, code: input.firstCode })) {
    throw errors.validation('Code invalide. Vérifie ton application d\'authentification.')
  }

  // Prevent enabling twice for the same user (e.g. concurrent setup tabs).
  const existing = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { totpEnabledAt: true },
  })
  if (existing?.totpEnabledAt) {
    throw errors.conflict('Le 2FA est déjà activé sur ce compte')
  }

  const plaintextCodes = Array.from({ length: RECOVERY_CODE_COUNT }, generateRecoveryCode)
  const hashedCodes = await Promise.all(
    plaintextCodes.map((c) => bcryptHash(c, RECOVERY_CODE_BCRYPT_ROUNDS)),
  )

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: {
        totpSecret: tempEncrypted,
        totpEnabledAt: new Date(),
        tokenVersion: { increment: 1 }, // invalidate outstanding tokens
      },
    })
    // Clear any leftover recovery codes from a previous activation cycle.
    await tx.recoveryCode.deleteMany({ where: { userId: input.userId } })
    await tx.recoveryCode.createMany({
      data: hashedCodes.map((codeHash) => ({ userId: input.userId, codeHash })),
    })
  })

  return { recoveryCodes: plaintextCodes }
}

/**
 * Disable 2FA. Requires the current TOTP code (or a recovery code) for
 * proof of possession — password alone isn't sufficient.
 */
export async function disableTotp(input: {
  userId: string
  code: string
}): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { totpSecret: true, totpEnabledAt: true },
  })
  if (!user || !user.totpEnabledAt || !user.totpSecret) {
    throw errors.validation('Le 2FA n\'est pas activé sur ce compte')
  }

  const totpOk = verifyTotpCode({ storedSecret: user.totpSecret, code: input.code })
  const recoveryOk = totpOk
    ? false
    : await consumeRecoveryCode({ userId: input.userId, code: input.code })

  if (!totpOk && !recoveryOk) {
    throw errors.unauthorized('Code 2FA invalide')
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: {
        totpSecret: null,
        totpEnabledAt: null,
        tokenVersion: { increment: 1 },
      },
    })
    await tx.recoveryCode.deleteMany({ where: { userId: input.userId } })
  })
}

/**
 * Step-2 sign-in verification: accept either a 6-digit TOTP code OR a
 * recovery code. Recovery codes are single-use (`usedAt` stamped).
 *
 * Returns `true` on success. Never throws on bad code — caller decides
 * whether to retry or fail-final.
 */
export async function verifyTotpForSignIn(input: {
  userId: string
  code: string
}): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { totpSecret: true, totpEnabledAt: true, status: true },
  })
  if (!user || user.status !== 'ACTIVE' || !user.totpEnabledAt || !user.totpSecret) {
    return false
  }

  const isTotpFormat = /^\d{6}$/.test(input.code)
  if (isTotpFormat) {
    return verifyTotpCode({ storedSecret: user.totpSecret, code: input.code })
  }
  // Otherwise try as a recovery code (formatted XXXX-XXXX).
  return consumeRecoveryCode({ userId: input.userId, code: input.code })
}

/**
 * Consume a recovery code: scan unused codes for this user, bcrypt-compare,
 * stamp `usedAt` atomically on first match. Returns true on success.
 *
 * Cost: O(k) bcrypt compares where k = remaining unused codes. Per-user cap
 * of 10 codes keeps this bounded.
 */
async function consumeRecoveryCode(input: {
  userId: string
  code: string
}): Promise<boolean> {
  // Normalize: uppercase, strip non-allowed chars except dash.
  const normalized = input.code.toUpperCase().replace(/[^A-Z0-9-]/g, '')
  if (normalized.length === 0) return false

  const candidates = await prisma.recoveryCode.findMany({
    where: { userId: input.userId, usedAt: null },
    select: { id: true, codeHash: true },
  })
  for (const c of candidates) {
    if (await bcryptCompare(normalized, c.codeHash)) {
      // Atomically mark used; if another concurrent attempt won the race,
      // updateMany returns 0 and we fall through.
      const claimed = await prisma.recoveryCode.updateMany({
        where: { id: c.id, usedAt: null },
        data: { usedAt: new Date() },
      })
      return claimed.count === 1
    }
  }
  return false
}

/** Count of unused recovery codes — surfaced on the settings page. */
export async function countActiveRecoveryCodes(userId: string): Promise<number> {
  return prisma.recoveryCode.count({ where: { userId, usedAt: null } })
}
