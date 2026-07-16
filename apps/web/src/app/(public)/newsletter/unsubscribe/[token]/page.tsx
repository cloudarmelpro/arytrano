import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import UnsubscribeConfirmForm from './UnsubscribeConfirmForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Désabonnement newsletter',
  robots: { index: false, follow: false },
}

/**
 * Code-review 2026-07-16 — GET stays read-only. Email link scanners
 * (Outlook SafeLinks, Mimecast, corporate AV) prefetch every URL in
 * a message body; the previous version stamped `unsubscribedAt` on
 * render, so a scan silently unsubscribed the recipient. The actual
 * write now happens via `unsubscribeNewsletterAction` (Server Action
 * bound to the confirm button) or via POST /api/v1/newsletter/
 * unsubscribe/[token] (RFC 8058 one-click from Gmail/Yahoo).
 *
 * Rendered state is a hint only: another tab / scanner that fetches
 * the same URL sees the same page. It leaks nothing beyond "already
 * unsubscribed" (which the user themselves triggered).
 */
export default async function NewsletterUnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  let initialState: 'valid' | 'already' | 'invalid' = 'invalid'
  if (token && token.length >= 20 && token.length <= 64) {
    const row = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { unsubscribedAt: true },
    })
    if (row) initialState = row.unsubscribedAt ? 'already' : 'valid'
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center sm:px-6 lg:py-24">
      {initialState === 'invalid' && (
        <>
          <h1 className="text-2xl font-semibold text-foreground">
            Lien invalide ou expiré
          </h1>
          <p className="text-sm text-muted-foreground">
            Le lien de désabonnement est invalide, expiré, ou déjà utilisé.
            Contacte support@arytrano.com si le problème persiste.
          </p>
        </>
      )}

      {initialState === 'already' && (
        <>
          <h1 className="text-2xl font-semibold text-foreground">
            Déjà désabonné
          </h1>
          <p className="text-sm text-muted-foreground">
            Ton adresse est déjà retirée de la liste. Aucun email marketing ne
            partira à ce destinataire.
          </p>
        </>
      )}

      {initialState === 'valid' && (
        <UnsubscribeConfirmForm token={token} />
      )}

      <div className="pt-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
        >
          Retour à l’accueil
        </Link>
      </div>
    </div>
  )
}
