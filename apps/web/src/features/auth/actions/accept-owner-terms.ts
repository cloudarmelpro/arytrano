'use server'

import { redirect } from 'next/navigation'
import { auth } from '../auth'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { acceptOwnerTerms } from '../services/accept-owner-terms'

export type AcceptOwnerTermsActionState = {
  ok: boolean
  message?: string
}

/**
 * Server Action invoked from the onboarding page after the owner
 * ticks the "j'accepte" checkbox.
 *
 * Auth : must be signed in. The service double-checks the OWNER role.
 *
 * Memory rule `feedback_server_action_authn_guard` — every Server Action
 * with side effects does `await auth()` first.
 */
export async function acceptOwnerTermsAction(
  _prev: AcceptOwnerTermsActionState,
  formData: FormData,
): Promise<AcceptOwnerTermsActionState> {
  const locale = await getLocale()
  const t = getT(locale)

  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: t('lease.error.notAuthenticated') }
  }

  // The form has a single required `accepted` checkbox. We re-validate
  // server-side : a tampered form that strips the checkbox shouldn't
  // accept on behalf of the user.
  const accepted = formData.get('accepted')
  if (accepted !== 'on' && accepted !== 'true' && accepted !== '1') {
    return {
      ok: false,
      message: t('onboarding.owner.terms.error.checkRequired'),
    }
  }

  const result = await acceptOwnerTerms(session.user.id)
  switch (result.kind) {
    case 'ok':
      // The service updates ownerTermsAcceptedAt only — no
      // tokenVersion bump. The dashboard layout's per-request
      // Prisma read picks up the fresh timestamp on the next
      // render, so the gate lets the user through naturally
      // without invalidating the JWT.
      redirect('/dashboard')
    case 'not_found':
      return { ok: false, message: t('lease.error.notAuthenticated') }
    case 'not_owner':
      return {
        ok: false,
        message: t('onboarding.owner.terms.error.notOwner'),
      }
  }
}
