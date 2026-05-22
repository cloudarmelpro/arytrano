'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import { extendListingExpirationAction } from '../actions/extend-listing-expiration'

type Props = {
  listingId: string
  /** When true, the listing is currently UNAVAILABLE (auto-expired or owner-paused). */
  isUnavailable: boolean
}

/**
 * Single button used in two slightly different contexts :
 *   - PUBLISHED but `expiresAt` is approaching (or already past, edge
 *     case if cron ran late) → label "Prolonger".
 *   - UNAVAILABLE (auto-expired) → label "Republier" — same action,
 *     the service flips status back to PUBLISHED.
 *
 * Optimistic toast on success. The Server Action revalidates the
 * dashboard listings path so the new `expiresAt` shows immediately
 * without a manual refresh.
 */
export function ExtendExpirationButton({ listingId, isUnavailable }: Props) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const res = await extendListingExpirationAction(listingId)
      if (res.ok) {
        toast.success(
          res.statusChanged
            ? t('dashboard.listings.expiration.republished')
            : t('dashboard.listings.expiration.extended'),
        )
      } else if (res.needsAuth) {
        toast.error(t('dashboard.listings.expiration.needsAuth'))
      } else {
        toast.error(res.message ?? t('dashboard.listings.expiration.error'))
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-busy={pending}
      className="inline-flex h-7 items-center rounded-md border border-input bg-background px-2.5 text-[11.5px] font-medium text-foreground transition hover:bg-muted disabled:opacity-60"
    >
      {pending
        ? t('dashboard.listings.expiration.pending')
        : isUnavailable
          ? t('dashboard.listings.expiration.republish')
          : t('dashboard.listings.expiration.extend')}
    </button>
  )
}
