import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SuspendListingButton, VerifyListingButton } from '@/features/admin'
import {
  listAdminListings,
  listAdminListingsQuerySchema,
  type AdminListingRow,
} from '@/features/admin/server'
import { ListingStatusBadge } from '@/features/listings'
import { formatAriary } from '@/lib/format/currency'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import { AdminListingsFilters } from './filters'

type SearchParams = Promise<{
  cursor?: string
  status?: string
  q?: string
}>

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return { title: t('admin.listings.title') }
}

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const [sp, locale] = await Promise.all([searchParams, getLocale()])
  const t = getT(locale)
  const parsed = listAdminListingsQuerySchema.safeParse({
    cursor: sp.cursor,
    status: sp.status || undefined,
    q: sp.q || undefined,
  })
  const query = parsed.success ? parsed.data : {}
  const { items, nextCursor, hasMore } = await listAdminListings(query)
  const filtered = Boolean(query.status || query.q || sp.cursor)
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const buildNextHref = (cursor: string) => {
    const next = new URLSearchParams()
    if (sp.status) next.set('status', sp.status)
    if (sp.q) next.set('q', sp.q)
    next.set('cursor', cursor)
    return `/admin/listings?${next.toString()}`
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
          {t('admin.listings.title')}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {t('admin.listings.lead')}
        </p>
      </header>

      <AdminListingsFilters />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-base font-medium">
            {filtered ? t('admin.listings.empty.filtered') : t('admin.listings.empty.all')}
          </p>
          {filtered && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('admin.listings.empty.lead')}
            </p>
          )}
        </div>
      ) : (
        <>
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((l) => (
              <AdminListingCard
                key={l.id}
                listing={l}
                t={t}
                dateFormatter={dateFormatter}
              />
            ))}
          </ul>
          {hasMore && nextCursor && (
            <nav className="mt-4 flex justify-center" aria-label="Pagination">
              <Link
                href={buildNextHref(nextCursor)}
                className="inline-flex h-10 items-center justify-center rounded-md bg-muted px-5 text-sm font-medium text-foreground transition hover:bg-muted/70"
              >
                {t('admin.listings.next')}
              </Link>
            </nav>
          )}
          {sp.cursor && (
            <div className="flex justify-center">
              <Link
                href="/admin/listings"
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                {t('admin.listings.backToStart')}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AdminListingCard({
  listing,
  t,
  dateFormatter,
}: {
  listing: AdminListingRow
  t: Translator
  dateFormatter: Intl.DateTimeFormat
}) {
  const publicHref =
    listing.status === 'PUBLISHED'
      ? `/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
      : null
  const dateValue = listing.publishedAt ?? listing.createdAt
  return (
    <li className="group flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        {listing.thumbnailUrl ? (
          <Image
            src={listing.thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            —
          </div>
        )}

        <div className="absolute left-3 top-3">
          <ListingStatusBadge status={listing.status} />
        </div>

        {listing.reportCount > 0 && (
          <span
            aria-label={t(
              listing.reportCount <= 1
                ? 'admin.listings.reportBadge.one'
                : 'admin.listings.reportBadge.other',
              { count: listing.reportCount },
            )}
            className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground shadow-sm"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" />
            {listing.reportCount}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-1 px-0.5">
        <p className="text-xs text-muted-foreground">
          {t(`listing.type.${listing.type}` as const)}
          <span className="mx-1">·</span>
          {listing.neighborhood.nameFr}
        </p>
        <p className="line-clamp-1 text-[15px] font-medium text-foreground">
          {listing.title}
        </p>
        <p className="mt-1 text-[15px]">
          <span className="font-mono font-semibold text-foreground">
            {formatAriary(listing.priceMonthlyMGA)}
          </span>
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          <span className="text-foreground">{listing.owner.name ?? '—'}</span>
          <span className="mx-1">·</span>
          <span className="font-mono">{listing.owner.email}</span>
        </p>

        <p className="text-xs text-muted-foreground">
          {dateFormatter.format(dateValue)}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {publicHref && (
            <Link
              href={publicHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
            >
              <IconExternal />
              {t('admin.listings.viewPublic')}
            </Link>
          )}
          {listing.status !== 'SUSPENDED' && listing.status !== 'DELETED' && (
            <>
              <VerifyListingButton
                listingId={listing.id}
                verifiedAt={listing.verifiedAt}
              />
              <div className="ml-auto">
                <SuspendListingButton
                  listingId={listing.id}
                  listingTitle={listing.title}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </li>
  )
}

function IconExternal() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}
