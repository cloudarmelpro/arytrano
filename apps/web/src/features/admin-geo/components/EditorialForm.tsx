'use client'

import { useActionState, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { ConfirmDestructive } from '@/components/shared/ConfirmDestructive'
import {
  updateNeighborhoodEditorialAction,
  type UpdateEditorialActionState,
} from '../actions/update-editorial'
import type { NeighborhoodEditorial } from '@/features/geo'

const initial: UpdateEditorialActionState = { ok: false }

type FieldDef = {
  key: keyof NeighborhoodEditorial['fr']
  label: string
  maxLength: number
  multiline: boolean
}

const FIELDS: readonly FieldDef[] = [
  { key: 'tagline', label: 'Tagline', maxLength: 140, multiline: false },
  { key: 'landmark', label: 'Repère / landmark', maxLength: 140, multiline: false },
  { key: 'ambiance', label: 'Ambiance', maxLength: 400, multiline: true },
  { key: 'walk', label: 'À pied / commerces', maxLength: 400, multiline: true },
  { key: 'transport', label: 'Transports', maxLength: 200, multiline: false },
  { key: 'distance', label: 'Distance / temps', maxLength: 140, multiline: false },
]

/**
 * Editorial edit form for `Neighborhood.editorial`.
 *
 * 12 inputs (6 fields × 2 locales) + a Clear toggle to revert the row
 * to the legacy TS-dictionary fallback. Server Action validates with
 * Zod; field-level errors come back via `state.fields` keyed by the
 * dot-path Zod emits (`fr.tagline`, `mg.ambiance`, ...).
 *
 * Loading-state hardening (memory `feedback_loading_states`) :
 * `<fieldset disabled={pending}>` disables every input + button
 * during the in-flight submission.
 */
export function EditorialForm({
  citySlug,
  neighborhoodSlug,
  initialEditorial,
}: {
  citySlug: string
  neighborhoodSlug: string
  initialEditorial: NeighborhoodEditorial | null
}) {
  const [state, action, pending] = useActionState(
    updateNeighborhoodEditorialAction,
    initial,
  )
  const [intent, setIntent] = useState<'save' | 'clear'>('save')
  const formRef = useRef<HTMLFormElement>(null)

  function confirmClear() {
    // Flip the intent hidden input then submit programmatically.
    // setState alone wouldn't update the DOM in time before the next
    // event loop tick, so we mutate the hidden input directly and
    // call requestSubmit which respects the form's validation hooks.
    setIntent('clear')
    const intentInput =
      formRef.current?.querySelector<HTMLInputElement>(
        'input[name="intent"]',
      )
    if (intentInput) intentInput.value = 'clear'
    formRef.current?.requestSubmit()
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col gap-6"
    >
      <input type="hidden" name="citySlug" value={citySlug} />
      <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
      <input type="hidden" name="intent" value={intent} />

      <fieldset disabled={pending} className="contents">
        <div className="grid gap-8 lg:grid-cols-2">
          <Column
            locale="fr"
            label="Français"
            initial={initialEditorial?.fr ?? null}
            fieldErrors={state.fields}
          />
          <Column
            locale="mg"
            label="Malagasy"
            initial={initialEditorial?.mg ?? null}
            fieldErrors={state.fields}
          />
        </div>

        {state.message ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
          >
            {state.message}
          </p>
        ) : null}
        {state.ok ? (
          <p
            role="status"
            aria-live="polite"
            className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-medium text-emerald-900"
          >
            Sauvegardé.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Link
            href="/admin/geo"
            className="text-[13.5px] font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Retour à la liste
          </Link>
          <div className="flex items-center gap-2">
            <ConfirmDestructive
              triggerLabel="Effacer (revenir au fallback)"
              triggerVariant="ghost"
              dialogTitle="Effacer l'éditorial ?"
              dialogBody="Le contenu éditorial de ce quartier sera supprimé. Les pages publiques retomberont sur le contenu par défaut (dictionnaire i18n historique, ou rien pour les villes sans fallback). Action réversible — il suffit de re-sauvegarder via ce formulaire."
              confirmLabel="Oui, effacer"
              pending={pending && intent === 'clear'}
              pendingLabel="Effacement…"
              onConfirm={confirmClear}
            />
            <Button
              type="submit"
              onClick={() => setIntent('save')}
              aria-busy={pending && intent === 'save'}
            >
              {pending && intent === 'save' ? 'Sauvegarde…' : 'Sauvegarder'}
            </Button>
          </div>
        </div>
      </fieldset>
    </form>
  )
}

function Column({
  locale,
  label,
  initial,
  fieldErrors,
}: {
  locale: 'fr' | 'mg'
  label: string
  initial: NeighborhoodEditorial['fr'] | null
  fieldErrors?: Record<string, string[]>
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="text-base font-semibold text-foreground">{label}</h2>
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {locale}
        </span>
      </header>
      <FieldGroup>
        {FIELDS.map((f) => (
          <FieldRow
            key={`${locale}.${f.key}`}
            name={`${locale}.${f.key}`}
            field={f}
            defaultValue={initial?.[f.key] ?? ''}
            errors={fieldErrors?.[`${locale}.${f.key}`]}
          />
        ))}
      </FieldGroup>
    </section>
  )
}

function FieldRow({
  name,
  field,
  defaultValue,
  errors,
}: {
  name: string
  field: FieldDef
  defaultValue: string
  errors?: string[]
}) {
  const id = `geo-${name}`
  const errorId = errors?.length ? `${id}-error` : undefined
  return (
    <Field>
      <FieldLabel htmlFor={id}>{field.label}</FieldLabel>
      {field.multiline ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          maxLength={field.maxLength}
          rows={3}
          aria-invalid={Boolean(errors?.length)}
          aria-describedby={errorId}
          className="min-h-[88px] rounded-md border border-border bg-background px-3 py-2 text-[14px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
        />
      ) : (
        <Input
          id={id}
          name={name}
          defaultValue={defaultValue}
          maxLength={field.maxLength}
          aria-invalid={Boolean(errors?.length)}
          aria-describedby={errorId}
        />
      )}
      <FieldDescription>Max {field.maxLength} caractères.</FieldDescription>
      {errors?.length ? (
        <FieldError id={errorId}>{errors.join(' · ')}</FieldError>
      ) : null}
    </Field>
  )
}
