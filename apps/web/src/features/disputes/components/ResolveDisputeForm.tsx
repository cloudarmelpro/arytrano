'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  resolveDisputeAction,
  type ResolveDisputeActionState,
} from '../actions/claim-and-resolve'

const RESOLUTIONS = [
  { value: 'RESOLVED_OWNER', label: 'Favorable au propriétaire' },
  { value: 'RESOLVED_TENANT', label: 'Favorable au locataire' },
  { value: 'RESOLVED_SPLIT', label: 'Décision partagée' },
]

export function ResolveDisputeForm({ disputeId }: { disputeId: string }) {
  const [state, formAction] = useActionState(
    resolveDisputeAction,
    { ok: false } as ResolveDisputeActionState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="disputeId" value={disputeId} />
      <Field>
        <FieldLabel htmlFor={`resolve-resolution-${disputeId}`}>
          Verdict
        </FieldLabel>
        <Select
          name="resolution"
          defaultValue="RESOLVED_SPLIT"
          items={RESOLUTIONS}
        >
          <SelectTrigger id={`resolve-resolution-${disputeId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RESOLUTIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field>
        <FieldLabel htmlFor={`resolve-verdict-${disputeId}`}>
          Motivation (visible aux deux parties)
        </FieldLabel>
        <Textarea
          id={`resolve-verdict-${disputeId}`}
          name="verdict"
          rows={6}
          maxLength={5000}
          minLength={20}
          required
          placeholder="Le verdict d’AryTrano repose sur la comparaison des états d’entrée et de sortie : ..."
        />
      </Field>

      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
        >
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
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? 'Enregistrement…' : 'Rendre le verdict'}
    </Button>
  )
}
