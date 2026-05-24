import 'server-only'
import { escapeHtml } from '@/lib/format/escape-html'
import type { Locale } from '@/lib/i18n/config'
import { emailHtmlLayout, emailTextLayout, type RenderedEmail } from './_layout'

export type CinResultData = {
  recipientName: string
  /** When `outcome === 'rejected'`, the user-facing reason the admin
   *  recorded. Plain text; the template runs escapeHtml. */
  rejectionReason?: string
  dashboardUrl: string
}

/**
 * "Résultat de vérification d'identité" email (T-040). One template,
 * two outcomes (approved / rejected) — the locale + outcome combos
 * keep enough branching that splitting per-outcome would just
 * duplicate scaffolding.
 */
export function buildCinResultEmail(
  locale: Locale,
  outcome: 'approved' | 'rejected',
  data: CinResultData,
): RenderedEmail {
  const safeName = escapeHtml(data.recipientName)
  const safeReason = data.rejectionReason
    ? escapeHtml(data.rejectionReason)
    : ''

  if (locale === 'mg') {
    if (outcome === 'approved') {
      return {
        subject: 'Voamarina ny maha-ianao tompon-trano',
        html: emailHtmlLayout({
          salutation: `Salama ${safeName},`,
          body:
            `Voamarina ny CIN-nao avy amin'ny ekipan'ny AryTrano. Hiseho amin'ireo filazanao ny marika ` +
            `<strong>« Tompo voamarina »</strong>, izay manampy ny mpianatra hatoky bebe kokoa.`,
          primaryCta: { label: 'Hijery ny tabilaoko', href: data.dashboardUrl },
        }),
        text: emailTextLayout({
          salutation: `Salama ${data.recipientName},`,
          body: 'Voamarina ny CIN-nao. Hihoma-batsy ny marika "Tompo voamarina" amin\'ireo filazanao.',
          cta: data.dashboardUrl,
        }),
      }
    }
    return {
      subject: 'Tsy nekena ny fanamarinana CIN-nao',
      html: emailHtmlLayout({
        salutation: `Salama ${safeName},`,
        body:
          `Tsy afaka nankatoavinay ny CIN nalefanao. Antony :<br/>` +
          `<em>« ${safeReason} »</em><br/><br/>` +
          `Afaka mandefa rakitra vaovao ianao avy amin'ny pejy fanamarinana.`,
        primaryCta: { label: 'Hanitsy ny rakitra', href: data.dashboardUrl },
      }),
      text: emailTextLayout({
        salutation: `Salama ${data.recipientName},`,
        body: `Tsy nekena ny CIN-nao. Antony : ${data.rejectionReason ?? ''}.`,
        cta: data.dashboardUrl,
      }),
    }
  }

  if (outcome === 'approved') {
    return {
      subject: 'Ton identité est vérifiée ✓',
      html: emailHtmlLayout({
        salutation: `Bonjour ${safeName},`,
        body:
          `L'équipe AryTrano a vérifié ta CIN. Le badge ` +
          `<strong>« Propriétaire vérifié »</strong> apparaît désormais sur tes annonces — ` +
          `un signal de confiance qui rassure les étudiants avant qu'ils ne te contactent.`,
        primaryCta: { label: 'Ouvrir mon tableau de bord', href: data.dashboardUrl },
      }),
      text: emailTextLayout({
        salutation: `Bonjour ${data.recipientName},`,
        body: 'Ta CIN est vérifiée. Le badge "Propriétaire vérifié" est actif sur tes annonces.',
        cta: data.dashboardUrl,
      }),
    }
  }

  return {
    subject: "Vérification d'identité refusée",
    html: emailHtmlLayout({
      salutation: `Bonjour ${safeName},`,
      body:
        `Nous n'avons pas pu valider la CIN que tu as envoyée. Motif :<br/>` +
        `<em>« ${safeReason} »</em><br/><br/>` +
        `Tu peux renvoyer un nouveau document depuis la page de vérification.`,
      primaryCta: { label: 'Renvoyer un document', href: data.dashboardUrl },
    }),
    text: emailTextLayout({
      salutation: `Bonjour ${data.recipientName},`,
      body: `Vérification refusée. Motif : ${data.rejectionReason ?? ''}.`,
      cta: data.dashboardUrl,
    }),
  }
}
