'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Cross-tab sync for sign-in / sign-out events.
 *
 * Mounted once at the root layout. Listens on a BroadcastChannel and
 * triggers `router.refresh()` when another tab broadcasts a session
 * change. `router.refresh()` re-runs the Server Components — sidebar,
 * header, and any layout guard pick up the new session state without
 * a full page reload.
 *
 * Outbound broadcasts are fired from :
 *   - signOutAction wrapper (when user clicks "Sign out" in this tab)
 *   - sign-in success (after the credentials submit lands)
 *
 * Channel name `arytrano-auth` is shared with `lib/auth/broadcast.ts`
 * so the producer side stays in sync. If a browser lacks
 * BroadcastChannel (very old Safari), the effect is a no-op — the
 * user just keeps their per-tab state and refreshes manually.
 */
export function AuthBroadcastListener() {
  const router = useRouter()

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel('arytrano-auth')

    function onMessage(event: MessageEvent) {
      // Both 'signin' and 'signout' should re-run RSC so the UI matches
      // the new session state. We refresh rather than hard-reload to
      // preserve client-side scroll position + open modals etc.
      if (event.data === 'signin' || event.data === 'signout') {
        router.refresh()
      }
    }

    channel.addEventListener('message', onMessage)
    return () => {
      channel.removeEventListener('message', onMessage)
      channel.close()
    }
  }, [router])

  return null
}
