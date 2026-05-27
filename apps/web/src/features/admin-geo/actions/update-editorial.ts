'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import {
  updateNeighborhoodEditorial,
  type UpdateOutcome,
} from '../services/update-neighborhood-editorial'

export type UpdateEditorialActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

/**
 * Server Action wrapper around `updateNeighborhoodEditorial`.
 *
 * Flow :
 *  1. `requireAdmin()` — defense-in-depth (layout already gates UI).
 *  2. Read 12 strings from FormData (6 fields × 2 locales).
 *  3. Service Zod-validates and writes to DB.
 *  4. revalidatePath the public consumers + revalidateTag the
 *     neighborhoods-counts cache so the landing mosaic picks up the
 *     fresh tagline immediately.
 */
export async function updateNeighborhoodEditorialAction(
  _prev: UpdateEditorialActionState,
  formData: FormData,
): Promise<UpdateEditorialActionState> {
  await requireAdmin()

  const citySlug = String(formData.get('citySlug') ?? '')
  const neighborhoodSlug = String(formData.get('neighborhoodSlug') ?? '')

  // SEC audit M3 (2026-05-27) — strict intent. Any value that isn't
  // exactly 'save' or 'clear' is rejected so a future refactor adding
  // a new intent (e.g. 'preview') can't silently fall through to save.
  const rawIntent = String(formData.get('intent') ?? 'save')
  if (rawIntent !== 'save' && rawIntent !== 'clear') {
    return {
      ok: false,
      message: 'Action invalide.',
      fields: { intent: ['valeur attendue : save | clear'] },
    }
  }
  const intent: 'save' | 'clear' = rawIntent

  const editorial =
    intent === 'clear'
      ? null
      : {
          fr: {
            tagline: String(formData.get('fr.tagline') ?? '').trim(),
            landmark: String(formData.get('fr.landmark') ?? '').trim(),
            ambiance: String(formData.get('fr.ambiance') ?? '').trim(),
            walk: String(formData.get('fr.walk') ?? '').trim(),
            transport: String(formData.get('fr.transport') ?? '').trim(),
            distance: String(formData.get('fr.distance') ?? '').trim(),
          },
          mg: {
            tagline: String(formData.get('mg.tagline') ?? '').trim(),
            landmark: String(formData.get('mg.landmark') ?? '').trim(),
            ambiance: String(formData.get('mg.ambiance') ?? '').trim(),
            walk: String(formData.get('mg.walk') ?? '').trim(),
            transport: String(formData.get('mg.transport') ?? '').trim(),
            distance: String(formData.get('mg.distance') ?? '').trim(),
          },
        }

  const result: UpdateOutcome = await updateNeighborhoodEditorial({
    citySlug,
    neighborhoodSlug,
    editorial,
  })

  switch (result.kind) {
    case 'ok':
      revalidatePath('/admin/geo')
      revalidatePath(`/admin/geo/cities/${citySlug}`)
      revalidatePath(
        `/admin/geo/cities/${citySlug}/neighborhoods/${neighborhoodSlug}`,
      )
      // Public surfaces that render editorial.
      revalidatePath('/')
      revalidatePath('/quartiers')
      revalidatePath(`/quartiers/${citySlug}`)
      revalidatePath(`/villes/${citySlug}/quartiers/${neighborhoodSlug}`)
      // Next 16 read-your-own-writes — `updateTag` invalidates inside
      // the same Server Action so the post-redirect view sees the
      // fresh tagline immediately, not after the next cron tick.
      updateTag('neighborhoods-counts')
      return { ok: true }
    case 'not_found':
      return { ok: false, message: 'Quartier introuvable.' }
    case 'validation_failed':
      return {
        ok: false,
        message: 'Champs invalides.',
        fields: Object.fromEntries(
          result.issues.map((i) => [i.path, [i.message]]),
        ),
      }
  }
}
