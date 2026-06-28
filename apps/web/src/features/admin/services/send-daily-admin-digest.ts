import 'server-only'
import { env } from '@/lib/env'
import { sendEmail } from '@/lib/email'
import { computeDailyAdminStats, type DailyAdminStats } from '../queries/compute-daily-admin-stats'

/**
 * ANA-15 — compute platform metrics + send digest email to ops.
 *
 * Recipients live in `ADMIN_NOTIFICATIONS_EMAIL` env (comma-separated).
 * If unset, the cron is a no-op and returns `{ recipients: 0 }` —
 * useful in dev so the cron route returns 200 without spamming.
 */

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export async function sendDailyAdminDigest(): Promise<{
  recipients: number
  sent: boolean
}> {
  const recipients = parseRecipients(env.ADMIN_NOTIFICATIONS_EMAIL)
  if (recipients.length === 0) {
    return { recipients: 0, sent: false }
  }

  const stats = await computeDailyAdminStats()
  const subject = `[AryTrano] Digest ${dateFmt.format(stats.windowStart)} — ${stats.signups.today} signups · ${stats.activity.dau} DAU`
  const html = renderHtml(stats)
  const text = renderText(stats)

  // `sendEmail` accepts a single recipient ; fan out so each ops
  // contact gets their own message (separate inbox, no shared BCC).
  await Promise.all(
    recipients.map((to) => sendEmail({ to, subject, html, text })),
  )

  return { recipients: recipients.length, sent: true }
}

function parseRecipients(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function pct(num: number, denom: number): string {
  if (denom === 0) return '—'
  return `${((num / denom) * 100).toFixed(1)}%`
}

function renderHtml(s: DailyAdminStats): string {
  const day = dateFmt.format(s.windowStart)
  return `<!doctype html>
<html lang="fr">
<body style="font-family:system-ui,-apple-system,sans-serif;background:#f7f7f9;margin:0;padding:24px;color:#111">
  <div style="max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #eee">
    <h1 style="margin:0 0 4px;color:#191970;font-size:22px;font-weight:700">AryTrano — digest journalier</h1>
    <p style="margin:0 0 24px;color:#666;font-size:13px">${day}</p>

    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px">Acquisition</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#444">Nouveaux signups (hier)</td><td style="text-align:right;font-family:monospace;font-weight:700">${s.signups.today}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Signups 7 derniers jours</td><td style="text-align:right;font-family:monospace">${s.signups.last7d}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Signups 30 derniers jours</td><td style="text-align:right;font-family:monospace">${s.signups.last30d}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Total users</td><td style="text-align:right;font-family:monospace">${s.signups.total}</td></tr>
    </table>

    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px">Activité</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#444">DAU (utilisateurs actifs hier)</td><td style="text-align:right;font-family:monospace;font-weight:700">${s.activity.dau}</td></tr>
      <tr><td style="padding:6px 0;color:#444">WAU (7 derniers jours)</td><td style="text-align:right;font-family:monospace">${s.activity.wau}</td></tr>
      <tr><td style="padding:6px 0;color:#444">MAU (30 derniers jours)</td><td style="text-align:right;font-family:monospace">${s.activity.mau}</td></tr>
      <tr><td style="padding:6px 0;color:#444">DAU/MAU</td><td style="text-align:right;font-family:monospace">${pct(s.activity.dau, s.activity.mau)}</td></tr>
    </table>

    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px">Annonces & engagement</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#444">Total publiées</td><td style="text-align:right;font-family:monospace;font-weight:700">${s.listings.publishedTotal}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Publiées hier</td><td style="text-align:right;font-family:monospace">${s.listings.publishedTodayNew}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Drafts créés hier</td><td style="text-align:right;font-family:monospace">${s.listings.draftToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Vues hier</td><td style="text-align:right;font-family:monospace">${s.engagement.viewsToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Contacts hier (WhatsApp+Phone)</td><td style="text-align:right;font-family:monospace">${s.engagement.contactsToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Favoris hier</td><td style="text-align:right;font-family:monospace">${s.engagement.favoritesToday}</td></tr>
    </table>

    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px">Baux & paiements</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#444">Baux initiés hier</td><td style="text-align:right;font-family:monospace">${s.leases.initiatedToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Baux activés hier</td><td style="text-align:right;font-family:monospace;font-weight:700">${s.leases.activatedToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Litiges ouverts hier</td><td style="text-align:right;font-family:monospace">${s.leases.disputedOpenToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Paiements confirmés hier</td><td style="text-align:right;font-family:monospace">${s.payments.paidToday}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Remboursements hier</td><td style="text-align:right;font-family:monospace">${s.payments.refundedToday}</td></tr>
    </table>

    <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;color:#666;margin:0 0 8px">Modération en attente</h2>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#444">Signalements OPEN</td><td style="text-align:right;font-family:monospace;color:${s.moderation.openReports > 5 ? '#c2410c' : '#444'}">${s.moderation.openReports}</td></tr>
      <tr><td style="padding:6px 0;color:#444">Vérifications CIN en attente</td><td style="text-align:right;font-family:monospace;color:${s.moderation.pendingVerifications > 10 ? '#c2410c' : '#444'}">${s.moderation.pendingVerifications}</td></tr>
    </table>

    <hr style="margin:24px 0;border:none;border-top:1px solid #eee">
    <p style="color:#888;font-size:12px;margin:0">Cron <code>/api/cron/daily-admin-digest</code> — généré ${s.generatedAt.toISOString()}</p>
  </div>
</body>
</html>`
}

function renderText(s: DailyAdminStats): string {
  const day = dateFmt.format(s.windowStart)
  return `AryTrano — digest du ${day}

ACQUISITION
  Signups hier        : ${s.signups.today}
  Signups 7j          : ${s.signups.last7d}
  Signups 30j         : ${s.signups.last30d}
  Total users         : ${s.signups.total}

ACTIVITÉ
  DAU                 : ${s.activity.dau}
  WAU                 : ${s.activity.wau}
  MAU                 : ${s.activity.mau}
  DAU/MAU             : ${pct(s.activity.dau, s.activity.mau)}

ANNONCES & ENGAGEMENT
  Total publiées      : ${s.listings.publishedTotal}
  Publiées hier       : ${s.listings.publishedTodayNew}
  Drafts hier         : ${s.listings.draftToday}
  Vues hier           : ${s.engagement.viewsToday}
  Contacts hier       : ${s.engagement.contactsToday}
  Favoris hier        : ${s.engagement.favoritesToday}

BAUX & PAIEMENTS
  Baux initiés        : ${s.leases.initiatedToday}
  Baux activés        : ${s.leases.activatedToday}
  Litiges ouverts     : ${s.leases.disputedOpenToday}
  Paiements confirmés : ${s.payments.paidToday}
  Remboursements      : ${s.payments.refundedToday}

MODÉRATION EN ATTENTE
  Reports OPEN        : ${s.moderation.openReports}
  Vérif CIN en attente: ${s.moderation.pendingVerifications}

Généré ${s.generatedAt.toISOString()}`
}
