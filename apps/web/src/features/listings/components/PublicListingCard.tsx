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
 * `t` is passed in by the parent server page so the card can render in any
 * locale without becoming a client component (which would ship ~3kb of JS
 * per card × 20 cards = wasted bandwidth for a static grid).
 *
 * `authenticated` controls whether the heart is the live `FavoriteButton`
 * client island or a static `<a>` redirect to sign-in. Anonymous visitors
 * skip the sonner + useRouter payload entirely (~12 KB gz per page).
 *
 * Markup uses the "stretched anchor" pattern: the card itself is an
 * `<article>`, only the title is an `<a>`, and a `before:absolute` pseudo
 * extends its hit area to the whole card. This keeps the favorite button
 * (a real `<button>` or sign-in `<a>`) outside the anchor's DOM tree —
 * required by HTML spec (no interactive-in-interactive) and by WCAG 4.1.2.
 */
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

  return (
    <li className="contents">
      <article className="group relative flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
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
              className="object-cover transition duration-300 group-hover:scale-105"
              placeholder={listing.photo.blurhash ? 'blur' : 'empty'}
              blurDataURL={listing.photo.blurhash ?? undefined}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              {t('card.noPhoto')}
            </div>
          )}
          {/* Trust badge — bottom-left overlay so it doesn't clash with the
             heart at top-right or the LCP hero focus. Only renders when
             an admin has flagged the listing as verified (T-033). */}
          {listing.verifiedAt && (
            <div className="absolute bottom-3 left-3 z-10">
              <VerifiedListingBadge variant="overlay" />
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1 px-0.5">
          <p className="text-xs text-muted-foreground">
            {typeLabel}
            <span className="mx-1">·</span>
            {listing.neighborhood.nameFr}
          </p>
          <h3 className="line-clamp-1 text-[15px] font-medium text-foreground transition group-hover:text-primary">
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2"
            >
              {listing.title}
            </Link>
          </h3>
          <p className="mt-1 text-[15px]">
            <span className="font-mono font-semibold text-foreground">
              {formatAriary(listing.priceMonthlyMGA)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              {t('card.perMonth')}
            </span>
          </p>
          {/* E-T26 — caution disclosure, calmly muted so it doesn't
              compete with the rent number. Hidden when no caution.
              0.5 gets its own copy ("½ mois") instead of "0.5 mois". */}
          {listing.cautionMonths > 0 ? (
            <p className="mt-0.5 text-[11.5px] text-foreground/55">
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
