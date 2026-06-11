'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/features/auth'
import { startOperatorShift } from '../services/start-operator-shift'
import { endOperatorShift } from '../services/end-operator-shift'

export type ToggleShiftActionState = {
  ok: boolean
  message?: string
  /** Set to 'started' or 'ended' for the UI to render the right toast. */
  outcome?: 'started' | 'ended' | 'already_active' | 'no_active_shift'
  shiftId?: string
}

/**
 * E-T28 follow-up — single Server Action that toggles the operator's
 * shift state. The form posts `action=start` or `action=end` so the
 * banner UI can use one form element with two submit buttons.
 *
 * ADMIN role-gated.
 */
export async function toggleOperatorShiftAction(
  _prev: ToggleShiftActionState,
  formData: FormData,
): Promise<ToggleShiftActionState> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { ok: false, message: 'Accès refusé.' }
  }

  const action = formData.get('action')
  if (action !== 'start' && action !== 'end') {
    return { ok: false, message: 'Action invalide.' }
  }

  if (action === 'start') {
    const result = await startOperatorShift(session.user.id)
    revalidatePath('/admin/leads')
    if (result.kind === 'already_active') {
      return {
        ok: true,
        outcome: 'already_active',
        shiftId: result.shiftId,
      }
    }
    return { ok: true, outcome: 'started', shiftId: result.shiftId }
  }

  const result = await endOperatorShift(session.user.id)
  revalidatePath('/admin/leads')
  if (result.kind === 'no_active_shift') {
    return { ok: true, outcome: 'no_active_shift' }
  }
  return { ok: true, outcome: 'ended', shiftId: result.shiftId }
}
