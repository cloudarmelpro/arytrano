'use server'

import { headers } from 'next/headers'
import { z } from 'zod'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { rateLimiters } from '@/lib/rate-limit'
import { sendVerificationEmail } from '../services/send-verification-email'

const emailSchema = z.string().email().toLowerCase()

type ResendResult =
  | { ok: true; sent: true }
  | { ok: false; reason: 'invalid' | 'rate_limit' | 'unavailable' }

/**
 * Resend the verification email. Always returns `{ ok: true }` on
 * success path so the UI can show a consistent message regardless of
 * whether the email actually existed (anti-enumeration — same logic
 * as forgot-password).
 *
 * Rate-limited 3/email/h + 10/IP/h. Fail-CLOSED on null IP (bucket
 * unattributable resends so a missing X-Forwarded-For can't bypass).
 */
export async function resendVerificationEmailAction(
  input: { email: unknown },
): Promise<ResendResult> {
  const parsed = emailSchema.safeParse(input.email)
  if (!parsed.success) return { ok: false, reason: 'invalid' }
  const email = parsed.data

  const h = await headers()
  const { ipHash } = extractRequestInfo(h)
  const rl = await rateLimiters.resendVerification(
    email,
    ipHash ?? 'noip:resend-verification',
  )
  if (!rl.success) return { ok: false, reason: 'rate_limit' }

  try {
    // sendVerificationEmail returns reason='not_found' for unknown
    // emails and reason='already_verified' for verified users. We
    // mask both behind a success response — same anti-enumeration
    // pattern as forgot-password.
    await sendVerificationEmail(email)
    return { ok: true, sent: true }
  } catch {
    return { ok: false, reason: 'unavailable' }
  }
}
