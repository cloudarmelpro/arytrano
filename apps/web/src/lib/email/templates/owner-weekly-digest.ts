import type { OwnerWeeklyDigestPayload } from '@/features/owner-digest/queries/compute-owner-weekly-digest'
import { withUtm } from '@/lib/marketing/utm'

/**
 * OWN-04 — Monday 08:00 Antananarivo weekly recap. Kept plain-vanilla
 * HTML (no react-email) so the send stays fast and consistent with
 * the rest of the email pipeline. Body always includes a link to the
 * per-listing dashboard so the owner can act on the numbers.
 */
export function buildOwnerWeeklyDigestEmail(
  payload: OwnerWeeklyDigestPayload,
  baseUrl: string,
): { subject: string; html: string; text: string } {
  const url = baseUrl.replace(/\/$/, '')
  const utm = {
    source: 'email',
    medium: 'digest',
    campaign: 'owner-weekly',
  } as const
  const linkDashboard = withUtm(`${url}/dashboard/listings`, utm)
  const linkNotifPrefs = withUtm(`${url}/dashboard/notifications`, utm)
  const firstName = payload.name?.trim().split(/\s+/)[0] ?? null
  const greeting = firstName ? `Salut ${firstName},` : 'Salut,'
  const subject = `AryTrano — ${payload.totals.contacts7d} contact${
    payload.totals.contacts7d === 1 ? '' : 's'
  } cette semaine`

  const rows = payload.topListings
    .map(
      (l) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;font-size:14px;">
            <a href="${withUtm(`${url}/${l.citySlug}/${l.neighborhoodSlug}/${l.slug}`, utm)}" style="color:#0b1;font-weight:600;">${escapeHtml(l.title)}</a>
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;font-size:14px;">${l.contacts7d}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;font-size:14px;color:#555;">${l.favorites7d}</td>
          <td style="padding:12px 8px;border-bottom:1px solid #eee;text-align:right;font-family:monospace;font-size:14px;color:#555;">${l.views7d}</td>
        </tr>`,
    )
    .join('')

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f8f7f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">${greeting}</h1>
      <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.55;">
        Voici la semaine écoulée sur ${
          payload.totals.publishedListings === 1
            ? 'ton annonce'
            : `tes ${payload.totals.publishedListings} annonces`
        }.
      </p>

      <div style="display:table;width:100%;table-layout:fixed;margin-bottom:24px;">
        ${statBlock('Contacts', payload.totals.contacts7d)}
        ${statBlock('Favoris', payload.totals.favorites7d)}
        ${statBlock('Vues', payload.totals.views7d)}
      </div>

      ${
        payload.topListings.length > 0
          ? `
      <h2 style="margin:0 0 8px;font-size:15px;font-weight:600;">Top annonces</h2>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Annonce</th>
            <th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Contacts</th>
            <th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Favoris</th>
            <th style="text-align:right;padding:8px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">Vues</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      `
          : ''
      }

      ${
        payload.totals.expiringSoon > 0
          ? `<p style="padding:12px 16px;background:#fff3cd;border-left:3px solid #f0ad4e;font-size:13.5px;color:#7a5a08;margin-bottom:16px;">⚠️ ${payload.totals.expiringSoon} annonce${payload.totals.expiringSoon > 1 ? 's expirent' : ' expire'} dans les 10 prochains jours. Pense à prolonger pour rester visible.</p>`
          : ''
      }

      <div style="margin-top:16px;">
        <a href="${linkDashboard}" style="display:inline-block;background:#0b1;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Voir mes annonces
        </a>
      </div>

      <p style="margin-top:32px;color:#888;font-size:12px;line-height:1.5;">
        Tu reçois cet email parce que tu as des annonces publiées sur
        AryTrano. Tu peux te désabonner de ces récaps hebdomadaires
        depuis <a href="${linkNotifPrefs}" style="color:#666;">tes préférences</a>.
      </p>
    </div>
  </body>
</html>`

  const text = [
    greeting,
    '',
    `Voici la semaine écoulée sur ${payload.totals.publishedListings} annonce(s) :`,
    `- Contacts : ${payload.totals.contacts7d}`,
    `- Favoris : ${payload.totals.favorites7d}`,
    `- Vues : ${payload.totals.views7d}`,
    payload.totals.expiringSoon > 0
      ? `\n⚠️ ${payload.totals.expiringSoon} annonce(s) expirent dans 10 jours.`
      : '',
    '',
    `Voir mes annonces : ${linkDashboard}`,
    '',
    `Désabonnement : ${linkNotifPrefs}`,
  ]
    .filter(Boolean)
    .join('\n')

  return { subject, html, text }
}

function statBlock(label: string, value: number): string {
  return `<div style="display:table-cell;padding:16px 8px;border:1px solid #e6e5e0;background:#fff;text-align:center;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:600;">${label}</div>
    <div style="margin-top:4px;font-family:monospace;font-size:26px;font-weight:600;color:#0b1;">${value}</div>
  </div>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[c]!)
}
