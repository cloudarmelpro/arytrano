'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { toggleOperatorShiftAction } from '../actions/toggle-operator-shift'

type Props = {
  activeShift: {
    id: string
    startsAt: Date | string
    endsAt: Date | string
  } | null
}

const INITIAL = {
  ok: false,
  outcome: undefined as
    | 'started'
    | 'ended'
    | 'already_active'
    | 'no_active_shift'
    | undefined,
  message: undefined as string | undefined,
}

function fmtTime(d: Date | string): string {
  return new Date(d).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * E-T28 follow-up — banner at the top of /admin/leads that lets the
 * operator declare / end their shift inline. Replaces the temporary
 * `psql INSERT ...` ritual documented in the runbook §8.
 *
 * When on-shift : green banner with "Tu es on-shift jusqu'à HH:mm" +
 * "Arrêter mon shift" button.
 *
 * When off-shift : neutral banner with "Tu n'es pas on-shift" +
 * "Démarrer un shift 8h" button.
 *
 * Both actions revalidate /admin/leads server-side so the banner
 * re-renders with the new state.
 */
export function OperatorShiftBanner({ activeShift }: Props) {
  const [state, formAction] = useActionState(
    toggleOperatorShiftAction,
    INITIAL,
  )

  useEffect(() => {
    if (state.outcome === 'started') {
      toast.success('Tu es on-shift pour 8 heures.')
    } else if (state.outcome === 'ended') {
      toast.success('Shift terminé.')
    } else if (state.outcome === 'already_active') {
      toast.info('Tu étais déjà on-shift.')
    } else if (state.outcome === 'no_active_shift') {
      toast.info('Aucun shift actif à arrêter.')
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state])

  if (activeShift) {
    return (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500"
          />
          <div className="text-[13.5px] leading-tight">
            <span className="font-semibold text-emerald-900">
              Tu es on-shift jusqu’à {fmtTime(activeShift.endsAt)}
            </span>
            <span className="block text-emerald-800/70">
              Démarré à {fmtTime(activeShift.startsAt)} · les nouveaux leads te
              déclenchent un push.
            </span>
          </div>
        </div>
        <form action={formAction}>
          <input type="hidden" name="action" value="end" />
          <EndShiftButton />
        </form>
      </div>
    )
  }

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="inline-block h-2.5 w-2.5 rounded-full bg-foreground/30"
        />
        <div className="text-[13.5px] leading-tight">
          <span className="font-semibold text-foreground">
            Tu n’es pas on-shift
          </span>
          <span className="block text-foreground/65">
            Démarre un shift pour recevoir les pushs sur ton mobile.
          </span>
        </div>
      </div>
      <form action={formAction}>
        <input type="hidden" name="action" value="start" />
        <StartShiftButton />
      </form>
    </div>
  )
}

function StartShiftButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? 'Démarrage…' : 'Démarrer un shift 8h'}
    </Button>
  )
}

function EndShiftButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      size="sm"
      variant="outline"
      disabled={pending}
      className="border-emerald-300 text-emerald-900 hover:bg-emerald-100/50"
    >
      {pending ? 'Arrêt…' : 'Arrêter mon shift'}
    </Button>
  )
}
