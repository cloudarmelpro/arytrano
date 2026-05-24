'use client'

import { useT } from '@/lib/i18n/client'

/**
 * Trust badge rendered on listing cards and the detail page when
 * `Listing.verifiedAt` is set by an admin (T-033). Shape mirrors the
 * other badges in the app (`rounded-md h-7 px-2.5 text-xs font-medium`)
 * with the brand `primary` tint to read as a positive signal.
 */
export function VerifiedListingBadge({
  variant = 'inline',
}: {
  /** `overlay` for image-overlay placement, `inline` for adjacent-to-text. */
  variant?: 'inline' | 'overlay'
}) {
  const t = useT()
  const base =
    'inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary'
  const placement =
    variant === 'overlay'
      ? 'shadow-sm backdrop-blur-sm'
      : 'h-7 px-2.5 text-xs font-medium'
  return (
    <span title={t('listing.badge.verified.tooltip')} className={`${base} ${placement}`}>
      <ShieldCheckIcon />
      {t('listing.badge.verified.label')}
    </span>
  )
}

function ShieldCheckIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
