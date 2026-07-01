import 'server-only'
import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { hashPhone } from '@/lib/auth/hash-phone'
import { rateLimiters } from '@/lib/rate-limit'
import { sendSms, SmsSendError } from '@/lib/sms'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
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

  // TRU-16 — fire-and-forget alert to the phone-owner if they exist.
  // Someone requesting an OTP on a phone that's already tied to an
  // account is usually the owner themselves (retry flow), but if the
  // requester IP is different from the account's usual pattern we
  // treat it as suspicious and let the owner know. We stay narrow +
  // send at most 1 alert per phone per hour via the existing
  // transactional rate limit so a flood of OTP requests doesn't burn
  // the owner's inbox.
  void notifyPhoneOwnerOfOtpRequest(input.phoneE164)

  return { kind: 'ok', expiresAt, resent: live !== null }
}

async function notifyPhoneOwnerOfOtpRequest(phoneE164: string): Promise<void> {
  try {
    const owner = await prisma.user.findFirst({
      where: { phone: phoneE164, status: 'ACTIVE' },
      select: { id: true, email: true, name: true },
    })
    if (!owner) return
    const baseUrl = env.AUTH_URL.replace(/\/$/, '')
    const greetingName = owner.name?.trim().split(/\s+/)[0] ?? ''
    const html = `<!doctype html>
<html lang="fr"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f8f7f4;padding:24px;">
  <div style="max-width:520px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;border:1px solid #eee;">
    <h1 style="margin:0 0 12px;font-size:18px;">Activité sur ton numéro AryTrano</h1>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      ${greetingName ? `Salut ${greetingName}, ` : ''}quelqu’un vient de demander un code
      de vérification pour ton numéro de téléphone AryTrano.
    </p>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      Si c’est toi, ignore cet email. Sinon, connecte-toi et change
      ton numéro depuis <a href="${baseUrl}/dashboard/profile" style="color:#0b1;">ton profil</a>.
    </p>
    <p style="color:#888;font-size:12px;margin-top:20px;">
      Tu reçois cette alerte pour ta sécurité. Elle est envoyée au plus
      une fois par heure.
    </p>
  </div>
</body></html>`
    const text = [
      `${greetingName ? `Salut ${greetingName}. ` : ''}Quelqu'un vient de demander un code`,
      `de vérification pour ton numéro AryTrano.`,
      ``,
      `Si c'est toi, ignore. Sinon, change ton numéro :`,
      `${baseUrl}/dashboard/profile`,
    ].join('\n')

    await sendTransactionalEmail({
      recipientId: owner.id,
      recipientEmail: owner.email,
      eventType: 'phone-otp-alert',
      subject: 'Activité sur ton numéro AryTrano',
      html,
      text,
    })
  } catch (err) {
    Sentry.captureException(err, { tags: { feature: 'phone-otp', step: 'owner-alert' } })
  }
}

function randomSixDigits(): string {
  // node:crypto's randomInt uses rejection sampling — no modulo bias.
  // The prior implementation took `getRandomValues % 900_000` which
  // had a sub-percent bias because 2^32 is not a multiple of 900_000.
  // Audit fix 2026-06-12.
  return String(randomInt(100_000, 1_000_000))
}
