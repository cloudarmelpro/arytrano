import 'server-only'
import { prisma } from '@/lib/db'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { env } from '@/lib/env'
import { recordLoginInputSchema, type RecordLoginPayload } from '../schemas'

export type RecordLoginInput = RecordLoginPayload & {
  /** Request whose headers we'll inspect for IP / UA. Used by REST routes (mobile login/register). */
  request?: Request
  /**
   * Raw headers — used by `events.signIn` (OAuth + magic-link), which doesn't
   * receive a Request object. Caller passes `await headers()` from `next/headers`.
   * If both `request` and `headers` are supplied, `request` wins.
   */
  headers?: Headers
}

export async function recordLoginEvent(input: RecordLoginInput): Promise<void> {
  // Validate the serializable part (everything except `request`/`headers`).
  const { userId, authMethod, isMobileApp } = recordLoginInputSchema.parse({
    userId: input.userId,
    authMethod: input.authMethod,
    isMobileApp: input.isMobileApp,
  })

  const sourceHeaders = input.request?.headers ?? input.headers ?? null
  const info = sourceHeaders
    ? extractRequestInfo(sourceHeaders)
    : { ipHash: null, userAgent: null, browser: null, os: null, deviceType: null }

  // SEC-04 — anomaly detection. Before writing the new row, look up
  // whether we've EVER seen this (ipHash, deviceType) tuple for this
  // user. If not, email the user a security notice. Fire-and-forget
  // so the login flow itself never blocks on this.
  const shouldAlert = await isAnomalousLogin({
    userId,
    ipHash: info.ipHash,
    deviceType: info.deviceType,
  })

  await prisma.loginEvent.create({
    data: {
      userId,
      authMethod,
      ipHash: info.ipHash,
      userAgent: info.userAgent,
      browser: info.browser,
      os: info.os,
      deviceType: info.deviceType,
      isMobileApp: isMobileApp ?? false,
    },
  })

  if (shouldAlert) {
    void sendNewDeviceAlert({ userId, deviceType: info.deviceType, browser: info.browser })
  }
}

async function isAnomalousLogin(input: {
  userId: string
  ipHash: string | null
  deviceType: string | null
}): Promise<boolean> {
  // No ipHash → we can't reason about anomaly. Skip.
  if (!input.ipHash) return false
  const prior = await prisma.loginEvent.findFirst({
    where: {
      userId: input.userId,
      OR: [
        { ipHash: input.ipHash },
        // Same device type is a soft heuristic — a first-time laptop
        // login when the account has only ever seen mobile is worth
        // knowing about too.
        ...(input.deviceType ? [{ deviceType: input.deviceType }] : []),
      ],
    },
    select: { id: true },
  })
  return prior === null
}

async function sendNewDeviceAlert(input: {
  userId: string
  deviceType: string | null
  browser: string | null
}): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, email: true, name: true },
    })
    if (!user) return
    const baseUrl = env.AUTH_URL.replace(/\/$/, '')
    const first = user.name?.trim().split(/\s+/)[0] ?? ''
    const desc = [input.browser, input.deviceType].filter(Boolean).join(' · ') || 'un nouvel appareil'
    await sendTransactionalEmail({
      recipientId: user.id,
      recipientEmail: user.email,
      eventType: 'new-device-login',
      subject: 'Nouvelle connexion à ton compte AryTrano',
      html: `<!doctype html><html lang="fr"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f8f7f4;padding:24px;">
  <div style="max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #eee;">
    <h1 style="margin:0 0 12px;font-size:18px;">Nouvelle connexion détectée</h1>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      ${first ? `Salut ${first}, ` : ''}quelqu'un vient de se connecter à
      ton compte AryTrano depuis ${desc}.
    </p>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      Si c'est toi, tout va bien. Sinon, va sur
      <a href="${baseUrl}/dashboard/settings" style="color:#0b1;">tes paramètres</a>
      changer ton mot de passe immédiatement.
    </p>
  </div>
</body></html>`,
      text: `Nouvelle connexion à ton compte AryTrano depuis ${desc}.\n\nSi ce n'est pas toi : ${baseUrl}/dashboard/settings`,
    })
  } catch {
    /* swallow */
  }
}
