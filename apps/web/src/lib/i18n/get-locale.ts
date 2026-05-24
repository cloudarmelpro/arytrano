import 'server-only'
import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config'

/**
 * Resolve the current visitor's locale (server-only).
 *
 * Priority:
 *   1. `x-locale` request header (set by `src/proxy.ts` when the URL has
 *      a `/mg/` prefix — URL is the most specific intent signal).
 *   2. `arytrano_locale` cookie (set by `setLocaleAction`)
 *   3. Default (`fr-MG`)
 *
 * We do NOT consult `User.locale` here on every request — instead, the
 * `setLocaleAction` writes the cookie AND updates the DB at the same time
 * so the cookie is authoritative on read. This avoids a DB round trip on
 * every server render of every public page.
 */
export async function getLocale(): Promise<Locale> {
  const [h, c] = await Promise.all([headers(), cookies()])
  const fromHeader = h.get('x-locale')
  if (isLocale(fromHeader)) return fromHeader
  const fromCookie = c.get(LOCALE_COOKIE)?.value
  if (isLocale(fromCookie)) return fromCookie
  return DEFAULT_LOCALE
}
