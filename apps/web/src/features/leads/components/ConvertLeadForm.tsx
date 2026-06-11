'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { convertLeadToLeaseAction } from '../actions/convert-lead-to-lease'

const INITIAL = {
  ok: false,
  message: undefined as string | undefined,
  fields: undefined as Record<string, string[]> | undefined,
  leaseId: undefined as string | undefined,
}

/**
 * E-T28 T-RES-07 — operator-on-behalf conversion form on the lead
 * detail page. Captures the minimum lease params (tenant email, start
 * date, duration months) and POSTs to the convert action.
 *
 * `defaultTenantEmail` comes from the signed-in tenant if the lead
 * was attached ; otherwise the operator types it after asking the
 * visitor to create an account.
 */
export function ConvertLeadForm({
  leadId,
  defaultTenantEmail,
}: {
  leadId: string
  defaultTenantEmail?: string
}) {
  const [state, formAction] = useActionState(
    convertLeadToLeaseAction,
    INITIAL,
  )

  const error = (key: string): string | undefined =>
    state.fields?.[key]?.[0] ?? undefined

  if (state.ok && state.leaseId) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-900">
        Bail créé.{' '}
        <a
          className="font-semibold underline"
          href={`/dashboard/leases/${state.leaseId}`}
        >
          Voir le bail →
        </a>
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="leadId" value={leadId} />
      <FieldGroup>
        <Field data-invalid={!!error('tenantEmail')}>
          <FieldLabel htmlFor={`convert-email-${leadId}`}>
            Email du locataire
          </FieldLabel>
          <Input
            id={`convert-email-${leadId}`}
            name="tenantEmail"
            type="email"
            required
            defaultValue={defaultTenantEmail ?? ''}
            placeholder="locataire@example.com"
            aria-invalid={!!error('tenantEmail')}
          />
          <FieldDescription>
            Le compte AryTrano doit déjà exister. Sinon, demande-lui de
            s’inscrire d’abord.
          </FieldDescription>
          {error('tenantEmail') ? (
            <FieldError errors={[{ message: error('tenantEmail')! }]} />
          ) : null}
        </Field>

        <Field data-invalid={!!error('startDate')}>
          <FieldLabel htmlFor={`convert-start-${leadId}`}>
            Date d’emménagement
          </FieldLabel>
          <Input
            id={`convert-start-${leadId}`}
            name="startDate"
            type="date"
            required
            aria-invalid={!!error('startDate')}
          />
          {error('startDate') ? (
            <FieldError errors={[{ message: error('startDate')! }]} />
          ) : null}
        </Field>

        <Field data-invalid={!!error('durationMonths')}>
          <FieldLabel htmlFor={`convert-duration-${leadId}`}>
            Durée (mois)
          </FieldLabel>
          <Input
            id={`convert-duration-${leadId}`}
            name="durationMonths"
            type="number"
            min={1}
            max={60}
            required
            defaultValue={12}
            aria-invalid={!!error('durationMonths')}
          />
          {error('durationMonths') ? (
            <FieldError errors={[{ message: error('durationMonths')! }]} />
          ) : null}
        </Field>
      </FieldGroup>

      {state.message && !state.fields ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] font-medium text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton />

      <p className="text-[11.5px] text-foreground/55">
        En confirmant, tu déclares que le propriétaire a accepté les
        Conditions d’utilisation Propriétaire verbalement
        (T-RES-12 runbook).
      </p>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? 'Création du bail…' : 'Convertir en bail'}
    </Button>
  )
}
