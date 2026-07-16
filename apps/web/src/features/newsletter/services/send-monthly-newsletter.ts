import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { prisma } from '@/lib/db'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { withUtm } from '@/lib/marketing/utm'

/**
 * MKT-08 — monthly newsletter fan-out. Ships the first working day
 * of each month at 09:00 UTC. Content = top 3 quartiers by new
 * listings in the previous 30 days + call-to-action.
 *
 * Skipped when the subscriber has an unsubscribedAt timestamp; the
 * body carries a one-click unsubscribe link with a signed token.
 */
export async function sendMonthlyNewsletter(): Promise<{
  scanned: number
  sent: number
  failed: number
}> {
  const subs = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    select: { id: true, email: true, unsubscribeToken: true },
  })
  if (subs.length === 0) return { scanned: 0, sent: 0, failed: 0 }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const topQuartiers = await prisma.listing.groupBy({
    by: ['neighborhoodId'],
    where: { status: 'PUBLISHED', publishedAt: { gte: since } },
    _count: true,
    orderBy: { _count: { neighborhoodId: 'desc' } },
    take: 3,
  })
  const neighborhoods = await prisma.neighborhood.findMany({
    where: { id: { in: topQuartiers.map((r) => r.neighborhoodId) } },
    select: {
      id: true,
      slug: true,
      nameFr: true,
      city: { select: { slug: true, nameFr: true } },
    },
  })
  const nById = new Map(neighborhoods.map((n) => [n.id, n]))
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const utm = {
    source: 'newsletter',
    medium: 'email',
    campaign: 'monthly',
  } as const
  const rows = topQuartiers.map((t) => {
    const n = nById.get(t.neighborhoodId)
    if (!n) return null
    return `<li style="margin:8px 0;">
      <a href="${withUtm(`${baseUrl}/villes/${n.city.slug}/quartiers/${n.slug}`, utm)}" style="color:#0b1;font-weight:600;">
        ${escape(n.nameFr)}, ${escape(n.city.nameFr)}
      </a>
      <span style="color:#666;font-size:13px;"> — ${t._count} nouvelles annonces</span>
    </li>`
  }).filter(Boolean).join('')

  const html = `<!doctype html>
<html lang="fr"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f7f4;padding:24px;color:#111;">
  <div style="max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #eee;">
    <h1 style="margin:0 0 12px;font-size:20px;">Top quartiers du mois</h1>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      Les 3 quartiers de Madagascar où les propriétaires ont le plus
      publié ce mois-ci sur AryTrano.
    </p>
    <ul style="padding-left:20px;margin:16px 0;">${rows}</ul>
    <a href="${withUtm(`${baseUrl}/annonces`, utm)}" style="display:inline-block;background:#0b1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Voir toutes les annonces
    </a>
  </div>
</body></html>`

  let sent = 0
  let failed = 0
  for (const s of subs) {
    try {
      // Fable-audit L1 — one-click unsubscribe link + RFC 8058 headers.
      // Skip the send when a legacy subscriber has no token yet — the
      // next subscribe cycle will lazily stamp one.
      if (!s.unsubscribeToken) {
        continue
      }
      const unsubUrl = `${baseUrl}/newsletter/unsubscribe/${encodeURIComponent(s.unsubscribeToken)}`
      const htmlWithUnsub = html.replace(
        '</div>\n</body></html>',
        `<p style="color:#999;font-size:11px;line-height:1.5;margin-top:24px;">
  Tu ne veux plus recevoir la newsletter mensuelle ?
  <a href="${unsubUrl}" style="color:#666;">Désabonnement en un clic</a>.
</p>
</div>
</body></html>`,
      )
      const textWithUnsub = `Top quartiers du mois : ${neighborhoods
        .map((n) => n.nameFr)
        .join(', ')}\n\n${baseUrl}/annonces\n\nDésabonnement : ${unsubUrl}`
      await sendEmail({
        to: s.email,
        subject: 'Top quartiers Madagascar — AryTrano',
        html: htmlWithUnsub,
        text: textWithUnsub,
        headers: {
          'List-Unsubscribe': `<${unsubUrl}>, <mailto:unsubscribe@arytrano.com>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      sent += 1
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { feature: 'newsletter', step: 'send' },
        extra: { subscriberId: s.id },
      })
    }
  }
  return { scanned: subs.length, sent, failed }
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
