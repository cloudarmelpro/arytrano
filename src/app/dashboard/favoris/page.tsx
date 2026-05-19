import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { listUserFavorites } from '@/features/favorites/server'
import { PublicListingCard } from '@/features/listings'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'

type SearchParams = Promise<{ cursor?: string }>

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('favorites.page.metaTitle'),
    robots: { index: false, follow: false },
  }
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in?returnTo=/dashboard/favoris')

  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)
  const { items, nextCursor, hasMore } = await listUserFavorites(
    session.user.id,
    sp.cursor,
  )

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold text-primary">
          {t('favorites.page.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('favorites.page.lead')}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border bg-muted/30 p-12 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-base font-medium text-foreground">
              {t('favorites.page.empty.title')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('favorites.page.empty.lead')}
            </p>
          </div>
          <Link
            href="/annonces"
            className="mt-2 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {t('favorites.page.empty.cta')}
          </Link>
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((l) => (
              <PublicListingCard
                key={l.id}
                listing={l}
                t={t}
                // Page is auth-gated and every card here is favorited.
                authenticated
                initialFavorited
              />
            ))}
          </ul>

          {hasMore && nextCursor && (
            <nav className="flex justify-center" aria-label={t('favorites.page.pagination')}>
              <Link
                href={`/dashboard/favoris?cursor=${nextCursor}`}
                className="inline-flex h-10 items-center rounded-md border border-border bg-background px-5 text-sm font-medium transition hover:bg-muted"
              >
                {t('favorites.page.next')}
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
