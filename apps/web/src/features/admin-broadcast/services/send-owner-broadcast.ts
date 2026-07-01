import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { withUtm } from '@/lib/marketing/utm'
import { env } from '@/lib/env'

/**
 * ADM-16 — admin sends a one-shot email to every ACTIVE owner. The
 * body is short markdown-ish (paragraphs separated by blank lines).
 * We wrap it in the shared HTML template so branding stays
 * consistent. Fanned out via the existing sendTransactionalEmail
 * limiter — one send per user, never batched (SMTP quotas + bounce
 * attribution).
 */
export type BroadcastResult = {
  scanned: number
  sent: number
  failed: number
  skipped: number
}

export async function sendOwnerBroadcast(input: {
  subject: string
  body: string
}): Promise<BroadcastResult> {
  const subject = input.subject.trim()
  const body = input.body.trim()
  if (subject.length < 4) throw errors.validation('Sujet trop court')
  if (body.length < 20) throw errors.validation('Corps trop court')
  if (body.length > 5000) throw errors.validation('Corps trop long (5000 max)')

  const owners = await prisma.user.findMany({
    where: {
      status: 'ACTIVE',
      role: { in: ['OWNER', 'ADMIN'] },
      emailDisabledAt: null,
    },
    select: { id: true, email: true, name: true },
  })

  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const utm = {
    source: 'email',
    medium: 'broadcast',
    campaign: 'admin',
  } as const

  let sent = 0
  let failed = 0

  for (const owner of owners) {
    try {
      const first = owner.name?.trim().split(/\s+/)[0] ?? ''
      const html = `<!doctype html>
<html lang="fr"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;background:#f8f7f4;padding:24px;">
  <div style="max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #eee;">
    <h1 style="margin:0 0 12px;font-size:18px;">${first ? `Salut ${escape(first)},` : 'Salut,'}</h1>
    <div style="font-size:14.5px;line-height:1.6;color:#333;white-space:pre-wrap;">${escape(body)}</div>
    <div style="margin-top:24px;">
      <a href="${withUtm(`${baseUrl}/dashboard/listings`, utm)}" style="display:inline-block;background:#0b1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Aller sur AryTrano
      </a>
    </div>
    <p style="color:#888;font-size:12px;margin-top:32px;line-height:1.5;">
      Tu reçois cet email officiel d’AryTrano. Ce n’est pas un
      email marketing ; tu ne peux pas te désinscrire.
    </p>
  </div>
</body></html>`
      const text = `${first ? `Salut ${first},\n\n` : 'Salut,\n\n'}${body}\n\nAryTrano : ${baseUrl}`

      await sendTransactionalEmail({
        recipientId: owner.id,
        recipientEmail: owner.email,
        eventType: 'admin-broadcast',
        subject,
        html,
        text,
      })
      sent += 1
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { feature: 'admin-broadcast', step: 'per-owner' },
        extra: { ownerId: owner.id },
      })
    }
  }

  return { scanned: owners.length, sent, failed, skipped: 0 }
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]!)
}
