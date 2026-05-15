import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'
import { sendEmail } from '@/lib/email'
import { env } from '@/lib/env'
import type { SuspendListingInput } from '../schemas/suspend-listing'

export type SuspendListingResult = {
  id: string
  title: string
  status: 'SUSPENDED'
}

/**
 * Admin suspends a listing (T-024).
 *
 * Effects:
 *  - Sets listing.status = SUSPENDED + audit fields (reason / at / by).
 *  - Resolves any OPEN report attached to the listing to `IN_REVIEW`
 *    so they don't keep counting in the admin queue.
 *  - Sends a notification email to the owner (best-effort — failure
 *    doesn't roll back the suspension, just logged).
 *
 * Hard guards:
 *  - Refuses if listing already SUSPENDED or DELETED.
 *  - Refuses if the admin tries to suspend their own listing (defence
 *    against admin-self-favouring; real moderation needs another admin).
 */
export async function suspendListing(
  adminUserId: string,
  input: SuspendListingInput,
): Promise<SuspendListingResult> {
  const listing = await prisma.listing.findFirst({
    where: { id: input.listingId, status: { notIn: ['DELETED', 'SUSPENDED'] } },
    select: {
      id: true,
      title: true,
      slug: true,
      ownerId: true,
      owner: { select: { email: true, name: true, role: true } },
      city: { select: { slug: true, nameFr: true } },
      neighborhood: { select: { slug: true, nameFr: true } },
    },
  })

  if (!listing) {
    throw errors.notFound('Annonce introuvable ou déjà suspendue')
  }
  if (listing.ownerId === adminUserId) {
    throw errors.forbidden('Un admin ne peut pas suspendre sa propre annonce')
  }
  // Peer policy: admin A cannot suspend admin B's listing. Forces out-of-band
  // coordination (Slack / call / second-admin review) before moderating peer
  // content. Surfaces as a forbidden error in the action layer.
  if (listing.owner.role === 'ADMIN') {
    throw errors.forbidden(
      'Suspendre l\'annonce d\'un autre admin demande une coordination hors-bande',
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.listing.update({
      where: { id: listing.id },
      data: {
        status: 'SUSPENDED',
        suspendedReason: input.reason,
        suspendedAt: new Date(),
        suspendedBy: adminUserId,
      },
      select: { id: true, title: true, status: true },
    })
    // Move OPEN reports for this listing to IN_REVIEW so they leave the queue.
    await tx.report.updateMany({
      where: { listingId: listing.id, status: 'OPEN' },
      data: { status: 'IN_REVIEW' },
    })
    return u
  })

  // Best-effort owner notification — never block the action if it fails.
  if (listing.owner.email) {
    const detailUrl = `${env.AUTH_URL.replace(/\/$/, '')}/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
    // Defense in depth — strip CR/LF from title before subject interpolation
    // (also handled centrally in `lib/email/index.ts`, double-belt).
    const safeTitle = listing.title.replace(/[\r\n\t]+/g, ' ').slice(0, 100)
    try {
      await sendEmail({
        to: listing.owner.email,
        subject: `Votre annonce "${safeTitle}" a été suspendue`,
        html: buildSuspensionEmailHtml({
          ownerName: listing.owner.name?.trim().split(/\s+/)[0] ?? null,
          title: listing.title,
          reason: input.reason,
          detailUrl,
        }),
      })
    } catch (err) {
      console.error('[suspend-listing] email notification failed', {
        listingId: listing.id,
        err: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return {
    id: updated.id,
    title: updated.title,
    status: 'SUSPENDED',
  }
}

function buildSuspensionEmailHtml({
  ownerName,
  title,
  reason,
  detailUrl,
}: {
  ownerName: string | null
  title: string
  reason: string
  detailUrl: string
}): string {
  const greeting = ownerName ? `Bonjour ${ownerName},` : 'Bonjour,'
  // React-server renders strip HTML but this is an email body — escape user-supplied
  // text manually to avoid any injection through `title` or `reason`.
  const safeTitle = escapeHtml(title)
  const safeReason = escapeHtml(reason)

  return `
<!doctype html>
<html lang="fr">
  <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #1f2937; max-width: 560px; margin: 0 auto; padding: 24px;">
    <h1 style="font-size: 20px; color: #4F46E5; margin-bottom: 16px;">AryTrano</h1>
    <p>${greeting}</p>
    <p>Votre annonce <strong>${safeTitle}</strong> a été suspendue par l'équipe de modération.</p>
    <p style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; margin: 16px 0;">
      <strong>Raison :</strong><br />
      ${safeReason}
    </p>
    <p>L'annonce n'est plus visible publiquement. Pour la rétablir, corrigez les éléments concernés et contactez le support à <a href="mailto:support@arytrano.com">support@arytrano.com</a>.</p>
    <p>Voir l'annonce : <a href="${detailUrl}">${detailUrl}</a></p>
    <p style="color: #6b7280; font-size: 13px; margin-top: 24px;">— L'équipe AryTrano</p>
  </body>
</html>
  `.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
