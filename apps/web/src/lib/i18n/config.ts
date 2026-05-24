import type { Locale as PrismaLocale } from '@prisma/client'

/**
 * App-facing locale identifiers — use these everywhere except when reading
 * or writing the `User.locale` Prisma enum (which uses `FR_MG` / `MG`).
 *
 * `fr-MG` = French as spoken in Madagascar (default).
 * `mg`    = Malagasy.
 *
 * No URL prefix for v0 — locale lives in a cookie. T-022+ may introduce
 * `/mg/...` paths if SEO indexing of Malagasy variants becomes valuable.
 */
export const LOCALES = ['fr-MG', 'mg'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr-MG'

export const LOCALE_COOKIE = 'arytrano_locale'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/** Display label shown in the locale switcher. */
export const LOCALE_LABEL: Record<Locale, string> = {
  'fr-MG': 'FR',
  mg: 'MG',
}

/** Native long name (used in profile select, accessibility labels). */
export const LOCALE_NATIVE_NAME: Record<Locale, string> = {
  'fr-MG': 'Français',
  mg: 'Malagasy',
}

/** Map between Prisma's `Locale` enum and the app-facing identifier. */
export function fromPrismaLocale(value: PrismaLocale): Locale {
  return value === 'MG' ? 'mg' : 'fr-MG'
}

export function toPrismaLocale(value: Locale): PrismaLocale {
  return value === 'mg' ? 'MG' : 'FR_MG'
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'fr-MG' || value === 'mg'
}
