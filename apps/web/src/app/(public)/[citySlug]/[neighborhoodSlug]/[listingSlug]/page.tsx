import type { Metadata } from 'next'
import { after } from 'next/server'
import Link from 'next/link'
import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'
import { env } from '@/lib/env'
import { extractRequestInfo } from '@/lib/auth/request-info'
import {
  recordListingView,
  classifyViewSource,
} from '@/features/listings/services/record-listing-view'
import { formatAriary } from '@/lib/format/currency'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import {
  buildBreadcrumbListLd,
  buildRealEstateListingLd,
} from '@/lib/seo/realestate-listing'
import { cloudinarySocialCard } from '@/lib/images/cloudinary-transform'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import { localeAlternates } from '@/lib/seo/alternates'
import {
  PhotoGallery,
  ContactButtons,
  ShareButton,
  ListingMapClient,
  PublicListingCard,
  VerifiedListingBadge,
  AMENITY_CATALOG,
  AmenityIcon,
} from '@/features/listings'
import { InterestLeadCta } from '@/features/listings/components/InterestLeadCta'
import { MobileStickyContactBar } from '@/features/listings/components/MobileStickyContactBar'
import { SectionErrorBoundary } from '@/components/shared/SectionErrorBoundary'
import {
  getPublicListing,
  getListingStatusBySlug,
  listRelatedListings,
} from '@/features/listings/server'
import { auth, VerifiedOwnerBadge } from '@/features/auth'
import { ReportButton } from '@/features/reports'
import { FavoriteButton } from '@/features/favorites'
import { getFavoritedListingIds } from '@/features/favorites/server'
import { ReviewForm, ReviewList, StarRating } from '@/features/reviews'
import {
  listListingReviews,
  getReviewStats,
  hasUserReviewed,
  getReviewReactionsForList,
} from '@/features/reviews/server'

type Params = Promise<{
  citySlug: string
  neighborhoodSlug: string
  listingSlug: string
}>

const baseUrl = () => env.AUTH_URL.replace(/\/$/, '')

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const { citySlug, neighborhoodSlug, listingSlug } = await params
  const [listing, locale] = await Promise.all([
    getPublicListing(citySlug, neighborhoodSlug, listingSlug),
    getLocale(),
  ])
  const t = getT(locale)
  if (!listing) {
    // Even when the page returns 404, Search Console occasionally
    // surfaces the "title" of the response — explicit noindex stops
    // the not-found shell from briefly polluting brand snippets.
    return {
      title: t('detail.notFound'),
      robots: { index: false, follow: false },
    }
  }
  const typeLabel = t(`listing.type.${listing.type}` as const)
  // Title kept short — root template " — AryTrano" eats ~12 chars.
  const title = listing.title.length > 40 ? listing.title.slice(0, 40) + '…' : listing.title
  const description =
    listing.description.length > 155
      ? listing.description.slice(0, 152).trim() + '…'
      : listing.description
  const canonicalPath = `/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
  // Explicit OG image fallback to the site logo when a listing has no photos —
  // never let Next.js silently bubble up to the root layout's image (the
  // generic AryTrano card could get cached by WhatsApp/Facebook before the
  // owner uploads photos, locking in the wrong share preview).
  // Performance audit follow-up (2026-06-08) — transform the OG image
  // URL to a 1200×630 WebP q_80 (~50–100 KB). Pre-fix Facebook /
  // WhatsApp / Twitter Card crawlers were fetching the raw upload
  // URL (1–3 MB), slowing link-preview rendering. Fallback uses the
  // static brand asset which is already optimized.
  const rawOgImage = listing.photos[0]?.url
  const ogImage = rawOgImage
    ? cloudinarySocialCard(rawOgImage)
    : `${baseUrl()}/images/arytrano.webp`

  return {
    title,
    description,
    alternates: await localeAlternates(canonicalPath),
    openGraph: {
      type: 'website',
      title: `${typeLabel} à ${listing.neighborhood.nameFr}, ${listing.city.nameFr}`,
      description,
      url: canonicalPath,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
  }
}

export default async function PublicListingDetailPage({
  params,
}: {
  params: Params
}) {
  const { citySlug, neighborhoodSlug, listingSlug } = await params
  const [listing, locale, session] = await Promise.all([
    getPublicListing(citySlug, neighborhoodSlug, listingSlug),
    getLocale(),
    auth(),
  ])
  // SEO B1: distinguish "never existed" (404) from "temporarily off-market"
  // (permanent redirect → /annonces, which Google treats as 301) and
  // "permanently gone" (404 today; ideally 410 once we host a custom
  // status response — App Router pages can't yet set 410 directly).
  if (!listing) {
    const status = await getListingStatusBySlug(
      citySlug,
      neighborhoodSlug,
      listingSlug,
    )
    if (status === 'UNAVAILABLE') {
      // 308 — Google treats it equivalently to 301 for indexing decisions.
      // Hand the visitor back to the catalog so they don't bounce off a
      // dead URL while the owner is between tenants.
      permanentRedirect('/annonces')
    }
    notFound()
  }

  const t = getT(locale)
  const typeLabel = t(`listing.type.${listing.type}` as const)
  const altFallback = `${typeLabel} à ${listing.neighborhood.nameFr}, ${listing.city.nameFr}`
  const userId = session?.user?.id ?? null
  const [favoritedIds, reviewStats, reviewsPage, userAlreadyReviewed] =
    await Promise.all([
      getFavoritedListingIds(userId, [listing.id]),
      getReviewStats(listing.id),
      listListingReviews(listing.id),
      hasUserReviewed(userId, listing.id),
    ])
  // Batch-load reactions in one go for the visible reviews (no N+1).
  const reactionsMap = await getReviewReactionsForList(
    reviewsPage.items.map((r) => r.id),
    userId,
  )
  const initialFavorited = favoritedIds.has(listing.id)
  const isOwner = Boolean(userId) && userId === listing.ownerId
  // Eligibility for the review form: signed in, not the owner, not a
  // duplicate reviewer. We fall back to a friendly message in each case.
  const canSubmitReview = Boolean(userId) && !isOwner && !userAlreadyReviewed

  // T-058 — record the visit via `after()` so the response isn't
  // blocked by the DB write. Owner himself doesn't count (would inflate
  // his own dashboard). Bot heuristic : skip when User-Agent looks
  // like a known crawler — they generate noise without ever converting.
  if (!isOwner) {
    const h = await headers()
    const { ipHash, userAgent } = extractRequestInfo(h)
    const ua = userAgent?.toLowerCase() ?? ''
    const isBot =
      ua.includes('bot') ||
      ua.includes('crawler') ||
      ua.includes('spider') ||
      ua.includes('headless') ||
      ua.includes('preview') // Slackbot, WhatsApp, Twitter preview fetchers
    if (!isBot) {
      const referer = h.get('referer')
      const ownHost = new URL(baseUrl()).hostname
      const source = classifyViewSource(referer, ownHost)
      const listingId = listing.id
      after(() =>
        recordListingView({
          listingId,
          viewerHash: ipHash,
          sessionHash: userId,
          source,
          viewerUserId: userId,
        }),
      )
    }
  }

  // Schema.org JSON-LD. We MUST use `safeJsonLd` because JSON.stringify
  // does NOT escape `<` — a malicious owner title containing `</script>`
  // would break out of the script tag (stored XSS). See lib/seo/safe-json-ld.ts.
  // No `nonce` — JSON-LD is non-executable data; CSP script-src doesn't apply.
  const base = baseUrl()
  const realEstateLd = buildRealEstateListingLd(listing, base)
  const breadcrumbLd = buildBreadcrumbListLd(listing, base)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(realEstateLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />

      {/* Aligned with the landing sections + global Footer
          (max-w-[1280px] px-6 lg:px-10) so the content edge stays
          stable when a visitor scrolls between the listing detail,
          home, and footer. */}
      <div className="mx-auto max-w-[1280px] px-6 py-6 lg:px-10 sm:py-8">
        {/* Breadcrumb — every step except the current page is a link
            so visitors can climb back up to the city or quartier
            landing pages (E-T11 internal linking). */}
        <nav className="mb-4 text-xs text-muted-foreground" aria-label={t('detail.breadcrumb.aria')}>
          <Link href="/annonces" className="transition hover:text-foreground">
            {t('detail.breadcrumb.listings')}
          </Link>
          <span className="mx-1.5">›</span>
          <Link
            href={`/villes/${listing.city.slug}`}
            className="transition hover:text-foreground"
          >
            {listing.city.nameFr}
          </Link>
          <span className="mx-1.5">›</span>
          <Link
            href={`/villes/${listing.city.slug}/quartiers/${listing.neighborhood.slug}`}
            className="text-foreground transition hover:opacity-80"
          >
            {listing.neighborhood.nameFr}
          </Link>
        </nav>

        {/* Title block — above the gallery (Airbnb-style) */}
        <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                {listing.title}
              </h1>
              {listing.verifiedAt && <VerifiedListingBadge />}
            </div>
            <p className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              {reviewStats.average !== null && (
                <>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <StarRating value={Math.round(reviewStats.average)} size={14} />
                    {reviewStats.average.toFixed(1)}
                  </span>
                  <span className="text-foreground">·</span>
                  <span>
                    {t(reviewStats.count <= 1 ? 'reviews.countOne' : 'reviews.countOther', {
                      count: reviewStats.count,
                    })}
                  </span>
                  <span className="text-foreground">·</span>
                </>
              )}
              <span className="font-medium text-foreground">{typeLabel}</span>
              <span>·</span>
              <span>{listing.neighborhood.nameFr}, {listing.city.nameFr}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ShareButton title={listing.title} />
            <FavoriteButton
              listingId={listing.id}
              initialFavorited={initialFavorited}
              variant="inline"
            />
          </div>
        </header>

        {/* Photo gallery (Airbnb-style asymmetric grid) +
            T-059 click-to-play walkthrough video overlay. */}
        <PhotoGallery
          photos={listing.photos}
          altFallback={altFallback}
          video={listing.video}
        />

        {/* Two-column content */}
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-12">
          {/* Main content */}
          <article className="flex flex-col gap-10">
            {/* Owner card + features (Airbnb-style "Hosted by" + feature highlights) */}
            <section className="flex flex-col gap-6 border-b border-border pb-8">
              <header className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {t('detail.owner.hostedBy', { name: listing.owner.displayName })}
                  </h2>
                  {listing.owner.verifiedAt && <VerifiedOwnerBadge />}
                </div>
              </header>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                {listing.surfaceM2 && (
                  <FeatureItem
                    icon={<SurfaceIcon />}
                    label={t('detail.feature.surface')}
                    value={`${listing.surfaceM2} m²`}
                  />
                )}
                {typeof listing.bedrooms === 'number' && (
                  <FeatureItem
                    icon={<BedIcon />}
                    label={t('detail.feature.bedrooms')}
                    value={String(listing.bedrooms)}
                  />
                )}
                {typeof listing.bathrooms === 'number' && (
                  <FeatureItem
                    icon={<BathIcon />}
                    label={t('detail.feature.bathrooms')}
                    value={String(listing.bathrooms)}
                  />
                )}
                <FeatureItem
                  icon={<FurnishedIcon />}
                  label={t('detail.feature.furnished')}
                  value={
                    listing.furnished ? t('detail.feature.yes') : t('detail.feature.no')
                  }
                />
              </dl>
            </section>

            {/* Amenities — catalog items in catalog order, then owner customs */}
            {(listing.amenities.length > 0 || listing.customAmenities.length > 0) && (
              <section className="flex flex-col gap-4 border-b border-border pb-8">
                <h2 className="text-lg font-semibold text-foreground">
                  {t('detail.section.amenities')}
                </h2>
                <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  {AMENITY_CATALOG.filter((a) => listing.amenities.includes(a.value)).map((a) => (
                    <li key={a.value} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                        <AmenityIcon amenity={a.value} />
                      </span>
                      <span>{t(a.labelKey)}</span>
                    </li>
                  ))}
                  {listing.customAmenities.map((label, i) => (
                    <li key={`custom-${i}`} className="flex items-center gap-3 text-sm text-foreground">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 2l2.39 5.96L20 9l-4.5 4.39L17 20l-5-3-5 3 1.5-6.61L4 9l5.61-1.04z" />
                        </svg>
                      </span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Description */}
            <section className="flex flex-col gap-3 border-b border-border pb-8">
              <h2 className="text-lg font-semibold text-foreground">
                {t('detail.section.description')}
              </h2>
              {/*
                Description is user-supplied. React's JSX text interpolation
                auto-escapes it — `<script>` injected here renders as plain
                text. `whitespace-pre-wrap` preserves line breaks without
                allowing HTML.
              */}
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {listing.description}
              </p>
            </section>

            {/* Location — interactive Leaflet map (privacy: 200m circle, not exact pin) */}
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-foreground">
                {t('detail.section.location')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {listing.neighborhood.nameFr}, {listing.city.nameFr}
              </p>
              <SectionErrorBoundary section="listing-detail.map">
                <ListingMapClient
                  lat={parseFloat(listing.lat)}
                  lng={parseFloat(listing.lng)}
                  ariaLabel={t('detail.location.mapAria', {
                    neighborhood: listing.neighborhood.nameFr,
                    city: listing.city.nameFr,
                  })}
                />
              </SectionErrorBoundary>
              <p className="text-xs text-muted-foreground">
                {t('detail.location.privacyHint')}
              </p>
            </section>

            {/* Reviews — list + (optionally) a submission form */}
            <section className="flex flex-col gap-5">
              <header className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-foreground">
                  {t('reviews.section.title')}
                </h2>
                {reviewStats.average !== null ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <StarRating value={Math.round(reviewStats.average)} size={14} />
                    <span className="font-medium text-foreground">
                      {reviewStats.average.toFixed(1)}
                    </span>
                    <span>·</span>
                    <span>
                      {t(reviewStats.count <= 1 ? 'reviews.countOne' : 'reviews.countOther', {
                        count: reviewStats.count,
                      })}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('reviews.section.empty')}
                  </p>
                )}
              </header>

              <ReviewList
                reviews={reviewsPage.items}
                t={t}
                canRespond={isOwner}
                currentUserId={userId}
                ownerName={listing.owner.displayName}
                ownerImage={listing.owner.image}
                reactions={reactionsMap}
              />

              {/*
                Submission form (or contextual status). When the user
                already reviewed, we render NOTHING — their own review
                appears in the list above with inline edit/delete.
              */}
              {canSubmitReview ? (
                <ReviewForm listingId={listing.id} />
              ) : isOwner ? (
                <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  {t('reviews.form.gateOwner')}
                </p>
              ) : !userAlreadyReviewed ? (
                <p className="rounded-md border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  {t('reviews.form.gateSignedOut')}
                </p>
              ) : null}
            </section>
          </article>

          {/* Sticky price + contact aside */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
              <div>
                <p className="font-mono text-3xl font-semibold text-foreground">
                  {formatAriary(listing.priceMonthlyMGA)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('detail.price.perMonth')}
                </p>
              </div>

              {/* E-T28 T-RES-05 — primary CTA "Je suis intéressé(e)".
                  Opens a Base UI Dialog form that creates a LeadRequest.
                  Below it, the legacy ContactButtons stays as the
                  "general question" path (concierge WhatsApp / phone). */}
              <SectionErrorBoundary section="listing-detail.lead-cta">
                <InterestLeadCta
                  listingId={listing.id}
                  listingTitle={listing.title}
                  smsConsoleMock={
                    env.SMS_PROVIDER === 'console' ||
                    (env.SMS_PROVIDER === undefined &&
                      env.NODE_ENV !== 'production')
                  }
                />
              </SectionErrorBoundary>

              <ContactButtons
                listingId={listing.id}
                hasPhone={listing.owner.hasPhone}
              />

              <div className="-mx-6 border-t border-border" />

              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{t('detail.report.cta')}</span>
                <ReportButton listingId={listing.id} />
              </div>

              {/* LEG-14 — clarify AryTrano's legal position. We are
                  an introducer between propriétaires and tenants,
                  not a party to the bail. The disclaimer also points
                  to the dispute flow (E-T27.3) for litigation. */}
              <p className="-mx-6 border-t border-border px-6 pt-4 text-[11.5px] leading-[1.5] text-foreground/55">
                {t('detail.disclaimer.intermediary')}{' '}
                <Link href="/legal/terms" className="underline-offset-2 hover:underline">
                  {t('detail.disclaimer.terms')}
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>

        {/* Related listings */}
        <RelatedListingsSection
          excludeId={listing.id}
          neighborhoodId={listing.neighborhood.id}
          cityId={listing.city.id}
          t={t}
          authenticated={Boolean(session?.user)}
        />
      </div>

      {/* EDT-10 — sticky CTA on mobile. Delegates to the aside InterestLeadCta
          dialog so we don't duplicate the dialog state. */}
      <MobileStickyContactBar
        priceLabel={formatAriary(listing.priceMonthlyMGA)}
        ctaLabel={t('lead.cta.interested')}
      />
    </>
  )
}

async function RelatedListingsSection({
  excludeId,
  neighborhoodId,
  cityId,
  t,
  authenticated,
}: {
  excludeId: string
  neighborhoodId: string
  cityId: string
  t: ReturnType<typeof getT>
  authenticated: boolean
}) {
  const related = await listRelatedListings({ excludeId, neighborhoodId, cityId, take: 4 })
  if (related.length === 0) return null
  return (
    <section className="mt-16 border-t border-border pt-10">
      <header className="mb-6 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          {t('detail.related.title')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('detail.related.lead')}</p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((l) => (
          <PublicListingCard key={l.id} listing={l} t={t} authenticated={authenticated} />
        ))}
      </ul>
    </section>
  )
}

function FeatureItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

function SurfaceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}

function BedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 17v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5" />
      <path d="M2 17h20v3H2z" />
      <circle cx="7" cy="11" r="2" />
    </svg>
  )
}

function BathIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
      <path d="M5 12V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      <path d="M5 20l-1 2M19 20l1 2" />
    </svg>
  )
}

function FurnishedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M2 14h20v6H2z" />
      <path d="M6 14v-3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
    </svg>
  )
}
