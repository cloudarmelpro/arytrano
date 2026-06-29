import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { listUserSavedSearches } from '@/features/search/server'
import { SavedSearchRow } from '@/features/search'
import { EmptyState } from '@/components/shared/EmptyState'
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
        <EmptyState
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          }
          title={t('savedSearch.page.empty.title')}
          description={t('savedSearch.page.empty.lead')}
          cta={{ href: '/annonces', label: t('savedSearch.page.empty.cta') }}
        />
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
