'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../auth'
import { updateNotifPrefs } from '../services/notif-prefs'

export type UpdateNotifPrefsActionState = {
  ok: boolean
  message?: string
}

/**
 * COM-08 — single Server Action that toggles one of the four per-category
 * email flags. Per memory `feedback_server_action_authn_guard` every
 * mutation re-checks auth; per `feedback_loading_states` the form fully
 * disables itself during pending via useFormStatus + lifted fieldset.
 */
const ALLOWED = new Set([
  'contactNotificationsEnabled',
  'savedSearchAlertsEnabled',
  'listingExpirationAlertsEnabled',
  'leaseUpdatesEnabled',
])

export async function updateNotifPrefsAction(
  _prev: UpdateNotifPrefsActionState,
  formData: FormData,
): Promise<UpdateNotifPrefsActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  const key = String(formData.get('key') ?? '')
  const enabled = formData.get('enabled') === 'true'
  if (!ALLOWED.has(key)) {
    return { ok: false, message: 'Préférence inconnue.' }
  }

  await updateNotifPrefs(session.user.id, {
    [key]: enabled,
  } as Partial<{
    contactNotificationsEnabled: boolean
    savedSearchAlertsEnabled: boolean
    listingExpirationAlertsEnabled: boolean
    leaseUpdatesEnabled: boolean
  }>)
  revalidatePath('/dashboard/notifications')
  return { ok: true }
}
