import 'server-only'
import crypto from 'node:crypto'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { escapeHtml } from '@/lib/format/escape-html'

const TOKEN_BYTES = 32
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour
const IDENTIFIER_PREFIX = 'password-reset:'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Always returns success (don't leak whether an email is registered).
 * Generates a token, stores its hash in VerificationToken, and emails the
 * plaintext token as a reset link. Token TTL = 1h.
 */
export async function requestPasswordReset(email: string): Promise<{ sent: boolean }> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, status: true },
  })

  if (!user || user.status !== 'ACTIVE') {
    // Pretend success — anti-enumeration. Tiny delay to mask timing.
    await new Promise((r) => setTimeout(r, 50 + Math.random() * 100))
    return { sent: true }
  }

  const token = crypto.randomBytes(TOKEN_BYTES).toString('base64url')
  const expires = new Date(Date.now() + TOKEN_TTL_MS)

  // Clean up any older reset tokens for this email, then create the fresh one.
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

  const resetUrl = `${env.AUTH_URL}/reset-password?token=${encodeURIComponent(token)}`
  const displayName = escapeHtml(user.name?.trim() || user.email)
  const safeResetUrl = escapeHtml(resetUrl)

  await sendEmail({
    to: user.email,
    subject: 'Réinitialise ton mot de passe AryTrano',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;padding:24px;color:#111">
        <h1 style="color:#191970;font-size:20px;margin:0 0 16px">Réinitialise ton mot de passe</h1>
        <p>Bonjour ${displayName},</p>
        <p>Tu as demandé à réinitialiser ton mot de passe AryTrano. Clique sur le lien ci-dessous (valide pendant 1 heure) :</p>
        <p style="margin:24px 0">
          <a href="${safeResetUrl}" style="background:#191970;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">Choisir un nouveau mot de passe</a>
        </p>
        <p style="color:#555;font-size:14px">Ou copie-colle ce lien dans ton navigateur :<br><span style="word-break:break-all">${safeResetUrl}</span></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
        <p style="color:#888;font-size:12px">Tu n'as pas demandé cette réinitialisation ? Ignore cet email — ton mot de passe ne sera pas changé.</p>
      </div>
    `,
  })

  return { sent: true }
}

/**
 * Internal use only — validates the token and returns the user record if valid.
 * Used by `resetPassword` service. Caller should call this inside a transaction.
 */
export async function consumeResetToken(token: string) {
  const hash = hashToken(token)
  const record = await prisma.verificationToken.findUnique({
    where: { token: hash },
  })
  if (!record) return null
  if (!record.identifier.startsWith(IDENTIFIER_PREFIX)) return null
  if (record.expires.getTime() < Date.now()) {
    await prisma.verificationToken.delete({ where: { token: hash } }).catch(() => {})
    return null
  }
  const email = record.identifier.slice(IDENTIFIER_PREFIX.length)
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  })
  if (!user || user.status !== 'ACTIVE') return null
  // Delete the token — single-use.
  await prisma.verificationToken.delete({ where: { token: hash } }).catch(() => {})
  return { userId: user.id, email }
}
