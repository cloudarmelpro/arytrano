'use server'

import { unsubscribeNewsletterByToken } from '../services/unsubscribe-by-token'
import type { UnsubscribeResult } from '../services/unsubscribe-by-token'

/**
 * Code-review 2026-07-16 — Server Action fired by the confirm
 * button on the GET page. Splitting mutation off GET-render fixes
 * the SafeLinks / Mimecast silent-unsubscribe class of bug.
 */
export async function unsubscribeNewsletterAction(
  _prev: { state: UnsubscribeResult | 'idle' },
  formData: FormData,
): Promise<{ state: UnsubscribeResult | 'idle' }> {
  const token = String(formData.get('token') ?? '')
  const state = await unsubscribeNewsletterByToken(token)
  return { state }
}
