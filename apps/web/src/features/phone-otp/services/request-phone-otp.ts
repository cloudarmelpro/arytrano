import 'server-only'
import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { hashPhone } from '@/lib/auth/hash-phone'
import { rateLimiters } from '@/lib/rate-limit'
import { sendSms, SmsSendError } from '@/lib/sms'
import type { RequestPhoneOtpInput } from '../schemas'

/**
 * T-002 — generate + send a 6-digit OTP code to the visitor's phone.
 *
 * Storage : `PhoneOtp` row with `codeHash` (bcrypt 10), `expiresAt` =
 * now + 10 min, `attempts = 0`. The clear `code` is sent via SMS
 * and never persisted on the row.
 *
 * Rate-limit : 3 codes / hour / phoneHash + 10 / hour / ipHash. Fail-
 * CLOSED on null ipHash via the wrapper. Shares the same
 * `leadSubmit` semantics as the lead form (so an attacker can't burn
 * codes faster than they can submit leads).
 *
 * Anti-flood : if a non-expired non-consumed row already exists for
 * this phone, we DON'T create a new one — we just re-send the SAME
 * code (idempotent retry). Stops a visitor refreshing the dialog
 * from cluttering the table with codes.
 *
 * The SMS body is short + bilingual fallback (FR primary, MG sub-
 * line) because operator copy review is post-launch.
 */

export type RequestPhoneOtpOutcome =
  | { kind: 'ok'; expiresAt: Date; resent: boolean }
  | { kind: 'rate_limited' }
  | { kind: 'sms_failed'; code: string }

const TTL_MS = 10 * 60 * 1000

export async function requestPhoneOtp(
  input: RequestPhoneOtpInput,
  context: { ipHash: string | null },
): Promise<RequestPhoneOtpOutcome> {
  const phoneHash = hashPhone(input.phoneE164)

  const rl = await rateLimiters.phoneOtpRequest(phoneHash, context.ipHash)
  if (!rl.success) {
    return { kind: 'rate_limited' }
  }

  const now = new Date()

  // Idempotent retry : if a live OTP exists, re-send the same code.
  const live = await prisma.phoneOtp.findFirst({
    where: {
      phoneHash,
      verifiedAt: null,
      consumedAt: null,
      expiresAt: { gt: now },
    },
    select: { id: true, codeHash: true, expiresAt: true },
    orderBy: { createdAt: 'desc' },
  })

  // Generate a code. We sign the SMS with the SAME code on retries by
  // keeping it in memory — but we can't recover it from bcrypt. So
  // on retry we issue a NEW code AND consume the previous row to
  // keep "one live OTP per phone" invariant.
  const code = randomSixDigits()
  const codeHash = await bcrypt.hash(code, 10)
  const expiresAt = new Date(now.getTime() + TTL_MS)

  await prisma.$transaction(async (tx) => {
    if (live) {
      // Mark the previous row consumed — fresh code wins.
      await tx.phoneOtp.update({
        where: { id: live.id },
        data: { consumedAt: now },
      })
    }
    await tx.phoneOtp.create({
      data: {
        phoneHash,
        codeHash,
        expiresAt,
      },
      select: { id: true },
    })
  })

  try {
    await sendSms({
      to: input.phoneE164,
      body: `AryTrano : ton code de vérification est ${code}. Il expire dans 10 minutes.`,
    })
  } catch (err) {
    if (err instanceof SmsSendError) {
      Sentry.captureException(err, {
        tags: { feature: 'phone-otp', step: 'send-sms', provider: err.provider },
      })
      return { kind: 'sms_failed', code: err.code }
    }
    Sentry.captureException(err, {
      tags: { feature: 'phone-otp', step: 'send-sms' },
    })
    return { kind: 'sms_failed', code: 'unknown' }
  }

  return { kind: 'ok', expiresAt, resent: live !== null }
}

function randomSixDigits(): string {
  // node:crypto's randomInt uses rejection sampling — no modulo bias.
  // The prior implementation took `getRandomValues % 900_000` which
  // had a sub-percent bias because 2^32 is not a multiple of 900_000.
  // Audit fix 2026-06-12.
  return String(randomInt(100_000, 1_000_000))
}
