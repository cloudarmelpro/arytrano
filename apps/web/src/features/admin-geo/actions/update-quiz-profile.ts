'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { requireAdmin } from '@/features/admin/services/require-admin'
import {
  updateNeighborhoodQuizProfile,
  type UpdateOutcome,
} from '../services/update-neighborhood-quiz-profile'

export type UpdateQuizProfileActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

/**
 * Server Action — reads the structured quizProfile from FormData and
 * forwards to the service. The form uses native inputs (radio, number,
 * checkbox) so the FormData is flat; we reassemble the nested object
 * here before Zod parses it.
 *
 * FormData keys :
 *   intent                            = 'save' | 'clear'
 *   priceTier                         = 'low' | 'mid' | 'high'
 *   schoolScores.university           = '0'..'3'
 *   schoolScores.lycee                = '0'..'3'
 *   housingMix                        = (multi) 'ROOM' | 'STUDIO' | 'APARTMENT'
 *   vibe                              = 'calm' | 'lively' | 'mixed'
 *   mobilityScores.walk               = '0'..'3'
 *   mobilityScores.taxibe             = '0'..'3'
 *   mobilityScores.car                = '0'..'3'
 *   strengths                         = (multi) 'price' | 'school' | 'calm' | 'social'
 */
export async function updateNeighborhoodQuizProfileAction(
  _prev: UpdateQuizProfileActionState,
  formData: FormData,
): Promise<UpdateQuizProfileActionState> {
  await requireAdmin()

  const citySlug = String(formData.get('citySlug') ?? '')
  const neighborhoodSlug = String(formData.get('neighborhoodSlug') ?? '')
  const intent = String(formData.get('intent') ?? 'save')

  const quizProfile =
    intent === 'clear'
      ? null
      : {
          priceTier: String(formData.get('priceTier') ?? ''),
          schoolScores: {
            university: Number(formData.get('schoolScores.university') ?? 0),
            lycee: Number(formData.get('schoolScores.lycee') ?? 0),
          },
          housingMix: formData.getAll('housingMix').map(String),
          vibe: String(formData.get('vibe') ?? ''),
          mobilityScores: {
            walk: Number(formData.get('mobilityScores.walk') ?? 0),
            taxibe: Number(formData.get('mobilityScores.taxibe') ?? 0),
            car: Number(formData.get('mobilityScores.car') ?? 0),
          },
          strengths: formData.getAll('strengths').map(String),
        }

  const result: UpdateOutcome = await updateNeighborhoodQuizProfile({
    citySlug,
    neighborhoodSlug,
    quizProfile,
  })

  switch (result.kind) {
    case 'ok':
      revalidatePath('/admin/geo')
      revalidatePath(`/admin/geo/cities/${citySlug}`)
      revalidatePath(
        `/admin/geo/cities/${citySlug}/neighborhoods/${neighborhoodSlug}`,
      )
      // Quiz Q0 city list is derived from rows that have profile coverage.
      revalidatePath('/quartiers/quiz')
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
