import 'server-only'
import crypto from 'node:crypto'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { fromPrismaLocale } from '@/lib/i18n/config'
import { buildVerifyEmail } from '@/lib/email/templates/verify-email'

const TOKEN_BYTES = 32
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const IDENTIFIER_PREFIX = 'email-verify:'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export type SendVerificationEmailResult =
  | { ok: true; sent: boolean }
  | { ok: false; reason: 'not_found' | 'already_verified' }

/**
 * Send (or re-send) the email-verification link to a user. Idempotent:
 * calling twice within the TTL replaces the older token. Locale is read
 * from the User row so the link copy matches the user's account
 * language, not the request locale (an admin running this from
 * another locale shouldn't switch the user's email language).
 *
 * Returns `not_found` when no User with this email exists (caller
 * decides whether to leak this — for sign-up we never get here, for
 * resend we mask it).
 */
export async function sendVerificationEmail(
  email: string,
): Promise<SendVerificationEmailResult> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, locale: true, emailVerified: true },
  })
  if (!user) return { ok: false, reason: 'not_found' }
  if (user.emailVerified) return { ok: false, reason: 'already_verified' }

  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url')
  const expires = new Date(Date.now() + TOKEN_TTL_MS)

  // Single active token per email — drop any stale one before insert.
  await prisma.verificationToken.deleteMany({
    where: { identifier: `${IDENTIFIER_PREFIX}${user.email}` },
  })
  await prisma.verificationToken.create({
    data: {
      identifier: `${IDENTIFIER_PREFIX}${user.email}`,
      token: hashToken(token),
      expires,
    },
  })

  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`

  const message = buildVerifyEmail(fromPrismaLocale(user.locale), {
    recipientName: user.name ?? 'AryTrano',
    verifyUrl,
  })

  // Direct sendEmail (not sendTransactionalEmail) because the per-user
  // rate-limit table keys on userId, but for sign-up the user might
  // re-trigger from the /verify-email page before their session
  // exists. Resend itself is rate-limited at the action edge.
  await sendEmail({
    to: user.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
  })

  return { ok: true, sent: true }
}

/**
 * Consume a verification token: validate it, flip the user's
 * `emailVerified`, and delete the token. Returns the userId on success
 * so the caller can revalidate session caches.
 *
 * Errors :
 *   - `invalid` — token not found, malformed, or wrong identifier prefix
 *   - `expired` — token found but past TTL
 *   - `user_missing` — race with account deletion between sign-up and
 *     verification click
 */
export type ConsumeVerificationResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'user_missing' }

export async function consumeVerificationToken(
  token: string,
): Promise<ConsumeVerificationResult> {
  if (!token) return { ok: false, reason: 'invalid' }

  const hash = hashToken(token)
  const record = await prisma.verificationToken.findUnique({
    where: { token: hash },
  })
  if (!record) return { ok: false, reason: 'invalid' }
  if (!record.identifier.startsWith(IDENTIFIER_PREFIX)) {
    return { ok: false, reason: 'invalid' }
  }
  if (record.expires.getTime() < Date.now()) {
    await prisma.verificationToken
      .delete({ where: { token: hash } })
      .catch(() => {})
    return { ok: false, reason: 'expired' }
  }

  const email = record.identifier.slice(IDENTIFIER_PREFIX.length)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true, emailVerified: true },
  })
  if (!user || user.status !== 'ACTIVE') {
    return { ok: false, reason: 'user_missing' }
  }

  // Use transaction so the token consumption + emailVerified flip
  // commit atomically. Prevents a half-state where the token is
  // gone but the user is still unverified.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token: hash } }),
  ])

  return { ok: true, userId: user.id, email }
}
