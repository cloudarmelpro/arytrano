import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, NotifPrefToggle } from '@/features/auth'
import { getNotifPrefs } from '@/features/auth/server'
import { PushSubscribeToggle } from '@/features/push/components/PushSubscribeToggle'

export const metadata: Metadata = {
  title: 'Préférences de notifications',
  robots: { index: false, follow: false },
}

export default async function NotificationsPrefsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/sign-in?next=/dashboard/notifications')

  const prefs = await getNotifPrefs(session.user.id)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          Notifications par email
        </h1>
        <p className="text-sm text-muted-foreground">
          Choisis quelles notifications email AryTrano peut t’envoyer. Tu
          recevras toujours les emails critiques (sécurité du compte,
          paiements, contrat de bail) — même désactivé, on ne peut pas les
          retirer pour des raisons légales (LEG-04).
        </p>
      </header>

      {/* OWN-12 — browser push subscription. Hidden gracefully when
          VAPID env is unset or the browser doesn't support PushManager. */}
      <PushSubscribeToggle />

      <section className="flex flex-col rounded-lg border border-border bg-background p-5">
        <NotifPrefToggle
          prefKey="contactNotificationsEnabled"
          label="Demandes de contact sur mes annonces"
          description="Pour propriétaires — un email à chaque clic « Contacter » d’un visiteur. Désactive si tu préfères tout suivre depuis le dashboard."
          initialEnabled={prefs.contactNotificationsEnabled}
        />
        <NotifPrefToggle
          prefKey="savedSearchAlertsEnabled"
          label="Alertes nouvelles annonces (recherches sauvegardées)"
          description="Pour étudiants — un email quand une annonce publiée correspond à une de tes recherches sauvegardées."
          initialEnabled={prefs.savedSearchAlertsEnabled}
        />
        <NotifPrefToggle
          prefKey="listingExpirationAlertsEnabled"
          label="Rappels expiration d’annonce"
          description="Pour propriétaires — un email 7 jours avant qu’une annonce arrive en fin de période. Tu peux la prolonger en un clic depuis le dashboard."
          initialEnabled={prefs.listingExpirationAlertsEnabled}
        />
        <NotifPrefToggle
          prefKey="leaseUpdatesEnabled"
          label="Mises à jour de bail (non critiques)"
          description="Rappels de signature en attente, notifications de fin de contrat à venir, etc. Les emails critiques liés à la sécurité juridique restent toujours envoyés."
          initialEnabled={prefs.leaseUpdatesEnabled}
        />
      </section>

      <p className="text-xs text-muted-foreground">
        Conformément à LEG-04 (RGPD-MG), tu peux à tout moment exporter tes
        données ou supprimer ton compte depuis{' '}
        <a href="/dashboard/settings" className="text-primary hover:underline">
          /dashboard/settings
        </a>
        .
      </p>
    </div>
  )
}
