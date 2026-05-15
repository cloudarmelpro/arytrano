'use server'

import { auth, signIn } from '../auth'
import { oauthProviderSchema, type OAuthProvider } from '../schemas'

/**
 * Server Action for linking a provider to an EXISTING account (called from
 * `/dashboard/settings` "Lier" buttons). Distinct from `signInWithProvider`
 * because the linking flow never carries an intended role — the user already
 * has a role on their account.
 *
 * Compatible with `<form action={linkProviderAction.bind(null, p.id)}>`:
 * Next.js will pass the FormData as the second arg, which we ignore.
 */
export async function linkProviderAction(
  provider: OAuthProvider,
  _formData?: FormData,
) {
  // Defense-in-depth: refuse the link flow if nobody is signed in.
  // Without this, an XSS payload or a stale logged-out tab on /dashboard/settings
  // would initiate a fresh OAuth sign-in (which is NOT what "Lier" means).
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Authentification requise pour lier un fournisseur')
  }
  const parsed = oauthProviderSchema.parse(provider)
  await signIn(parsed, { redirectTo: '/dashboard/settings' })
}
