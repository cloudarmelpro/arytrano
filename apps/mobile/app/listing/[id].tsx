import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import type {
  Amenity,
  ContactChannel,
  PublicListingDetail,
} from '@arytrano/shared'
import { ApiError, getListingById, revealContact } from '@/lib/api/client'
import { Button } from '@/components/ui/Button'

const TYPE_LABEL_FR: Record<PublicListingDetail['type'], string> = {
  ROOM: 'Chambre',
  STUDIO: 'Studio',
  APARTMENT: 'Appartement',
  HOUSE: 'Maison',
}

const AMENITY_LABEL_FR: Record<Amenity, string> = {
  WIFI: 'Wi-Fi',
  PARKING: 'Parking voiture',
  MOTO_PARKING: 'Parking moto',
  HOT_WATER: 'Eau chaude',
  WATER_TANK: 'Réservoir d’eau',
  GENERATOR: 'Groupe électrogène',
  AIR_CONDITIONING: 'Climatisation',
  KITCHEN_EQUIPPED: 'Cuisine équipée',
  WASHING_MACHINE: 'Machine à laver',
  GUARD: 'Gardien',
  SECURITY_GATE: 'Portail sécurisé',
  TERRACE: 'Terrasse',
  BALCONY: 'Balcon',
  GARDEN: 'Jardin',
  FURNISHED_KITCHEN: 'Cuisine meublée',
  PUBLIC_TRANSPORT: 'Transports en commun',
}

function formatPrice(amount: number): string {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function ListingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingById(id),
    enabled: Boolean(id),
  })

  const contactMutation = useMutation({
    mutationFn: (channel: ContactChannel) =>
      revealContact(id, { channel }),
    onSuccess: (res) => {
      // Open the appropriate native handler. `Linking.openURL` returns
      // a promise that rejects when no app can handle the scheme, but
      // both `whatsapp:` and `tel:` are universally supported on iOS
      // + Android so the catch is purely defensive.
      const phone = res.phoneE164
      const url =
        res.channel === 'WHATSAPP'
          ? `whatsapp://send?phone=${phone}`
          : `tel:${phone}`
      Linking.openURL(url).catch(() => {
        Alert.alert(
          'Impossible d’ouvrir',
          res.channel === 'WHATSAPP'
            ? 'WhatsApp n’est pas installé sur cet appareil.'
            : 'Impossible d’ouvrir l’app téléphone.',
        )
      })
    },
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : 'Impossible de récupérer le contact.'
      Alert.alert('Erreur', message)
    },
  })

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    )
  }
  if (error || !data) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-base font-semibold text-red-900">
          Annonce introuvable
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          Le lien est peut-être expiré ou l’annonce a été retirée.
        </Text>
        <View className="mt-6">
          <Button
            title="Retour"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </SafeAreaView>
    )
  }

  const screenWidth = Dimensions.get('window').width

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="pb-32">
        {/* Top bar — back button */}
        <View className="flex-row items-center justify-between px-3 pb-2 pt-1">
          <Pressable
            onPress={() => router.back()}
            className="p-2"
            accessibilityLabel="Retour"
          >
            <Text className="text-base text-muted-foreground">← Retour</Text>
          </Pressable>
        </View>

        {/* Photo gallery — horizontal pager via FlatList */}
        <View className="bg-muted">
          {data.photos.length > 0 ? (
            <FlatList
              data={data.photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(p) => p.id}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item.url }}
                  accessibilityLabel={item.altFr ?? data.title}
                  style={{ width: screenWidth, height: screenWidth * 0.75 }}
                  resizeMode="cover"
                />
              )}
            />
          ) : (
            <View
              style={{ width: screenWidth, height: screenWidth * 0.75 }}
              className="items-center justify-center bg-muted"
            >
              <Text className="text-sm text-muted-foreground">Aucune photo</Text>
            </View>
          )}
          {data.verifiedAt ? (
            <View className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1.5">
              <Text className="text-xs font-semibold text-primary-foreground">
                ✓ Annonce vérifiée
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title block */}
        <View className="px-5 pt-5">
          <Text className="font-serif text-3xl leading-tight text-foreground">
            {data.title}
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            {TYPE_LABEL_FR[data.type]} ·{' '}
            <Text className="font-medium text-foreground">
              {data.neighborhood.nameFr}
            </Text>
            , {data.city.nameFr}
          </Text>
          <Text className="mt-3 text-2xl font-bold text-primary">
            <Text className="font-mono">{formatPrice(data.priceMonthlyMGA)}</Text>{' '}
            <Text className="text-sm font-normal text-muted-foreground">
              Ar / mois
            </Text>
          </Text>
        </View>

        {/* Key stats strip */}
        <View className="mx-5 mt-6 flex-row flex-wrap gap-x-6 gap-y-3 rounded-2xl border border-border bg-muted/40 px-4 py-3.5">
          {data.surfaceM2 !== null && (
            <StatPill label="Surface" value={`${data.surfaceM2} m²`} />
          )}
          {data.bedrooms !== null && (
            <StatPill label="Chambres" value={String(data.bedrooms)} />
          )}
          {data.bathrooms !== null && (
            <StatPill label="Salles de bain" value={String(data.bathrooms)} />
          )}
          <StatPill label="Meublé" value={data.furnished ? 'Oui' : 'Non'} />
        </View>

        {/* Description */}
        <View className="mt-7 px-5">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </Text>
          <Text className="text-base leading-relaxed text-foreground/80">
            {data.description}
          </Text>
        </View>

        {/* Amenities */}
        {data.amenities.length > 0 && (
          <View className="mt-7 px-5">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Équipements
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {data.amenities.map((a) => (
                <View
                  key={a}
                  className="rounded-full bg-muted px-3 py-1.5"
                >
                  <Text className="text-sm text-foreground">
                    {AMENITY_LABEL_FR[a]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Owner block */}
        <View className="mt-7 mx-5 flex-row items-center gap-3 rounded-2xl border border-border bg-background p-4">
          {data.owner.image ? (
            <Image
              source={{ uri: data.owner.image }}
              accessibilityLabel="Photo propriétaire"
              className="h-12 w-12 rounded-full"
            />
          ) : (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Text className="text-base font-semibold text-muted-foreground">
                {data.owner.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-base font-semibold text-foreground">
              {data.owner.displayName}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {data.owner.verifiedAt
                ? 'Identité vérifiée'
                : 'Propriétaire'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky contact CTAs — bottom bar */}
      {data.owner.hasPhone && (
        <View className="absolute inset-x-0 bottom-0 border-t border-border bg-background px-5 pb-6 pt-3">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title="WhatsApp"
                loading={contactMutation.isPending && contactMutation.variables === 'WHATSAPP'}
                onPress={() => contactMutation.mutate('WHATSAPP')}
              />
            </View>
            <View className="flex-1">
              <Button
                title="Appeler"
                variant="outline"
                loading={contactMutation.isPending && contactMutation.variables === 'PHONE'}
                onPress={() => contactMutation.mutate('PHONE')}
              />
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Text>
      <Text className="mt-0.5 font-mono text-sm font-bold text-foreground">
        {value}
      </Text>
    </View>
  )
}
