import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Désabonnement newsletter',
  robots: { index: false, follow: false },
}

/**
 * Fable-audit L1 — one-click newsletter unsubscribe. Returns 200
 * on every case (success / already / invalid token) so we don't
 * leak whether a token exists. Idempotent — a second click stamps
 * nothing new but still shows the "already unsubscribed" state.
 */
export default async function NewsletterUnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  let state: 'ok' | 'already' | 'invalid' = 'invalid'

  if (token && token.length >= 20 && token.length <= 64) {
    const row = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, unsubscribedAt: true },
    })
    if (row) {
      if (row.unsubscribedAt) {
        state = 'already'
      } else {
        await prisma.newsletterSubscriber.update({
          where: { id: row.id },
          data: { unsubscribedAt: new Date() },
        })
        state = 'ok'
      }
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-16 text-center sm:px-6 lg:py-24">
      <h1 className="text-2xl font-semibold text-foreground">
        {state === 'ok' && 'Désabonnement confirmé'}
        {state === 'already' && 'Déjà désabonné'}
        {state === 'invalid' && 'Lien invalide ou expiré'}
      </h1>
      <p className="text-sm text-muted-foreground">
        {state === 'ok' &&
          'Tu ne recevras plus la newsletter mensuelle AryTrano. Les emails critiques liés à ton compte continuent d’arriver.'}
        {state === 'already' &&
          'Ton adresse est déjà retirée de la liste. Aucun email marketing ne partira à ce destinataire.'}
        {state === 'invalid' &&
          'Le lien de désabonnement est invalide, expiré, ou déjà utilisé. Contacte support@arytrano.com si le problème persiste.'}
      </p>
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
