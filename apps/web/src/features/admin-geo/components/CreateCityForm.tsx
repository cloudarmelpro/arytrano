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
  createCityAction,
  type CreateCityActionState,
} from '../actions/create-city'

const initial: CreateCityActionState = { ok: false }

export function CreateCityForm() {
  const [state, action, pending] = useActionState(createCityAction, initial)

  return (
    <form action={action} className="flex flex-col gap-6">
      <fieldset disabled={pending} className="contents">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="city-slug">Slug</FieldLabel>
            <Input
              id="city-slug"
              name="slug"
              placeholder="ex : antsirabe"
              maxLength={40}
              required
              aria-invalid={Boolean(state.fields?.slug?.length)}
              aria-describedby={
                state.fields?.slug?.length
                  ? 'city-slug-error'
                  : 'city-slug-help'
              }
            />
            <FieldDescription id="city-slug-help">
              Lettres minuscules / chiffres / tirets. Apparaît dans l&apos;URL
              (<code>/villes/&lt;slug&gt;</code>) et ne pourra plus être
              changé après création.
            </FieldDescription>
            {state.fields?.slug?.length ? (
              <FieldError id="city-slug-error">
                {state.fields.slug.join(' · ')}
              </FieldError>
            ) : null}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="city-nameFr">Nom (FR)</FieldLabel>
              <Input
                id="city-nameFr"
                name="nameFr"
                placeholder="ex : Antsirabe"
                maxLength={60}
                required
                aria-invalid={Boolean(state.fields?.nameFr?.length)}
              />
              {state.fields?.nameFr?.length ? (
                <FieldError>{state.fields.nameFr.join(' · ')}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="city-nameMg">Nom (MG)</FieldLabel>
              <Input
                id="city-nameMg"
                name="nameMg"
                placeholder="ex : Antsirabe"
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
              <FieldLabel htmlFor="city-lat">Latitude</FieldLabel>
              <Input
                id="city-lat"
                name="lat"
                type="number"
                step="0.000001"
                min={-90}
                max={90}
                placeholder="ex : -19.8659"
                required
                aria-invalid={Boolean(state.fields?.lat?.length)}
              />
              <FieldDescription>Entre -90 et 90 (6 décimales).</FieldDescription>
              {state.fields?.lat?.length ? (
                <FieldError>{state.fields.lat.join(' · ')}</FieldError>
              ) : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="city-lng">Longitude</FieldLabel>
              <Input
                id="city-lng"
                name="lng"
                type="number"
                step="0.000001"
                min={-180}
                max={180}
                placeholder="ex : 47.0331"
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
            {pending ? 'Création…' : 'Créer la ville'}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
