import 'server-only'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { hashPhone } from '@/lib/auth/hash-phone'
import type { VerifyPhoneOtpInput } from '../schemas'

/**
 * T-002 — verify a 6-digit code against the latest live OTP row.
 *
 * State machine :
 *  - Row not found / expired → `kind:'no_pending_code'`
 *  - Attempts already at cap (3) → `kind:'too_many_attempts'`
 *  - Code mismatch → increment attempts, return `kind:'invalid_code'`.
 *    If the increment hits the cap, mark `consumedAt` so the row is
 *    burned and a fresh request is required.
 *  - Code match → set `verifiedAt`, return `kind:'ok'`. Downstream
 *    consumers (createInterestLead) read `verifiedAt` within the
 *    next 15 minutes ; after that the row is "stale verified" and
 *    no longer counts.
 */

const MAX_ATTEMPTS = 3

export type VerifyPhoneOtpOutcome =
  | { kind: 'ok'; verifiedAt: Date }
  | { kind: 'no_pending_code' }
  | { kind: 'too_many_attempts' }
  | { kind: 'invalid_code'; attemptsLeft: number }

export async function verifyPhoneOtp(
  input: VerifyPhoneOtpInput,
): Promise<VerifyPhoneOtpOutcome> {
  const phoneHash = hashPhone(input.phoneE164)
  const now = new Date()

  const row = await prisma.phoneOtp.findFirst({
    where: {
      phoneHash,
      verifiedAt: null,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true, codeHash: true, attempts: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!row) return { kind: 'no_pending_code' }
  if (row.attempts >= MAX_ATTEMPTS) {
    // Defensive — a row at the cap should already have consumedAt set
    // by the prior bad-attempt write. Clamp here so a buggy concurrent
    // path doesn't leak.
    await prisma.phoneOtp.update({
      where: { id: row.id },
      data: { consumedAt: now },
    })
    return { kind: 'too_many_attempts' }
  }

  const match = await bcrypt.compare(input.code, row.codeHash)

  if (!match) {
    const nextAttempts = row.attempts + 1
    await prisma.phoneOtp.update({
      where: { id: row.id },
      data: {
        attempts: nextAttempts,
        // Burn the row when the cap is reached so the visitor MUST
        // request a fresh code.
        ...(nextAttempts >= MAX_ATTEMPTS && { consumedAt: now }),
      },
    })
    return {
      kind: 'invalid_code',
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - nextAttempts),
    }
  }

  await prisma.phoneOtp.update({
    where: { id: row.id },
    data: { verifiedAt: now },
  })

  // TRU-01 — when the verified phone matches a signed-in User.phone,
  // stamp User.phoneVerifiedAt. The publishListing gate reads this.
  // No-op for anonymous tenants (the lead flow's normal path).
  await prisma.user.updateMany({
    where: { phone: input.phoneE164 },
    data: { phoneVerifiedAt: now },
  })

  return { kind: 'ok', verifiedAt: now }
}

/**
 * Helper consumed by `createInterestLead` (T-002.6) to gate writes
 * on a recent successful verification.
 */
export async function hasRecentlyVerifiedPhone(
  phoneE164: string,
  withinMs = 15 * 60 * 1000,
): Promise<boolean> {
  const phoneHash = hashPhone(phoneE164)
  const floor = new Date(Date.now() - withinMs)
  const row = await prisma.phoneOtp.findFirst({
    where: {
      phoneHash,
      verifiedAt: { not: null, gte: floor },
    },
    select: { id: true },
    orderBy: { verifiedAt: 'desc' },
  })
  return row !== null
}
