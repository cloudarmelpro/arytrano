'use client'

import { useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@/lib/i18n/client'
import { LOCALES, LOCALE_LABEL, type Locale } from '@/lib/i18n/config'
import { setLocaleAction } from '@/features/i18n'

/**
 * Functional locale switcher (T-020).
 *
 * Reads the active locale from the `LocaleProvider` and toggles via a
 * Server Action that writes the cookie + syncs `User.locale` if signed in.
 *
 * With the `/mg/` URL prefix in place, switching locale ALSO navigates
 * to the equivalent URL — otherwise the cookie says MG but the URL still
 * shows the FR path (or vice versa), confusing both the user and Google.
 */
export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { locale, t } = useLocale()
  const [pending, startTransition] = useTransition()

  function localizedPath(next: Locale): string {
    const stripped = pathname.startsWith('/mg/')
      ? pathname.slice('/mg'.length)
      : pathname === '/mg'
        ? '/'
        : pathname
    const qs = searchParams.toString()
    const suffix = qs ? `?${qs}` : ''
    if (next === 'mg') {
      return (stripped === '/' ? '/mg' : `/mg${stripped}`) + suffix
    }
    return stripped + suffix
  }

  function onSelect(next: Locale) {
    if (next === locale || pending) return
    startTransition(async () => {
      const result = await setLocaleAction(next)
      if (!result.ok) return
      // Replace the URL so the prefix matches the chosen locale. The
      // proxy will sync the cookie again on the next request — using
      // `replace` keeps the back button predictable.
      router.replace(localizedPath(next))
    })
  }

  return (
    <div
      role="group"
      aria-label={t('locale.switcher.aria')}
      aria-busy={pending}
      className="inline-flex items-center rounded-md bg-muted p-0.5 text-xs font-medium"
    >
      {LOCALES.map((l) => {
        const active = locale === l
        return (
          <button
            key={l}
            type="button"
            onClick={() => onSelect(l)}
            aria-pressed={active}
            disabled={pending}
            className={`min-w-[2rem] rounded-md px-3 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {LOCALE_LABEL[l]}
          </button>
        )
      })}
    </div>
  )
}
