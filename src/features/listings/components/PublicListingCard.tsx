import Image from 'next/image'
import Link from 'next/link'
import { FavoriteButton } from '@/features/favorites'
import { formatAriary } from '@/lib/format/currency'
import type { Translator } from '@/lib/i18n/translate'
import type { PublicListingCard as PublicListingCardData } from '../queries/list-public-listings'

/**
 * Server-rendered card for the public /annonces listing grid. Uses
 * `next/image` (mandatory for 3G Madagascar — see SEO checklist).
 *
 * `t` is passed in by the parent server page so the card can render in any
 * locale without becoming a client component (which would ship ~3kb of JS
 * per card × 20 cards = wasted bandwidth for a static grid).
 */
export function PublicListingCard({
  listing,
  t,
  priority = false,
  initialFavorited = false,
}: {
  listing: PublicListingCardData
  /** Translator from the parent server page. Pass `getT(locale)`. */
  t: Translator
  /** Set on the first card of the first page — it's the LCP candidate on /annonces. */
  priority?: boolean
  /** Whether the current viewer has already favorited this listing. */
  initialFavorited?: boolean
}) {
  const href = `/${listing.city.slug}/${listing.neighborhood.slug}/${listing.slug}`
  const typeLabel = t(`listing.type.${listing.type}` as const)
  const altFallback = `${typeLabel} à ${listing.neighborhood.nameFr}, ${listing.city.nameFr}`
  const alt = listing.photo?.altFr || altFallback

  return (
    <li className="group flex flex-col">
      <Link
        href={href}
        className="flex h-full flex-col gap-3 outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          <FavoriteButton listingId={listing.id} initialFavorited={initialFavorited} />
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
        </div>
        <div className="flex flex-col gap-1 px-0.5">
          <p className="text-xs text-muted-foreground">
            {typeLabel}
            <span className="mx-1">·</span>
            {listing.neighborhood.nameFr}
          </p>
          <h3 className="line-clamp-1 text-[15px] font-medium text-foreground transition group-hover:text-primary">
            {listing.title}
          </h3>
          <p className="mt-1 text-[15px]">
            <span className="font-mono font-semibold text-foreground">
              {formatAriary(listing.priceMonthlyMGA)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">
              {t('card.perMonth')}
            </span>
          </p>
        </div>
      </Link>
    </li>
  )
}
