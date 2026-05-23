import { Image, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { PublicListingCard } from '@arytrano/shared'

const TYPE_LABEL_FR: Record<PublicListingCard['type'], string> = {
  ROOM: 'Chambre',
  STUDIO: 'Studio',
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
}

function formatPrice(amount: number): string {
  // Manual thousand-grouping with regular space, NOT Intl.fr-FR which
  // uses U+202F that screen readers stumble on (audit feedback :
  // intl_frfr_separator memory).
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Compact card for the home grid. Tap navigates to `/listing/<id>`.
 *
 * Photo is `aspect-[4/3]` so the home grid looks uniform even when
 * the source photo is portrait; `resizeMode="cover"` crops to fit.
 */
export function ListingCard({ listing }: { listing: PublicListingCard }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatPrice(listing.priceMonthlyMGA)} ariary par mois`}
      onPress={() => router.push(`/listing/${listing.id}`)}
      className="overflow-hidden rounded-2xl border border-border bg-background active:opacity-90"
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
              Vérifié
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
          {TYPE_LABEL_FR[listing.type]} · {listing.neighborhood.nameFr},{' '}
          {listing.city.nameFr}
        </Text>
        <Text className="mt-1 text-base font-bold text-primary">
          <Text className="font-mono">{formatPrice(listing.priceMonthlyMGA)}</Text>{' '}
          <Text className="text-xs font-normal text-muted-foreground">
            Ar / mois
          </Text>
        </Text>
      </View>
    </Pressable>
  )
}
