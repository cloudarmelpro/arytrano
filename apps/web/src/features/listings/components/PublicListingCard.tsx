import Image from 'next/image'
import Link from 'next/link'
import { FavoriteButton, FavoriteSignInPrompt } from '@/features/favorites'
import { formatAriary } from '@/lib/format/currency'
import type { Translator } from '@/lib/i18n/translate'
import type { PublicListingCard as PublicListingCardData } from '../queries/list-public-listings'
import { VerifiedListingBadge } from './VerifiedListingBadge'

/**
 * Server-rendered card for the public /annonces listing grid. Uses
 * `next/image` (mandatory for 3G Madagascar — see SEO checklist).
 *
 * Design refresh 2026-06-15 :
 *  - Tighter typography hierarchy (title → meta → price → caution)
 *  - ★ rating row when the listing has at least one PUBLISHED review
 *  - "Nouveau" pill for listings published in the last 7 days
 *  - Smoother hover (ring + subtle lift), focus ring respects WCAG
 *  - Price column-aligned with a label so the eye lands on Ar/mois
 *
 * `t` is passed in by the parent server page so the card can render
 * in any locale without becoming a client component (which would
 * ship ~3kb of JS per card × 20 cards).
 *
 * `authenticated` controls whether the heart is the live
 * `FavoriteButton` client island or a static `<a>` redirect to
 * sign-in. Anonymous visitors skip the sonner + useRouter payload
 * entirely (~12 KB gz per page).
 *
 * Markup uses the "stretched anchor" pattern: the card itself is an
 * `<article>`, only the title is an `<a>`, and a `before:absolute`
 * pseudo extends its hit area to the whole card. This keeps the
 * favorite button outside the anchor's DOM tree — required by HTML
 * spec (no interactive-in-interactive) and by WCAG 4.1.2.
 */
const NEW_LISTING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

export function PublicListingCard({
  listing,
  t,
  priority = false,
  authenticated = false,
  initialFavorited = false,
}: {
  listing: PublicListingCardData
  /** Translator from the parent server page. Pass `getT(locale)`. */
  t: Translator
  /** Set on the first card of the first page — it's the LCP candidate on /annonces. */
  priority?: boolean
  /** Whether a session exists. Drives the static-vs-interactive heart. */
  authenticated?: boolean
  /** Whether the current viewer has already favorited this listing. */
  initialFavorited?: boolean
}) {
  const href = `/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
  const typeLabel = t(`listing.type.${listing.type}` as const)
  const altFallback = `${typeLabel} à ${listing.neighborhood.nameFr}, ${listing.city.nameFr}`
  const alt = listing.photo?.altFr || altFallback

  const isNew =
    listing.publishedAt !== null &&
    Date.now() - new Date(listing.publishedAt).getTime() < NEW_LISTING_WINDOW_MS

  const hasRating =
    listing.avgRating !== null && listing.avgRating !== undefined && listing.reviewCount > 0

  return (
    <li className="contents">
      <article className="group relative flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60 transition duration-300">
          {/* Heart sits ABOVE the stretched anchor (z-10 on the heart
             elements). It's outside the <a> in DOM order, so the link
             stays semantically and structurally valid. */}
          {authenticated ? (
            <FavoriteButton listingId={listing.id} initialFavorited={initialFavorited} />
          ) : (
            <FavoriteSignInPrompt returnTo={href} ariaLabel={t('favorites.add')} />
          )}
          {listing.photo ? (
            <Image
              src={listing.photo.url}
              alt={alt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              placeholder={listing.photo.blurhash ? 'blur' : 'empty'}
              blurDataURL={listing.photo.blurhash ?? undefined}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              {t('card.noPhoto')}
            </div>
          )}

          {/* Top-left badge stack — order matters : "Nouveau" first
              so it reads as a recency cue, "Vérifié" below as a
              trust cue. Limited to 2 badges to keep the photo
              breathing. */}
          {(isNew || listing.verifiedAt) && (
            <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
              {isNew ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.08em] text-primary shadow-sm ring-1 ring-primary/20 backdrop-blur-sm">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {t('card.new')}
                </span>
              ) : null}
              {listing.verifiedAt ? (
                <VerifiedListingBadge variant="overlay" />
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-3.5 flex flex-col gap-1.5 px-0.5">
          {/* Title row — also carries the stretched anchor */}
          <h3 className="line-clamp-1 text-[15.5px] font-bold leading-tight tracking-[-0.005em] text-foreground transition group-hover:text-primary">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2"
            >
              {listing.title}
            </Link>
          </h3>

          {/* Meta row : type · neighborhood · rating */}
          <div className="flex items-center gap-1.5 text-[12px] text-foreground/65">
            <span className="font-medium">{typeLabel}</span>
            <span aria-hidden className="text-foreground/30">·</span>
            <span className="line-clamp-1">{listing.neighborhood.nameFr}</span>
            {hasRating ? (
              <>
                <span aria-hidden className="text-foreground/30">·</span>
                <span
                  aria-label={t('card.rating.aria', {
                    rating: listing.avgRating!.toFixed(1),
                    count: listing.reviewCount,
                  })}
                  className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-foreground"
                >
                  <span aria-hidden className="text-amber-500">★</span>
                  {listing.avgRating!.toFixed(1)}
                  <span className="font-normal text-foreground/55">
                    ({listing.reviewCount})
                  </span>
                </span>
              </>
            ) : null}
          </div>

          {/* Price row */}
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-mono text-[16px] font-bold tabular-nums tracking-[-0.01em] text-foreground">
              {formatAriary(listing.priceMonthlyMGA)}
            </span>
            <span className="text-[11.5px] font-medium text-foreground/55">
              {t('card.perMonth')}
            </span>
          </p>

          {/* Caution disclosure — calmly muted so it doesn't compete
              with the rent. 0.5 gets its own copy ("½ mois") instead
              of "0.5 mois". */}
          {listing.cautionMonths > 0 ? (
            <p className="text-[11.5px] text-foreground/55">
              {listing.cautionMonths === 0.5
                ? t('card.caution.half', {
                    amount: formatAriary(
                      Math.round(listing.priceMonthlyMGA * 0.5),
                    ),
                  })
                : t('card.caution', {
                    count: listing.cautionMonths,
                    amount: formatAriary(
                      Math.round(
                        listing.priceMonthlyMGA * listing.cautionMonths,
                      ),
                    ),
                  })}
            </p>
          ) : null}
        </div>
      </article>
    </li>
  )
}
