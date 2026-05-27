'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  updateNeighborhoodQuizProfileAction,
  type UpdateQuizProfileActionState,
} from '../actions/update-quiz-profile'
import type { QuartierQuizProfile } from '@/features/geo'

const initial: UpdateQuizProfileActionState = { ok: false }

const PRICE_TIERS = [
  { value: 'low', label: 'Bas (< 250k Ar)' },
  { value: 'mid', label: 'Moyen (250-400k Ar)' },
  { value: 'high', label: 'Élevé (> 400k Ar)' },
] as const

const VIBES = [
  { value: 'calm', label: 'Calme' },
  { value: 'lively', label: 'Animé' },
  { value: 'mixed', label: 'Mixte' },
] as const

const HOUSING = [
  { value: 'ROOM', label: 'Chambre' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'APARTMENT', label: 'Appartement' },
] as const

const STRENGTHS = [
  { value: 'price', label: 'Prix' },
  { value: 'school', label: 'École' },
  { value: 'calm', label: 'Calme' },
  { value: 'social', label: 'Vie sociale' },
] as const

const SCORE_OPTIONS = [0, 1, 2, 3]

/**
 * Quiz profile editor.
 *
 * Every input is bounded — scores are 0-3 number selects, enum fields
 * are radios, multi-selects are checkboxes (at least 1 required). The
 * server still re-Zod-parses (defense in depth), but the UI prevents
 * out-of-range submissions in the first place.
 *
 * Two intents :
 *   save  → write the JSON payload to Neighborhood.quizProfile
 *   clear → set quizProfile = NULL (row drops out of Q0 city list)
 */
export function QuizProfileForm({
  citySlug,
  neighborhoodSlug,
  initialProfile,
}: {
  citySlug: string
  neighborhoodSlug: string
  initialProfile: QuartierQuizProfile | null
}) {
  const [state, action, pending] = useActionState(
    updateNeighborhoodQuizProfileAction,
    initial,
  )
  const [intent, setIntent] = useState<'save' | 'clear'>('save')

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="citySlug" value={citySlug} />
      <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
      <input type="hidden" name="intent" value={intent} />

      <fieldset disabled={pending} className="contents">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Price tier */}
          <Field>
            <FieldLabel>Tranche de prix</FieldLabel>
            <RadioRow
              name="priceTier"
              options={PRICE_TIERS}
              defaultValue={initialProfile?.priceTier ?? 'mid'}
            />
            <ErrorLine errs={state.fields?.priceTier} />
          </Field>

          {/* Vibe */}
          <Field>
            <FieldLabel>Ambiance</FieldLabel>
            <RadioRow
              name="vibe"
              options={VIBES}
              defaultValue={initialProfile?.vibe ?? 'mixed'}
            />
            <ErrorLine errs={state.fields?.vibe} />
          </Field>

          {/* School scores */}
          <Field>
            <FieldLabel>Score « écoles » (0-3)</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <ScoreSelect
                name="schoolScores.university"
                label="Université"
                defaultValue={
                  initialProfile?.schoolScores.university ?? 0
                }
              />
              <ScoreSelect
                name="schoolScores.lycee"
                label="Lycées"
                defaultValue={initialProfile?.schoolScores.lycee ?? 0}
              />
            </div>
            <FieldDescription>
              0 = absent · 1 = un peu · 2 = correct · 3 = excellent
            </FieldDescription>
            <ErrorLine errs={state.fields?.['schoolScores.university']} />
            <ErrorLine errs={state.fields?.['schoolScores.lycee']} />
          </Field>

          {/* Mobility scores */}
          <Field>
            <FieldLabel>Score « mobilité » (0-3)</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              <ScoreSelect
                name="mobilityScores.walk"
                label="À pied"
                defaultValue={initialProfile?.mobilityScores.walk ?? 0}
              />
              <ScoreSelect
                name="mobilityScores.taxibe"
                label="Taxi-be"
                defaultValue={
                  initialProfile?.mobilityScores.taxibe ?? 0
                }
              />
              <ScoreSelect
                name="mobilityScores.car"
                label="Voiture"
                defaultValue={initialProfile?.mobilityScores.car ?? 0}
              />
            </div>
            <FieldDescription>Viabilité du mode de transport depuis le quartier.</FieldDescription>
            <ErrorLine errs={state.fields?.['mobilityScores.walk']} />
            <ErrorLine errs={state.fields?.['mobilityScores.taxibe']} />
            <ErrorLine errs={state.fields?.['mobilityScores.car']} />
          </Field>

          {/* Housing mix */}
          <Field>
            <FieldLabel>Types de logements disponibles</FieldLabel>
            <CheckboxGroup
              name="housingMix"
              options={HOUSING}
              defaultValues={initialProfile?.housingMix ?? ['STUDIO']}
            />
            <FieldDescription>Au moins un type.</FieldDescription>
            <ErrorLine errs={state.fields?.housingMix} />
          </Field>

          {/* Strengths */}
          <Field>
            <FieldLabel>Points forts (bonus Q6)</FieldLabel>
            <CheckboxGroup
              name="strengths"
              options={STRENGTHS}
              defaultValues={initialProfile?.strengths ?? ['social']}
            />
            <FieldDescription>
              Détermine quel critère reçoit le 2× bonus quand l&apos;étudiant
              choisit sa priorité.
            </FieldDescription>
            <ErrorLine errs={state.fields?.strengths} />
          </Field>
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
            Profil quiz sauvegardé.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-6">
          <Button
            type="submit"
            variant="ghost"
            onClick={() => setIntent('clear')}
            aria-busy={pending && intent === 'clear'}
          >
            Effacer le profil
          </Button>
          <Button
            type="submit"
            onClick={() => setIntent('save')}
            aria-busy={pending && intent === 'save'}
          >
            {pending && intent === 'save' ? 'Sauvegarde…' : 'Sauvegarder'}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}

function RadioRow<T extends string>({
  name,
  options,
  defaultValue,
}: {
  name: string
  options: readonly { value: T; label: string }[]
  defaultValue: T
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options.map((o) => (
        <label
          key={o.value}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-[13px] has-[:checked]:border-primary has-[:checked]:bg-primary/[0.08] has-[:checked]:text-primary"
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={defaultValue === o.value}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

function ScoreSelect({
  name,
  label,
  defaultValue,
}: {
  name: string
  label: string
  defaultValue: number
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={String(defaultValue)}
        className="h-9 rounded-md border border-border bg-background px-2 text-[14px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {SCORE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  )
}

function CheckboxGroup<T extends string>({
  name,
  options,
  defaultValues,
}: {
  name: string
  options: readonly { value: T; label: string }[]
  defaultValues: readonly T[]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-[13px] has-[:checked]:border-primary has-[:checked]:bg-primary/[0.08] has-[:checked]:text-primary"
        >
          <input
            type="checkbox"
            name={name}
            value={o.value}
            defaultChecked={defaultValues.includes(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  )
}

function ErrorLine({ errs }: { errs?: string[] }) {
  if (!errs?.length) return null
  return <FieldError>{errs.join(' · ')}</FieldError>
}
