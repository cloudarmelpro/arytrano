'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const SCORE_ITEMS = [
  { value: '0', label: '0 — absent' },
  { value: '1', label: '1 — un peu' },
  { value: '2', label: '2 — correct' },
  { value: '3', label: '3 — excellent' },
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

/**
 * Quiz profile editor — uses shadcn `<Select>` (which wraps Base UI
 * `Select`) for the single-value fields so the dropdown opens BELOW
 * the trigger, mirroring the landing hero search bar UX. Multi-select
 * fields stay as chip-style checkboxes (Base UI Select is single-only;
 * a multi Combobox would be heavier without UX gain at this scale).
 *
 * Memory note (`feedback_base_ui_select`) — `Select.Root` needs the
 * `items` prop so the trigger renders the matching label instead of
 * the raw value (e.g. `low` instead of `Bas (< 250k Ar)`).
 *
 * The server still re-Zod-parses via `quartierQuizProfileSchema`
 * (defense in depth). The UI just makes invalid values unreachable.
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
          <Field>
            <FieldLabel htmlFor="qp-priceTier">Tranche de prix</FieldLabel>
            <EnumSelect
              id="qp-priceTier"
              name="priceTier"
              items={PRICE_TIERS}
              defaultValue={initialProfile?.priceTier ?? 'mid'}
              placeholder="Choisis une tranche"
            />
            <ErrorLine errs={state.fields?.priceTier} />
          </Field>

          <Field>
            <FieldLabel htmlFor="qp-vibe">Ambiance</FieldLabel>
            <EnumSelect
              id="qp-vibe"
              name="vibe"
              items={VIBES}
              defaultValue={initialProfile?.vibe ?? 'mixed'}
              placeholder="Choisis une ambiance"
            />
            <ErrorLine errs={state.fields?.vibe} />
          </Field>

          <Field>
            <FieldLabel>Score « écoles »</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <SubSelect
                label="Université"
                name="schoolScores.university"
                items={SCORE_ITEMS}
                defaultValue={String(
                  initialProfile?.schoolScores.university ?? 0,
                )}
              />
              <SubSelect
                label="Lycées"
                name="schoolScores.lycee"
                items={SCORE_ITEMS}
                defaultValue={String(initialProfile?.schoolScores.lycee ?? 0)}
              />
            </div>
            <FieldDescription>
              0 = absent · 1 = un peu · 2 = correct · 3 = excellent
            </FieldDescription>
            <ErrorLine errs={state.fields?.['schoolScores.university']} />
            <ErrorLine errs={state.fields?.['schoolScores.lycee']} />
          </Field>

          <Field>
            <FieldLabel>Score « mobilité »</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              <SubSelect
                label="À pied"
                name="mobilityScores.walk"
                items={SCORE_ITEMS}
                defaultValue={String(
                  initialProfile?.mobilityScores.walk ?? 0,
                )}
              />
              <SubSelect
                label="Taxi-be"
                name="mobilityScores.taxibe"
                items={SCORE_ITEMS}
                defaultValue={String(
                  initialProfile?.mobilityScores.taxibe ?? 0,
                )}
              />
              <SubSelect
                label="Voiture"
                name="mobilityScores.car"
                items={SCORE_ITEMS}
                defaultValue={String(initialProfile?.mobilityScores.car ?? 0)}
              />
            </div>
            <FieldDescription>
              Viabilité du mode de transport depuis le quartier.
            </FieldDescription>
            <ErrorLine errs={state.fields?.['mobilityScores.walk']} />
            <ErrorLine errs={state.fields?.['mobilityScores.taxibe']} />
            <ErrorLine errs={state.fields?.['mobilityScores.car']} />
          </Field>

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

type SelectItemDef = { value: string; label: string }

/**
 * Wraps shadcn `<Select>` for the full-row enum fields (priceTier,
 * vibe). The popup opens `side="bottom"`, matching the landing hero
 * search bar where the suggestion list drops below the input.
 *
 * `items` prop on `Select` (Root) is mandatory per memory
 * `feedback_base_ui_select` — without it, the trigger renders the raw
 * value (e.g. `low`) instead of the user-facing label.
 */
function EnumSelect({
  id,
  name,
  items,
  defaultValue,
  placeholder,
}: {
  id?: string
  name: string
  items: readonly SelectItemDef[]
  defaultValue: string
  placeholder: string
}) {
  return (
    <Select name={name} items={[...items]} defaultValue={defaultValue}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent side="bottom" sideOffset={6} alignItemWithTrigger={false}>
        {items.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Score sub-select with its own micro-label (for the grid layouts). */
function SubSelect({
  label,
  name,
  items,
  defaultValue,
}: {
  label: string
  name: string
  items: readonly SelectItemDef[]
  defaultValue: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Select name={name} items={[...items]} defaultValue={defaultValue}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          sideOffset={6}
          alignItemWithTrigger={false}
        >
          {items.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
