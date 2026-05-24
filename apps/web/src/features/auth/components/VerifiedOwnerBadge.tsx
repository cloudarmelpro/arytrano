'use client'

import { useT } from '@/lib/i18n/client'

/**
 * "Propriétaire vérifié" trust badge (T-040). Rendered next to the
 * owner's display name on the public listing detail when their CIN
 * has been approved by an admin. Visual shape matches the other badges
 * in the app (h-7 rounded-md text-xs) and uses success tones to convey
 * a positive identity signal.
 */
export function VerifiedOwnerBadge() {
  const t = useT()
  return (
    <span
      title={t('owner.badge.verified.tooltip')}
      className="inline-flex h-7 items-center gap-1 rounded-md bg-success/10 px-2.5 text-xs font-medium text-success"
    >
      <UserCheckIcon />
      {t('owner.badge.verified.label')}
    </span>
  )
}

function UserCheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  )
}
