'use client'

import { useActionState } from 'react'
import { unlinkOAuthAction } from '../actions/unlink-oauth'

// Derive the state type from the action so the action file can keep its
// `'use server'` exports-only-async-functions invariant.
type UnlinkActionState = Awaited<ReturnType<typeof unlinkOAuthAction>>

const initial: UnlinkActionState = { ok: false }

export function UnlinkOAuthButton({
  provider,
  canUnlink,
}: {
  provider: string
  canUnlink: boolean
}) {
  const [state, action, pending] = useActionState(unlinkOAuthAction, initial)

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="provider" value={provider} />
      <button
        type="submit"
        disabled={!canUnlink || pending}
        title={canUnlink ? undefined : 'Ajoute un mot de passe avant de délier ta dernière connexion'}
        className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? '…' : 'Délier'}
      </button>
      {state.message && !state.ok && (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      )}
    </form>
  )
}
