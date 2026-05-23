import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { listUserSavedSearches } from '@/features/search/server'
import { SavedSearchRow } from '@/features/search'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

export const metadata: Metadata = {
  title: 'Recherches sauvegardées · AryTrano',
  robots: { index: false, follow: false },
}

/**
 * Student-facing dashboard page listing the saved searches the user
 * has created from /annonces. Each row exposes Run / Toggle alerts
 * / Delete. Per memory `feedback_server_action_authn_guard`, every
 * mutation goes through a Server Action that re-checks auth.
 */
export default async function SavedSearchesPage() {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?returnTo=/dashboard/saved-searches')

  const [searches, locale] = await Promise.all([
    listUserSavedSearches(session.user.id),
    getLocale(),
  ])
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('savedSearch.page.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('savedSearch.page.lead')}
        </p>
      </header>

      {searches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <p className="text-base font-semibold text-foreground">
            {t('savedSearch.page.empty.title')}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t('savedSearch.page.empty.lead')}
          </p>
          <Link
            href="/annonces"
            className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-[14px] font-semibold text-primary-foreground transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {t('savedSearch.page.empty.cta')}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {searches.map((s) => (
            <SavedSearchRow
              key={s.id}
              id={s.id}
              name={s.name}
              filters={s.filters}
              alertsOn={s.alertsOn}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
