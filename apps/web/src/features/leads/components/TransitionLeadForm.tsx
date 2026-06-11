'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { transitionLeadStatusAction } from '../actions/transition-lead-status'

const INITIAL = {
  ok: false,
  message: undefined as string | undefined,
  fields: undefined as Record<string, string[]> | undefined,
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'IN_DISCUSSION', label: 'En discussion' },
  { value: 'AWAITING_OWNER', label: 'En attente propriétaire' },
  { value: 'AWAITING_TENANT', label: 'En attente locataire' },
  { value: 'REJECTED', label: 'Rejeté' },
]

const CHANNEL_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: '— (note simple)' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Téléphone' },
  { value: 'email', label: 'Email' },
  { value: 'in-person', label: 'En personne' },
]

export function TransitionLeadForm({ leadId }: { leadId: string }) {
  const [state, formAction] = useActionState(
    transitionLeadStatusAction,
    INITIAL,
  )

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`tx-next-${leadId}`}>Nouveau statut</FieldLabel>
          <Select
            name="nextStatus"
            defaultValue="IN_DISCUSSION"
            items={STATUS_OPTIONS}
          >
            <SelectTrigger id={`tx-next-${leadId}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`tx-channel-${leadId}`}>Canal (optionnel)</FieldLabel>
          <Select
            name="channel"
            defaultValue=""
            items={CHANNEL_OPTIONS}
          >
            <SelectTrigger id={`tx-channel-${leadId}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHANNEL_OPTIONS.map((o) => (
                <SelectItem key={o.value || 'none'} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            Renseigne le canal pour logger un MESSAGED ; vide = NOTE.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`tx-note-${leadId}`}>Note</FieldLabel>
          <Textarea
            id={`tx-note-${leadId}`}
            name="note"
            rows={3}
            maxLength={2000}
            placeholder="Résumé de l'échange / raison du rejet…"
          />
        </Field>
      </FieldGroup>
      {state.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] font-medium text-destructive"
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
      {pending ? 'Enregistrement…' : 'Enregistrer'}
    </Button>
  )
}
