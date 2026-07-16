'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { unsubscribeNewsletterAction } from '@/features/newsletter/actions/unsubscribe'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Traitement…' : 'Confirmer le désabonnement'}
    </Button>
  )
}

/**
 * Code-review 2026-07-16 — Server Action bound to the confirm form
 * so the actual mutation never runs on GET render. Idle state shows
 * the button; success/error states swap the copy in place.
 */
export default function UnsubscribeConfirmForm({ token }: { token: string }) {
  const [result, formAction] = useActionState(unsubscribeNewsletterAction, {
    state: 'idle' as const,
  })

  if (result.state === 'ok') {
    return (
      <>
        <h1 className="text-2xl font-semibold text-foreground">
          Désabonnement confirmé
        </h1>
        <p className="text-sm text-muted-foreground">
          Tu ne recevras plus la newsletter mensuelle AryTrano. Les emails
          critiques liés à ton compte continuent d’arriver.
        </p>
      </>
    )
  }

  if (result.state === 'already') {
    return (
      <>
        <h1 className="text-2xl font-semibold text-foreground">
          Déjà désabonné
        </h1>
        <p className="text-sm text-muted-foreground">
          Ton adresse était déjà retirée de la liste.
        </p>
      </>
    )
  }

  if (result.state === 'invalid') {
    return (
      <>
        <h1 className="text-2xl font-semibold text-foreground">
          Lien invalide
        </h1>
        <p className="text-sm text-muted-foreground">
          Le lien n’est plus valide. Contacte support@arytrano.com.
        </p>
      </>
    )
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground">
        Confirmer le désabonnement
      </h1>
      <p className="text-sm text-muted-foreground">
        Tu ne recevras plus la newsletter mensuelle AryTrano. Les emails
        critiques liés à ton compte continueront d’arriver.
      </p>
      <form action={formAction} className="mt-4">
        <fieldset className="flex flex-col gap-3">
          <input type="hidden" name="token" value={token} />
          <SubmitButton />
        </fieldset>
      </form>
    </>
  )
}
