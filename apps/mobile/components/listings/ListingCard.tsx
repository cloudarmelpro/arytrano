import { Image, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { PublicListingCard } from '@arytrano/shared'
import { FavoriteButton } from './FavoriteButton'
import { useT } from '@/lib/i18n/use-locale'
import type { MessageKey } from '@/lib/i18n/messages'

function formatPrice(amount: number): string {
  // Manual thousand-grouping with regular space, NOT Intl.fr-FR which
  // uses U+202F that screen readers stumble on (audit feedback :
  // intl_frfr_separator memory).
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const TYPE_KEY: Record<PublicListingCard['type'], MessageKey> = {
  ROOM: 'listing.detail.type.ROOM',
  STUDIO: 'listing.detail.type.STUDIO',
  APARTMENT: 'listing.detail.type.APARTMENT',
  HOUSE: 'listing.detail.type.HOUSE',
}

/**
 * Compact card for the home grid. Tap navigates to `/listing/<id>`.
 *
 * Photo is `aspect-[4/3]` so the home grid looks uniform even when
 * the source photo is portrait; `resizeMode="cover"` crops to fit.
 *
 * The Favorite button overlays the top-right of the photo. It owns
 * its own state + auth check — anon taps bounce to `/sign-in`.
 */
export function ListingCard({
  listing,
  initialFavorited = false,
}: {
  listing: PublicListingCard
  /** Pre-loaded favorited state when known (e.g. from the Favorites
   *  screen which by definition has all-favorited items). */
  initialFavorited?: boolean
}) {
  const t = useT()
  const price = formatPrice(listing.priceMonthlyMGA)
  return (
    <View className="overflow-hidden rounded-2xl border border-border bg-background">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${listing.title}, ${t('units.ariaryPerMonth', { amount: price })}`}
        onPress={() => router.push(`/listing/${listing.id}`)}
        className="active:opacity-90"
      >
        <View className="aspect-[4/3] w-full bg-muted">
          {listing.photo ? (
            <Image
              source={{ uri: listing.photo.url }}
              accessibilityLabel={listing.photo.altFr ?? listing.title}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : null}
          {listing.verifiedAt ? (
            <View className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1">
              <Text className="text-[11px] font-semibold text-primary-foreground">
                {t('listing.detail.verified')}
              </Text>
            </View>
          ) : null}
        </View>
        <View className="flex flex-col gap-1 p-3">
          <Text
            numberOfLines={1}
            className="text-base font-semibold text-foreground"
          >
            {listing.title}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {t(TYPE_KEY[listing.type])} · {listing.neighborhood.nameFr},{' '}
            {listing.city.nameFr}
          </Text>
          <Text className="mt-1 text-base font-bold text-primary">
            <Text className="font-mono">{price}</Text>{' '}
            <Text className="text-xs font-normal text-muted-foreground">
              {t('units.perMonth')}
            </Text>
          </Text>
        </View>
      </Pressable>

      {/* Heart overlay — wrapped in its own absolute container so the
          Pressable tap doesn't bubble up to the card's onPress and
          accidentally navigate to detail when the user just wanted
          to favorite. */}
      <View className="absolute right-3 top-3">
        <FavoriteButton
          listingId={listing.id}
          initialFavorited={initialFavorited}
        />
      </View>
    </View>
  )
}
