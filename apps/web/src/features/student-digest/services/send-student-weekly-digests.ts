import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { sendTransactionalEmail } from '@/lib/email/send-transactional'
import { withUtm } from '@/lib/marketing/utm'
import { formatAriary } from '@/lib/format/currency'
import {
  computeStudentWeeklyDigest,
  listStudentsDueDigest,
} from '../queries/compute-student-weekly-digest'

/**
 * MKT-07 — Wednesday 05:00 UTC student recap. Skip students with
 * zero new listings this week; when there IS something to show,
 * fan out via the existing transactional pipeline.
 */
export async function sendStudentWeeklyDigests(): Promise<{
  scanned: number
  sent: number
  skipped: number
  failed: number
}> {
  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const students = await listStudentsDueDigest()
  let sent = 0
  let skipped = 0
  let failed = 0

  for (const id of students) {
    try {
      const payload = await computeStudentWeeklyDigest(id)
      if (!payload || payload.totals.newListings7d === 0) {
        skipped += 1
        continue
      }
      const utm = {
        source: 'email',
        medium: 'digest',
        campaign: 'student-weekly',
      } as const
      const linkAnnonces = withUtm(`${baseUrl}/annonces`, utm)
      const first = payload.name?.trim().split(/\s+/)[0] ?? ''
      const greeting = first ? `Salut ${first},` : 'Salut,'
      const rows = payload.topListings
        .map(
          (l) => `<li style="margin:8px 0;font-size:14px;">
              <a href="${withUtm(`${baseUrl}/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`, utm)}" style="color:#0b1;font-weight:600;">${escape(l.title)}</a>
              <span style="color:#666;font-family:monospace;font-size:12.5px;"> — ${formatAriary(l.priceMonthlyMGA)}/mois</span>
            </li>`,
        )
        .join('')

      const html = `<!doctype html>
<html lang="fr"><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f7f4;padding:24px;color:#111;">
  <div style="max-width:520px;margin:0 auto;padding:24px;background:#fff;border-radius:8px;border:1px solid #eee;">
    <h1 style="margin:0 0 12px;font-size:20px;">${greeting}</h1>
    <p style="color:#333;font-size:14.5px;line-height:1.55;">
      <strong>${payload.totals.newListings7d}</strong> nouvelle${payload.totals.newListings7d > 1 ? 's' : ''} annonce${payload.totals.newListings7d > 1 ? 's' : ''} cette semaine dans les zones de tes recherches sauvegardées.
    </p>
    <ul style="padding-left:20px;margin:16px 0;">${rows}</ul>
    <a href="${linkAnnonces}" style="display:inline-block;background:#0b1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      Voir toutes les annonces
    </a>
    <p style="color:#888;font-size:12px;margin-top:24px;line-height:1.5;">
      Tu reçois ce récap car tu as ${payload.totals.savedSearches} recherche${payload.totals.savedSearches > 1 ? 's' : ''} sauvegardée${payload.totals.savedSearches > 1 ? 's' : ''}. Désabonnement via <a href="${withUtm(`${baseUrl}/dashboard/notifications`, utm)}" style="color:#666;">tes préférences</a>.
    </p>
  </div>
</body></html>`
      const text = [
        greeting,
        '',
        `${payload.totals.newListings7d} nouvelle(s) annonce(s) cette semaine :`,
        ...payload.topListings.map((l) => `- ${l.title} (${formatAriary(l.priceMonthlyMGA)}/mois)`),
        '',
        `Voir /annonces : ${linkAnnonces}`,
      ].join('\n')

      await sendTransactionalEmail({
        recipientId: payload.studentId,
        recipientEmail: payload.email,
        eventType: 'student-weekly-digest',
        subject: `${payload.totals.newListings7d} nouvelle${payload.totals.newListings7d > 1 ? 's' : ''} annonce${payload.totals.newListings7d > 1 ? 's' : ''} cette semaine`,
        html,
        text,
      })
      sent += 1
    } catch (err) {
      failed += 1
      Sentry.captureException(err, {
        tags: { cron: 'student-weekly-digest' },
        extra: { studentId: id },
      })
    }
  }
  return { scanned: students.length, sent, skipped, failed }
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
