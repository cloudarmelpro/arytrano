'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'
import { env } from '@/lib/env'
import { auth } from '@/features/auth'
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from '@/lib/i18n/config'
import { syncUserLocale } from '../services/sync-user-locale'

const localeSchema = z.enum(['fr-MG', 'mg'])

/**
 * Set the visitor's locale (T-020).
 *
 * - Writes the `arytrano_locale` cookie (authoritative on every server render).
 * - If the visitor is signed in, ALSO persists to `User.locale` so the
 *   choice survives across devices once they sign in elsewhere.
 *
 * No `await auth()` guard is required — locale is a UX preference, not a
 * side effect with security impact. Anyone can flip it.
 */
export async function setLocaleAction(locale: Locale): Promise<{ ok: boolean }> {
  const parsed = localeSchema.safeParse(locale)
  if (!parsed.success) return { ok: false }

  const c = await cookies()
  c.set(LOCALE_COOKIE, parsed.data, {
    httpOnly: false, // client-side reads acceptable — not a secret
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: '/',
  })

  // Best-effort DB sync for signed-in users — never fail the action if it errors.
  // Cookie write above is authoritative; the DB row is just a cross-device hint.
  try {
    const session = await auth()
    if (session?.user?.id) {
      await syncUserLocale(session.user.id, parsed.data)
    }
  } catch (err) {
    console.error('[setLocaleAction] DB sync failed', err)
  }

  return { ok: true }
}
