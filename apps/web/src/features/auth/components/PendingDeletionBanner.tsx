'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cancelAccountDeletionAction } from '@/features/auth/actions/delete-account'

/**
 * TRU-19 — banner shown on /dashboard/settings while a deletion is
 * pending. Lets the user cancel with one click.
 */
export function PendingDeletionBanner({ scheduledFor }: { scheduledFor: Date }) {
  const [pending, startTransition] = useTransition()
  const scheduledLabel = scheduledFor.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">
          Suppression du compte prévue le {scheduledLabel}.
        </p>
        <p className="text-destructive/85">
          Passé cette date, ton compte et toutes tes annonces seront
          anonymisés de manière irréversible.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await cancelAccountDeletionAction({ ok: false })
            if (result.ok) toast.success('Suppression annulée.')
            else if (result.message) toast.error(result.message)
          })
        }}
      >
        {pending ? 'Annulation…' : 'Annuler la suppression'}
      </Button>
    </div>
  )
}
