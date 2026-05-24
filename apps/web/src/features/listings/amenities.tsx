import type { Amenity } from '@prisma/client'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Single source of truth for the amenity catalog — order here is the
 * order shown in the picker (form) and the detail page section.
 *
 * `labelKey` resolves to the localized name (FR / MG).
 * `icon` is the inline SVG `<path>` content rendered by `<AmenityIcon>`.
 *
 * Adding a new amenity: append the enum value in `schema.prisma`, run
 * migration, then add the row here. Order matters — newest at the end
 * unless the new amenity is a clearer grouping that should bubble up.
 */
export type AmenityMeta = {
  value: Amenity
  labelKey: MessageKey
  /** Inline SVG content (path/circle/etc). Use the same 24×24 viewBox. */
  iconPath: React.ReactNode
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export const AMENITY_CATALOG: AmenityMeta[] = [
  {
    value: 'WIFI',
    labelKey: 'amenity.WIFI',
    iconPath: (
      <>
        <path d="M5 12.55a11 11 0 0 1 14.08 0" {...STROKE} />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" {...STROKE} />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" {...STROKE} />
        <circle cx="12" cy="20" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    value: 'KITCHEN_EQUIPPED',
    labelKey: 'amenity.KITCHEN_EQUIPPED',
    iconPath: (
      <>
        <path d="M6 3h12v6H6z" {...STROKE} />
        <path d="M6 9v12h12V9" {...STROKE} />
        <path d="M9 6h1M14 6h1" {...STROKE} />
      </>
    ),
  },
  {
    value: 'WASHING_MACHINE',
    labelKey: 'amenity.WASHING_MACHINE',
    iconPath: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" {...STROKE} />
        <circle cx="12" cy="13" r="4" {...STROKE} />
        <circle cx="8" cy="6" r="0.8" fill="currentColor" />
      </>
    ),
  },
  {
    value: 'HOT_WATER',
    labelKey: 'amenity.HOT_WATER',
    iconPath: (
      <path d="M12 2.5s5 6 5 10a5 5 0 0 1-10 0c0-4 5-10 5-10z" {...STROKE} />
    ),
  },
  {
    value: 'WATER_TANK',
    labelKey: 'amenity.WATER_TANK',
    iconPath: (
      <>
        <path d="M5 8h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" {...STROKE} />
        <path d="M5 8l2-4h10l2 4" {...STROKE} />
      </>
    ),
  },
  {
    value: 'AIR_CONDITIONING',
    labelKey: 'amenity.AIR_CONDITIONING',
    iconPath: (
      <>
        <rect x="3" y="5" width="18" height="10" rx="2" {...STROKE} />
        <path d="M7 19l2-2M12 19v-2M17 19l-2-2" {...STROKE} />
      </>
    ),
  },
  {
    value: 'PARKING',
    labelKey: 'amenity.PARKING',
    iconPath: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" {...STROKE} />
        <path d="M10 16V8h3a2 2 0 0 1 0 4h-3" {...STROKE} />
      </>
    ),
  },
  {
    value: 'MOTO_PARKING',
    labelKey: 'amenity.MOTO_PARKING',
    iconPath: (
      <>
        <circle cx="6" cy="17" r="3" {...STROKE} />
        <circle cx="18" cy="17" r="3" {...STROKE} />
        <path d="M6 17l4-8h4l2 4h2" {...STROKE} />
      </>
    ),
  },
  {
    value: 'GENERATOR',
    labelKey: 'amenity.GENERATOR',
    iconPath: (
      <path d="M13 2L4 14h7l-2 8 9-12h-7z" {...STROKE} />
    ),
  },
  {
    value: 'GUARD',
    labelKey: 'amenity.GUARD',
    iconPath: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...STROKE} />
        <path d="M9 12l2 2 4-4" {...STROKE} />
      </>
    ),
  },
  {
    value: 'SECURITY_GATE',
    labelKey: 'amenity.SECURITY_GATE',
    iconPath: (
      <>
        <path d="M4 21V8l8-5 8 5v13" {...STROKE} />
        <path d="M10 21V12h4v9" {...STROKE} />
      </>
    ),
  },
  {
    value: 'TERRACE',
    labelKey: 'amenity.TERRACE',
    iconPath: (
      <>
        <path d="M3 12h18" {...STROKE} />
        <path d="M5 12V8a7 7 0 0 1 14 0v4" {...STROKE} />
        <path d="M7 21v-9M17 21v-9M12 21v-9" {...STROKE} />
      </>
    ),
  },
  {
    value: 'GARDEN',
    labelKey: 'amenity.GARDEN',
    iconPath: (
      <>
        <path d="M12 22V12" {...STROKE} />
        <path d="M5 12c4-5 7-2 7 0M19 12c-4-5-7-2-7 0" {...STROKE} />
        <path d="M3 22h18" {...STROKE} />
      </>
    ),
  },
  {
    value: 'STUDY_DESK',
    labelKey: 'amenity.STUDY_DESK',
    iconPath: (
      <>
        <path d="M3 17h18l-2 4H5z" {...STROKE} />
        <path d="M5 17V7h14v10" {...STROKE} />
        <path d="M9 11h6" {...STROKE} />
      </>
    ),
  },
  {
    value: 'CLOSE_TO_UNIVERSITY',
    labelKey: 'amenity.CLOSE_TO_UNIVERSITY',
    iconPath: (
      <>
        <path d="M2 9l10-5 10 5-10 5z" {...STROKE} />
        <path d="M6 11v5a6 4 0 0 0 12 0v-5" {...STROKE} />
      </>
    ),
  },
  {
    value: 'CLOSE_TO_MARKET',
    labelKey: 'amenity.CLOSE_TO_MARKET',
    iconPath: (
      <>
        <path d="M3 9h18l-1 11H4z" {...STROKE} />
        <path d="M9 9V5a3 3 0 0 1 6 0v4" {...STROKE} />
      </>
    ),
  },
  {
    value: 'PUBLIC_TRANSPORT',
    labelKey: 'amenity.PUBLIC_TRANSPORT',
    iconPath: (
      <>
        <rect x="5" y="3" width="14" height="14" rx="2" {...STROKE} />
        <path d="M5 11h14M9 17v3M15 17v3" {...STROKE} />
        <circle cx="9" cy="15" r="0.8" fill="currentColor" />
        <circle cx="15" cy="15" r="0.8" fill="currentColor" />
      </>
    ),
  },
]

export const AMENITY_VALUES: readonly Amenity[] = AMENITY_CATALOG.map((a) => a.value)

export function AmenityIcon({ amenity }: { amenity: Amenity }) {
  const meta = AMENITY_CATALOG.find((a) => a.value === amenity)
  if (!meta) return null
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {meta.iconPath}
    </svg>
  )
}
