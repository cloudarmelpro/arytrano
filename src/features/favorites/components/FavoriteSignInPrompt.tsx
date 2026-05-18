import Link from 'next/link'

/**
 * Anonymous-user fallback for the listing-card heart. Renders a static
 * `<Link>` to /sign-in (with a returnTo capture) instead of mounting
 * the `FavoriteButton` client island. Saves the sonner + useRouter JS
 * (~12 KB gzipped) on every listing card for unauthenticated visitors —
 * Madagascar 3G payload win on /annonces and listing-detail related grids.
 */
export function FavoriteSignInPrompt({
  returnTo,
  ariaLabel,
}: {
  returnTo: string
  ariaLabel: string
}) {
  return (
    <Link
      href={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}
      aria-label={ariaLabel}
      className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-foreground shadow-md transition hover:scale-110 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </Link>
  )
}
