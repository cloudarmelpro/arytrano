'use client'

import { useActionState, useTransition } from 'react'
import { toast } from 'sonner'
import { moderateListingVideoAction } from '../actions/moderate-listing-video'

/**
 * T-059 admin moderation — single button that flips a listing's
 * video between PUBLISHED and HIDDEN_BY_ADMIN. Shown on
 * /admin/listings rows when the listing has a video.
 *
 * Hide path : prompts the admin for an optional reason via
 * window.prompt (no separate Dialog needed for the v1 admin tool).
 * Unhide path : direct flip, no reason needed.
 */
export function ModerateVideoButton({
  listingId,
  currentStatus,
}: {
  listingId: string
  currentStatus: 'PUBLISHED' | 'HIDDEN_BY_ADMIN'
}) {
  const [pending, startTransition] = useTransition()
  const [state, action] = useActionState(moderateListingVideoAction, {
    ok: false,
    message: undefined as string | undefined,
    newStatus: undefined as 'PUBLISHED' | 'HIDDEN_BY_ADMIN' | undefined,
  })

  const isHidden =
    state.newStatus !== undefined
      ? state.newStatus === 'HIDDEN_BY_ADMIN'
      : currentStatus === 'HIDDEN_BY_ADMIN'

  function onClick() {
    let reason: string | null = null
    if (!isHidden) {
      // Prompt only on hide. v1 keeps the chrome minimal.
      // eslint-disable-next-line no-alert
      const r = window.prompt('Raison (optionnelle) du masquage :')
      if (r === null) return
      reason = r
    }
    const fd = new FormData()
    fd.set('listingId', listingId)
    fd.set('action', isHidden ? 'unhide' : 'hide')
    if (reason) fd.set('reason', reason)
    startTransition(() => action(fd))
  }

  // Surface error / success as toasts. We dedupe via the message text.
  if (state.message && !state.ok) toast.error(state.message)
  if (state.ok) {
    toast.success(
      state.newStatus === 'HIDDEN_BY_ADMIN'
        ? 'Vidéo masquée.'
        : 'Vidéo réactivée.',
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-[11.5px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
        isHidden
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          : 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
      }`}
    >
      {pending
        ? 'Envoi…'
        : isHidden
          ? '👁 Réactiver la vidéo'
          : '🚫 Masquer la vidéo'}
    </button>
  )
}
