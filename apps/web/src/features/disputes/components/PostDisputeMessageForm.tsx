'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { postDisputeMessageAction } from '../actions/post-message'

export function PostDisputeMessageForm({ disputeId }: { disputeId: string }) {
  const [state, formAction] = useActionState(postDisputeMessageAction, {
    ok: false,
    message: undefined as string | undefined,
  })
  const inputId = `dispute-msg-${disputeId}`

  return (
    <form
      action={(fd) => {
        fd.set('disputeId', disputeId)
        formAction(fd)
      }}
      className="flex flex-col gap-2"
    >
      <Field>
        <FieldLabel htmlFor={inputId}>Ajouter un message</FieldLabel>
        <Textarea
          id={inputId}
          name="body"
          rows={3}
          maxLength={3000}
          minLength={2}
          required
          placeholder="Ajoute des éléments de réponse…"
        />
      </Field>
      {state.message ? (
        <p role="alert" className="text-[12.5px] text-destructive">
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} size="sm" className="self-end">
      {pending ? 'Envoi…' : 'Envoyer'}
    </Button>
  )
}
