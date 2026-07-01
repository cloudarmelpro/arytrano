import type { Metadata } from 'next'
import { OwnerBroadcastForm } from '@/features/admin-broadcast/components/OwnerBroadcastForm'

export const metadata: Metadata = {
  title: 'Broadcast — Admin',
  robots: { index: false, follow: false },
}

export default function AdminBroadcastPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          Broadcast propriétaires
        </h1>
        <p className="text-sm text-muted-foreground">
          Envoie un email one-shot à tous les comptes ACTIVE avec le rôle
          OWNER ou ADMIN. Utilise ce canal avec parcimonie — les
          propriétaires ne peuvent pas s’en désinscrire (email officiel).
        </p>
      </header>
      <OwnerBroadcastForm />
    </div>
  )
}
