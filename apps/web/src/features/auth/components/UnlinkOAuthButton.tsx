'use client'

import { useActionState, useId } from 'react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
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
  const t = useT()
  const [state, action, pending] = useActionState(unlinkOAuthAction, initial)
  // A11Y-H4 audit fix — hint id is rendered as a visible `<p>` when the
  // button is disabled, and the button's `aria-describedby` points at
  // it so the reason is announced on focus (replacing the inaccessible
  // `title` attribute that only worked on hover).
  const hintId = useId()

  const disabled = !canUnlink || pending

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="provider" value={provider} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-describedby={!canUnlink ? hintId : undefined}
      >
        {pending ? '…' : t('oauth.unlink')}
      </Button>
      {!canUnlink ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {t('oauth.unlinkHint.needPassword')}
        </p>
      ) : null}
      {state.message && !state.ok && (
        <p role="alert" className="text-xs text-destructive">
          {state.message}
        </p>
      )}
    </form>
  )
}
