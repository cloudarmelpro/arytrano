import 'server-only'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import type { ResolveReportInput } from '../schemas/resolve-report'

export type ResolveReportResult = {
  reportId: string
  emailSent: boolean
}

/**
 * Admin marks a report as RESOLVED (action taken) or DISMISSED (false alarm).
 *
 * - Stamps `resolvedAt`, `resolvedBy`, `adminNote` (visible to the reporter
 *   in the notification email and to the listing owner on their dashboard).
 * - If the reporter is signed in (has `email`), notifies them with the
 *   admin's note. Anonymous reporters get no email.
 *
 * Pure business logic — no Auth/request context, no revalidatePath. The
 * Server Action / REST handler wrap this to add session checks + cache
 * invalidation.
 */
export async function resolveReport(input: {
  data: ResolveReportInput
  adminId: string
}): Promise<ResolveReportResult> {
  const report = await prisma.report.update({
    where: { id: input.data.reportId },
    data: {
      status: input.data.decision,
      adminNote: input.data.adminNote,
      resolvedAt: new Date(),
      resolvedBy: input.adminId,
    },
    select: {
      id: true,
      reporter: { select: { email: true, name: true } },
      listing: {
        select: {
          slug: true,
          title: true,
          city: { select: { slug: true } },
          neighborhood: { select: { slug: true } },
        },
      },
    },
  })

  let emailSent = false
  if (report.reporter?.email) {
    try {
      await sendReporterEmail({
        to: report.reporter.email,
        reporterFirstName: report.reporter.name?.trim().split(/\s+/)[0] ?? null,
        decision: input.data.decision,
        adminNote: input.data.adminNote,
        listingTitle: report.listing.title,
        listingUrl: `${env.AUTH_URL.replace(/\/$/, '')}/${report.listing.city.slug}/${report.listing.neighborhood.slug}/${report.listing.slug}`,
      })
      emailSent = true
    } catch (err) {
      // Best-effort — the report status update has succeeded; we only log
      // the email failure so an SMTP outage doesn't block moderation.
      console.error('[resolveReport] reporter email failed', {
        reportId: report.id,
        err: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return { reportId: report.id, emailSent }
}

async function sendReporterEmail(input: {
  to: string
  reporterFirstName: string | null
  decision: 'RESOLVED' | 'DISMISSED'
  adminNote: string
  listingTitle: string
  listingUrl: string
}) {
  const greeting = input.reporterFirstName ? `Bonjour ${input.reporterFirstName},` : 'Bonjour,'
  const safeTitle = escapeHtml(input.listingTitle)
  const safeNote = escapeHtml(input.adminNote)
  const decisionLabel =
    input.decision === 'RESOLVED'
      ? '✅ Pris en compte — action effectuée'
      : '❌ Rejeté — pas d\'action nécessaire'

  await sendEmail({
    to: input.to,
    subject: 'Suivi de ton signalement sur AryTrano',
    html: `
<!doctype html>
<html lang="fr">
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1f2937; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; color: #4F46E5; margin-bottom: 16px;">AryTrano</h1>
    <p>${greeting}</p>
    <p>Tu as signalé l'annonce <strong>${safeTitle}</strong>. Voici la réponse de notre équipe de modération :</p>
    <p style="background: ${input.decision === 'RESOLVED' ? '#ECFDF5' : '#FEF2F2'}; border-left: 4px solid ${input.decision === 'RESOLVED' ? '#10B981' : '#DC2626'}; padding: 12px 16px; margin: 16px 0;">
      <strong>${decisionLabel}</strong><br />
      <span style="display: block; margin-top: 6px;">${safeNote}</span>
    </p>
    <p>Voir l'annonce : <a href="${escapeHtml(input.listingUrl)}">${escapeHtml(input.listingUrl)}</a></p>
    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">— L'équipe AryTrano</p>
  </body>
</html>
    `.trim(),
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
