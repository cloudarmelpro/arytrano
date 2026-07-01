import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { SavedSearchRow } from '@arytrano/shared'
import {
  ApiError,
  deleteSavedSearch,
  listSavedSearches,
  updateSavedSearchAlerts,
} from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { useT } from '@/lib/i18n/use-locale'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Saved-searches list — auth-required mobile twin of the web's
 * /dashboard/saved-searches page. Each row :
 *   - Tap the body → navigate to /annonces filtered by the saved filters
 *   - Toggle alerts on/off (PATCH)
 *   - Delete (DELETE, with confirm)
 *
 * The "Lancer" link can't open /annonces inside the mobile app —
 * we don't (yet) have a mobile annonces filtered view. For now it
 * pushes to Home with the filters as a deep-link query, and the
 * mobile Home picks them up. Until that wiring lands the action
 * is a no-op alert.
 */
export default function SavedSearches() {
  const { signedIn, isLoading: authLoading } = useAuth()
  const t = useT()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!authLoading && !signedIn) {
      router.replace('/sign-in')
    }
  }, [authLoading, signedIn])

  const { data, isLoading, error } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: listSavedSearches,
    enabled: signedIn,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, alertsOn }: { id: string; alertsOn: boolean }) =>
      updateSavedSearchAlerts(id, alertsOn),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
    onError: (err) => {
      Alert.alert(
        t('savedSearches.error'),
        err instanceof ApiError ? err.message : String(err),
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSavedSearch(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-searches'] })
    },
    onError: (err) => {
      Alert.alert(
        t('savedSearches.error'),
        err instanceof ApiError ? err.message : String(err),
      )
    },
  })

  if (authLoading || !signedIn) return null

  function confirmDelete(row: SavedSearchRow) {
    Alert.alert(
      t('savedSearches.delete.confirm.title'),
      t('savedSearches.delete.confirm.body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('savedSearches.delete'),
          style: 'destructive',
          onPress: () => deleteMutation.mutate(row.id),
        },
      ],
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-3 pb-2 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text className="text-base text-muted-foreground">
            {t('common.back')}
          </Text>
        </Pressable>
      </View>

      <View className="px-5 pb-3">
        <Text className="text-3xl text-foreground">
          {t('savedSearches.title')}
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator accessibilityLabel={t('common.loading')} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-red-900">
            {t('home.error.title')}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </Text>
        </View>
      ) : !data || data.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-foreground">
            {t('savedSearches.empty.title')}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {t('savedSearches.empty.lead')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(r) => r.id}
          contentContainerClassName="px-4 pb-8 gap-3"
          renderItem={({ item }) => (
            <SavedSearchRowCard
              row={item}
              busy={
                (toggleMutation.isPending &&
                  toggleMutation.variables?.id === item.id) ||
                (deleteMutation.isPending && deleteMutation.variables === item.id)
              }
              onToggleAlerts={() =>
                toggleMutation.mutate({ id: item.id, alertsOn: !item.alertsOn })
              }
              onDelete={() => confirmDelete(item)}
              onRun={() => {
                // Build the Home filter query from the saved search.
                // Cast through `Record<string, string>` because Expo
                // Router only accepts string params on this typed
                // signature — every value here serializes to a string.
                const params: Record<string, string> = {}
                if (item.filters.type) params.type = item.filters.type
                if (item.filters.city) params.city = item.filters.city
                if (item.filters.neighborhood)
                  params.neighborhood = item.filters.neighborhood
                if (item.filters.priceMin !== undefined)
                  params.priceMin = String(item.filters.priceMin)
                if (item.filters.priceMax !== undefined)
                  params.priceMax = String(item.filters.priceMax)
                if (item.filters.amenities && item.filters.amenities.length > 0)
                  params.amenities = item.filters.amenities.join(',')
                if (item.filters.q) params.q = item.filters.q
                router.push({ pathname: '/', params })
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  )
}

const TYPE_KEY: Record<NonNullable<SavedSearchRow['filters']['type']>, MessageKey> = {
  ROOM: 'listing.detail.type.ROOM',
  STUDIO: 'listing.detail.type.STUDIO',
  APARTMENT: 'listing.detail.type.APARTMENT',
  HOUSE: 'listing.detail.type.HOUSE',
}

/**
 * Single row card. Summarizes the filters as a free-text line ("Studio
 * · Andrainjato · ≤ 250 000 Ar") so the user can see what the search
 * actually scopes without opening it.
 */
function SavedSearchRowCard({
  row,
  busy,
  onToggleAlerts,
  onDelete,
  onRun,
}: {
  row: SavedSearchRow
  busy: boolean
  onToggleAlerts: () => void
  onDelete: () => void
  onRun: () => void
}) {
  const t = useT()

  function summary(): string {
    const parts: string[] = []
    if (row.filters.type) parts.push(t(TYPE_KEY[row.filters.type]))
    if (row.filters.neighborhood) parts.push(row.filters.neighborhood)
    else if (row.filters.city) parts.push(row.filters.city)
    if (row.filters.priceMax) {
      parts.push(`≤ ${row.filters.priceMax.toLocaleString('fr-FR')} Ar`)
    }
    if (row.filters.q) parts.push(`« ${row.filters.q} »`)
    return parts.length > 0 ? parts.join(' · ') : t('savedSearches.allListings')
  }

  return (
    <View className="rounded-2xl border border-border bg-background p-4">
      <Text className="text-base font-semibold text-foreground">{row.name}</Text>
      <Text className="mt-1 text-xs text-muted-foreground">{summary()}</Text>

      <View className="mt-3 flex-row flex-wrap items-center gap-2">
        <Pressable
          onPress={onRun}
          // A11y P1-4 : "Lancer" navigates to /annonces with the
          // saved filters applied — it's a link, not a button.
          accessibilityRole="link"
          accessibilityLabel={`${t('savedSearches.run')} — ${row.name}`}
          disabled={busy}
          className={`h-9 items-center justify-center rounded-md bg-primary px-3.5 active:opacity-90 ${
            busy ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-[13px] font-semibold text-primary-foreground">
            {t('savedSearches.run')}
          </Text>
        </Pressable>

        <Pressable
          onPress={onToggleAlerts}
          accessibilityRole="button"
          accessibilityState={{ checked: row.alertsOn }}
          accessibilityLabel={
            row.alertsOn ? t('savedSearches.alerts.on') : t('savedSearches.alerts.off')
          }
          disabled={busy}
          className={`h-9 items-center justify-center rounded-md border px-3.5 active:bg-muted ${
            row.alertsOn
              ? 'border-primary/40 bg-primary/10'
              : 'border-border bg-background'
          } ${busy ? 'opacity-50' : ''}`}
        >
          {/* A11y P1-3 : visible emoji + label, but the parent
              Pressable's accessibilityLabel is the source of truth
              for screen readers — wrap them in an inner View that
              hides from the a11y tree so TalkBack doesn't read
              "cloche, Alertes activées" verbatim. */}
          <View
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            className="flex-row items-center"
          >
            <Text
              className={`text-[12.5px] font-medium ${
                row.alertsOn ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {row.alertsOn
                ? `🔔 ${t('savedSearches.alerts.on')}`
                : `🔕 ${t('savedSearches.alerts.off')}`}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onDelete}
          accessibilityLabel={`${t('savedSearches.delete')} — ${row.name}`}
          disabled={busy}
          className={`h-9 items-center justify-center rounded-md px-3.5 active:bg-red-50 ${
            busy ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-[12.5px] font-medium text-red-700">
            {t('savedSearches.delete')}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
