import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@/features/auth'
import { listCitiesWithNeighborhoods } from '@/features/geo'
import {
  ListingForm,
  ListingStatusBadge,
  ListingActions,
  PhotoManager,
} from '@/features/listings'
import { getOwnerListing } from '@/features/listings/server'
import { listListingReportsForOwner } from '@/features/reports/server'
import { ApiError } from '@/lib/api/errors'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'

// Title is built from the listing itself in the page; keep the fallback FR.
export const metadata: Metadata = { title: 'Éditer une annonce' }

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')
  if (session.user.role !== 'OWNER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { id } = await params

  let listing
  try {
    listing = await getOwnerListing(session.user.id, id)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound()
    throw err
  }

  const [cities, locale, reports] = await Promise.all([
    listCitiesWithNeighborhoods(),
    getLocale(),
    listListingReportsForOwner(listing.id),
  ])
  const t = getT(locale)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Link href="/dashboard/listings" className="text-sm text-muted-foreground hover:text-primary">
          {t('dashboard.backToListings')}
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-primary">{listing.title}</h1>
          <ListingStatusBadge status={listing.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {listing.neighborhood.nameFr} · {listing.city.nameFr}
        </p>
      </header>

      <section className="border-t border-border pt-8">
        <header className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboard.editListing.section.photos.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.editListing.section.photos.lead')}
          </p>
        </header>
        <PhotoManager listingId={listing.id} initialPhotos={listing.photos} />
      </section>

      <section className="border-t border-border pt-8">
        <header className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboard.editListing.section.info.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.editListing.section.info.lead')}
          </p>
        </header>
        <ListingForm
          mode="edit"
          listingId={listing.id}
          cities={cities}
          defaultValues={{
            title: listing.title,
            description: listing.description,
            type: listing.type,
            priceMonthlyMGA: Number(listing.priceMonthlyMGA),
            cityId: listing.cityId,
            neighborhoodId: listing.neighborhoodId,
            surfaceM2: listing.surfaceM2 ?? undefined,
            bedrooms: listing.bedrooms ?? undefined,
            bathrooms: listing.bathrooms ?? undefined,
            furnished: listing.furnished,
            amenities: listing.amenities,
            customAmenities: listing.customAmenities,
          }}
        />
      </section>

      <section className="border-t border-border pt-8">
        <header className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboard.editListing.section.status.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.editListing.section.status.lead')}
          </p>
        </header>
        <ListingActions listingId={listing.id} status={listing.status} layout="row" />
      </section>

      <section className="border-t border-border pt-8">
        <header className="mb-5 flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboard.editListing.section.moderation.title')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.editListing.section.moderation.lead')}
          </p>
        </header>
        <ModerationList reports={reports} t={t} />
      </section>
    </div>
  )
}

function ModerationList({
  reports,
  t,
}: {
  reports: Awaited<ReturnType<typeof listListingReportsForOwner>>
  t: Translator
}) {
  if (reports.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        {t('dashboard.editListing.moderation.empty')}
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {reports.map((r) => {
        const isOpen = r.status === 'OPEN' || r.status === 'IN_REVIEW'
        return (
          <li
            key={r.id}
            className={`flex flex-col gap-2 rounded-md border p-3 text-sm ${
              isOpen ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  r.status === 'OPEN'
                    ? 'bg-destructive/10 text-destructive'
                    : r.status === 'IN_REVIEW'
                      ? 'bg-secondary text-secondary-foreground'
                      : r.status === 'RESOLVED'
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                }`}
              >
                {t(`admin.reports.status.${r.status}` as const)}
              </span>
              <span className="text-xs font-medium text-foreground">
                {t(`report.reason.${r.reason}` as const)}
              </span>
              <span className="text-xs text-muted-foreground">
                {r.createdAt.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.editListing.moderation.byVisitor')}
            </p>
            {r.adminNote && (
              <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {t('admin.reports.adminNote')}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
                  {r.adminNote}
                </p>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
