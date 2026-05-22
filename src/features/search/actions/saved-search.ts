'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import {
  createSavedSearch,
  deleteSavedSearch,
  toggleSavedSearchAlerts,
} from '../services/saved-search'
import { createSavedSearchSchema } from '../schemas/saved-search'

type SaveResult =
  | { ok: true; id: string }
  | { ok: false; needsAuth?: boolean; message?: string }

/**
 * Save the current /annonces filter set as a named SavedSearch.
 * Auth required — anonymous visitors get redirected to sign-in by
 * the calling client component.
 */
export async function saveSearchAction(
  input: unknown,
): Promise<SaveResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, needsAuth: true }

  let parsed
  try {
    parsed = createSavedSearchSchema.parse(input)
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Champs invalides' }
    }
    throw err
  }

  try {
    const result = await createSavedSearch(session.user.id, parsed)
    revalidatePath('/dashboard/saved-searches')
    return { ok: true, id: result.id }
  } catch {
    return { ok: false, message: 'Impossible de sauvegarder la recherche.' }
  }
}

type SimpleResult = { ok: boolean; message?: string; needsAuth?: boolean }

export async function deleteSavedSearchAction(
  id: string,
): Promise<SimpleResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, needsAuth: true }
  const ok = await deleteSavedSearch(session.user.id, id)
  if (!ok) return { ok: false, message: 'Recherche introuvable.' }
  revalidatePath('/dashboard/saved-searches')
  return { ok: true }
}

export async function toggleSavedSearchAlertsAction(
  id: string,
  alertsOn: boolean,
): Promise<SimpleResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, needsAuth: true }
  const ok = await toggleSavedSearchAlerts(session.user.id, id, alertsOn)
  if (!ok) return { ok: false, message: 'Recherche introuvable.' }
  revalidatePath('/dashboard/saved-searches')
  return { ok: true }
}
