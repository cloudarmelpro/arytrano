'use client'

/**
 * Cross-tab auth-state broadcaster (consumer = AuthBroadcastListener).
 *
 * Producer-side, fired from client code after a successful sign-in or
 * sign-out so other tabs of the same origin pick up the change without
 * the user having to refresh them.
 *
 * No-op when `BroadcastChannel` is missing (very old browsers) — the
 * tab will simply stay out of sync until it's refreshed manually.
 *
 * The channel lifecycle is intentionally short : we open, post, close.
 * Long-lived listener channels live in `AuthBroadcastListener`.
 */
export function broadcastAuthChange(type: 'signin' | 'signout'): void {
  if (typeof BroadcastChannel === 'undefined') return
  try {
    const channel = new BroadcastChannel('arytrano-auth')
    channel.postMessage(type)
    channel.close()
  } catch {
    // Safari occasionally throws when the channel API is temporarily
    // disabled (private mode, storage partitioning) — silently ignore.
  }
}
