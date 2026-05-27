'use client'

import { useActionState } from 'react'
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
import {
  createNeighborhoodAction,
  type CreateNeighborhoodActionState,
} from '../actions/create-neighborhood'

const initial: CreateNeighborhoodActionState = { ok: false }

export function CreateNeighborhoodForm({
  citySlug,
  cityNameFr,
}: {
  citySlug: string
  cityNameFr: string
}) {
  const [state, action, pending] = useActionState(
    createNeighborhoodAction,
    initial,
  )

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="citySlug" value={citySlug} />
      <fieldset disabled={pending} className="contents">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="n-slug">Slug</FieldLabel>
            <Input
              id="n-slug"
              name="slug"
              placeholder="ex : tsianjoma"
              maxLength={60}
              required
              aria-invalid={Boolean(state.fields?.slug?.length)}
              aria-describedby={
                state.fields?.slug?.length ? 'n-slug-error' : 'n-slug-help'
              }
            />
            <FieldDescription id="n-slug-help">
              Unique au sein de <strong>{cityNameFr}</strong>. Apparaît dans
              l&apos;URL (<code>/villes/{citySlug}/quartiers/&lt;slug&gt;</code>)
              et ne pourra plus être changé.
            </FieldDescription>
            {state.fields?.slug?.length ? (
              <FieldError id="n-slug-error">
                {state.fields.slug.join(' · ')}
              </FieldError>
            ) : null}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="n-nameFr">Nom (FR)</FieldLabel>
              <Input
                id="n-nameFr"
                name="nameFr"
                maxLength={60}
                required
                aria-invalid={Boolean(state.fields?.nameFr?.length)}
              />
              {state.fields?.nameFr?.length ? (
                <FieldError>{state.fields.nameFr.join(' · ')}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="n-nameMg">Nom (MG)</FieldLabel>
              <Input
                id="n-nameMg"
                name="nameMg"
                maxLength={60}
                required
                aria-invalid={Boolean(state.fields?.nameMg?.length)}
              />
              {state.fields?.nameMg?.length ? (
                <FieldError>{state.fields.nameMg.join(' · ')}</FieldError>
              ) : null}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="n-lat">Latitude</FieldLabel>
              <Input
                id="n-lat"
                name="lat"
                type="number"
                step="0.000001"
                min={-90}
                max={90}
                required
                aria-invalid={Boolean(state.fields?.lat?.length)}
              />
              <FieldDescription>Entre -90 et 90 (6 décimales).</FieldDescription>
              {state.fields?.lat?.length ? (
                <FieldError>{state.fields.lat.join(' · ')}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="n-lng">Longitude</FieldLabel>
              <Input
                id="n-lng"
                name="lng"
                type="number"
                step="0.000001"
                min={-180}
                max={180}
                required
                aria-invalid={Boolean(state.fields?.lng?.length)}
              />
              <FieldDescription>Entre -180 et 180 (6 décimales).</FieldDescription>
              {state.fields?.lng?.length ? (
                <FieldError>{state.fields.lng.join(' · ')}</FieldError>
              ) : null}
            </Field>
          </div>
        </FieldGroup>

        {state.message ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13.5px] font-medium text-destructive"
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <Link
            href="/admin/geo"
            className="text-[13.5px] font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Annuler
          </Link>
          <Button type="submit" aria-busy={pending}>
            {pending ? 'Création…' : 'Créer le quartier'}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
