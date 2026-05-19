import Link from 'next/link'
import type { UserRole } from '@prisma/client'
import { getT, type Translator } from '@/lib/i18n/translate'
import type { Locale } from '@/lib/i18n/config'

/**
 * Thin top bar (Booking-style yellow ribbon equivalent) that nudges
 * non-owner visitors toward the owner signup flow. Hidden on:
 *  - viewport < 640px (mobile real-estate is precious; the header
 *    dropdown surfaces the same signup option)
 *  - logged-in users with role OWNER or ADMIN (already in the funnel)
 */
export function LandingTopBar({
  locale,
  role,
}: {
  locale: Locale
  role: UserRole | null
}) {
  if (role === 'OWNER' || role === 'ADMIN') return null
  const t: Translator = getT(locale)
  return (
    <div className="hidden bg-primary/10 text-primary sm:block">
      <div className="mx-auto flex max-w-6xl items-center justify-end px-4 py-2 sm:px-6">
        <Link
          href="/sign-up?role=OWNER"
          className="text-xs font-medium underline-offset-4 transition hover:underline"
        >
          {t('landing.topBar.ownerCta')}
        </Link>
      </div>
    </div>
  )
}
