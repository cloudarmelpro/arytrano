'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  suspendUserAction,
  reinstateUserAction,
} from '../actions/suspend-user'

const INITIAL = { ok: false as const }

export function SuspendUserPanel({
  userId,
  status,
  currentReason,
}: {
  userId: string
  status: string
  currentReason: string | null
}) {
  const [suspendState, suspendAction, suspending] = useActionState(
    suspendUserAction,
    INITIAL,
  )
  const [reinstateState, reinstateAction, reinstatePending] = useActionState(
    reinstateUserAction,
    INITIAL,
  )
  const [reason, setReason] = useState('')
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    if (suspendState.ok) {
      toast.success('Compte suspendu.')
      setOpening(false)
      setReason('')
    } else if (suspendState.message) toast.error(suspendState.message)
  }, [suspendState])
  useEffect(() => {
    if (reinstateState.ok) toast.success('Compte réactivé.')
    else if (reinstateState.message) toast.error(reinstateState.message)
  }, [reinstateState])

  if (status === 'SUSPENDED') {
    return (
      <section className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <header className="flex flex-col gap-1">
          <p className="font-semibold text-destructive">Compte suspendu</p>
          {currentReason && (
            <p className="text-foreground/80">Raison : {currentReason}</p>
          )}
        </header>
        <form action={reinstateAction}>
          <input type="hidden" name="userId" value={userId} />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={reinstatePending}
          >
            {reinstatePending ? 'Réactivation…' : 'Réactiver'}
          </Button>
        </form>
      </section>
    )
  }

  if (!opening) {
    return (
      <section className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-4">
        <p className="text-sm text-foreground/70">
          Suspend ce compte pour bloquer sa connexion. Un email lui sera envoyé
          avec la raison.
        </p>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setOpening(true)}
        >
          Suspendre
        </Button>
      </section>
    )
  }

  return (
    <form
      action={suspendAction}
      className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-foreground">Motif de suspension</span>
        <textarea
          name="reason"
          rows={3}
          required
          minLength={4}
          maxLength={500}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={suspending}
          placeholder="Raison surfaces à l’utilisateur dans son email."
          className="min-h-[72px] rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        />
      </label>
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={suspending || reason.trim().length < 4}
        >
          {suspending ? 'Envoi…' : 'Confirmer la suspension'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={suspending}
          onClick={() => {
            setOpening(false)
            setReason('')
          }}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
