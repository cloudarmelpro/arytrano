'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useT } from '@/lib/i18n/client'
import { toggleFavoriteAction } from '../actions/toggle-favorite'

type Variant = 'overlay' | 'inline'

/**
 * Heart toggle for adding/removing a listing from the user's favorites.
 *
 * Optimistic UI: flips local state immediately, then awaits the Server
 * Action. On failure we roll back + toast. The Server Action returns
 * `needsAuth: true` for anonymous visitors — we redirect to sign-in
 * with the current path captured so the user lands back where they were.
 *
 * Variants:
 *  - `overlay`: positioned absolute, white bg with shadow — meant for
 *    the top-right corner of a listing card image.
 *  - `inline`: text + heart for the detail page header (next to share).
 */
export function FavoriteButton({
  listingId,
  initialFavorited = false,
  variant = 'overlay',
}: {
  listingId: string
  initialFavorited?: boolean
  variant?: Variant
}) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [pending, startTransition] = useTransition()

  function onToggle(e: React.MouseEvent) {
    // When the button is rendered inside a Link card, prevent the click
    // from navigating away to the detail page.
    e.preventDefault()
    e.stopPropagation()
    if (pending) return

    const previous = favorited
    const optimistic = !favorited
    setFavorited(optimistic)

    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId)
      if (result.ok) {
        // Server is authoritative on the resolved state.
        setFavorited(result.favorited ?? optimistic)
        return
      }
      // Roll back optimistic flip.
      setFavorited(previous)
      if (result.needsAuth) {
        // Capture where the user wanted to favorite from so we bring
        // them back after sign-in.
        const returnTo = encodeURIComponent(pathname)
        router.push(`/sign-in?returnTo=${returnTo}`)
        return
      }
      toast.error(result.message ?? t('favorites.error'))
    })
  }

  const label = favorited
    ? t('favorites.remove')
    : t('favorites.add')

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={favorited}
        aria-label={label}
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      >
        <HeartIcon filled={favorited} />
        <span>{favorited ? t('favorites.saved') : t('favorites.save')}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={label}
      className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md transition hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
    >
      <HeartIcon filled={favorited} />
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={filled ? 'text-rose-500' : 'text-foreground'}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
