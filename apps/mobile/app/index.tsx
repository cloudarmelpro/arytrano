import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import type { ListingType } from '@arytrano/shared'
import { listListings } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { ListingCard } from '@/components/listings/ListingCard'
import { useT } from '@/lib/i18n/use-locale'
import { readOnboarded } from '@/lib/i18n/store'
import type { MessageKey } from '@/lib/i18n/messages'

const VALID_TYPES: readonly ListingType[] = [
  'ROOM',
  'STUDIO',
  'APARTMENT',
  'HOUSE',
] as const

const TYPE_KEY: Record<ListingType, MessageKey> = {
  ROOM: 'listing.detail.type.ROOM',
  STUDIO: 'listing.detail.type.STUDIO',
  APARTMENT: 'listing.detail.type.APARTMENT',
  HOUSE: 'listing.detail.type.HOUSE',
}

type HomeSearchParams = {
  type?: string
  city?: string
  neighborhood?: string
  priceMin?: string
  priceMax?: string
  amenities?: string
  q?: string
}

/**
 * Parse the URL query params Expo Router hands us into a clean filter
 * object. Strings only — every value is potentially a single string or
 * an array (when the same key appears twice), so we take the first.
 * Invalid `type`/`priceMin`/`priceMax` silently drop rather than 400ing
 * — the user shouldn't see an error because someone shared a
 * malformed link.
 */
function parseFilters(raw: HomeSearchParams) {
  const first = (v: string | string[] | undefined): string | undefined =>
    Array.isArray(v) ? v[0] : v

  const filters: Parameters<typeof listListings>[0] = {}
  const type = first(raw.type)
  if (type && (VALID_TYPES as readonly string[]).includes(type)) {
    filters.type = type as ListingType
  }
  const city = first(raw.city)
  if (city) filters.city = city
  const neighborhood = first(raw.neighborhood)
  if (neighborhood) filters.neighborhood = neighborhood
  const priceMin = first(raw.priceMin)
  if (priceMin && /^\d+$/.test(priceMin)) filters.priceMin = Number(priceMin)
  const priceMax = first(raw.priceMax)
  if (priceMax && /^\d+$/.test(priceMax)) filters.priceMax = Number(priceMax)
  const amenities = first(raw.amenities)
  if (amenities) {
    filters.amenities = amenities.split(',').filter(Boolean).slice(0, 10)
  }
  const q = first(raw.q)
  if (q && q.length >= 2) filters.q = q
  return filters
}

/**
 * Home — the primary discovery surface.
 *
 * - Cursor-based infinite scroll : fetches the next page when the
 *   FlatList nears its end.
 * - Pull-to-refresh wired via `RefreshControl`.
 * - Filters via URL query params : `?city=…&type=…&priceMax=…`.
 *   When any are set, an "active filters" chip row appears at the
 *   top with a clear button. Saved-searches "Lancer" calls
 *   `router.push({ pathname: '/', params: ... })` to land here.
 */
export default function Home() {
  const { signedIn } = useAuth()
  const t = useT()
  const [refreshing, setRefreshing] = useState(false)
  const rawParams = useLocalSearchParams<HomeSearchParams>()

  // useMemo to keep the filter object identity stable across renders
  // — TanStack Query's queryKey is JSON-stringified, but using a
  // stable reference also avoids spurious infinite-query resets.
  const filters = useMemo(() => parseFilters(rawParams), [rawParams])
  const hasFilters = Object.keys(filters).length > 0

  // Onboarding gate — first-launch users get the carousel. Bypass
  // when arriving from /saved-searches "Lancer" with filters (the
  // user has clearly used the app before).
  useEffect(() => {
    if (hasFilters) return
    let cancelled = false
    void readOnboarded().then((seen) => {
      if (!cancelled && !seen) {
        router.replace('/onboarding')
      }
    })
    return () => {
      cancelled = true
    }
  }, [hasFilters])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    // The filter values are part of the key so switching filters
    // re-runs the query from page 1 with a fresh cursor.
    queryKey: ['listings', filters],
    queryFn: ({ pageParam }) =>
      listListings(pageParam ? { ...filters, cursor: pageParam } : filters),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
  })

  const items = data?.pages.flatMap((p) => p.items) ?? []

  async function onRefresh() {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  function clearFilters() {
    // `router.replace('/')` with no params drops the entire query
    // string, which the screen's `useLocalSearchParams` reads as an
    // empty object — that re-keys the infinite query and refetches.
    router.replace('/')
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Top bar — brand + auth chip */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="font-serif text-2xl text-foreground">
          {t('common.appName')}
        </Text>
        {signedIn ? (
          <Pressable
            onPress={() => router.push('/profile')}
            className="rounded-full bg-muted px-3 py-1.5"
            accessibilityLabel={t('common.profile')}
          >
            <Text className="text-sm font-medium text-foreground">
              {t('common.profile')}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/sign-in')}
            className="rounded-full bg-primary px-3 py-1.5"
            accessibilityLabel={t('common.signIn')}
          >
            <Text className="text-sm font-medium text-primary-foreground">
              {t('common.signIn')}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Active filters chip row — only renders when at least one
          filter is set. Horizontal scroll so long filter values
          don't push the clear button off-screen. */}
      {hasFilters && (
        <View className="border-b border-border bg-muted/30 px-4 py-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-[11.5px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('home.filters.label')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row gap-1.5"
              className="flex-1"
            >
              {filters.type && (
                <FilterChip label={t(TYPE_KEY[filters.type])} />
              )}
              {filters.neighborhood && (
                <FilterChip label={filters.neighborhood} />
              )}
              {!filters.neighborhood && filters.city && (
                <FilterChip label={filters.city} />
              )}
              {filters.priceMax !== undefined && (
                <FilterChip
                  label={t('home.filters.priceMax', {
                    amount: filters.priceMax.toLocaleString('fr-FR'),
                  })}
                />
              )}
              {filters.q && <FilterChip label={`« ${filters.q} »`} />}
            </ScrollView>
            <Pressable
              onPress={clearFilters}
              accessibilityLabel={t('home.filters.clear')}
              className="rounded-full bg-background px-2.5 py-1 active:bg-muted"
            >
              <Text className="text-[12px] font-semibold text-red-700">
                {t('home.filters.clear')}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

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
            {t('home.error.lead')}
          </Text>
          <Text className="mt-3 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-foreground">
            {hasFilters
              ? t('home.empty.filtered.title')
              : t('home.empty.title')}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {hasFilters
              ? t('home.empty.filtered.lead')
              : t('home.empty.lead')}
          </Text>
          {hasFilters && (
            <View className="mt-5">
              <Pressable
                onPress={clearFilters}
                accessibilityLabel={t('home.filters.clear')}
                className="rounded-md border border-border bg-background px-4 py-2 active:bg-muted"
              >
                <Text className="text-sm font-semibold text-foreground">
                  {t('home.filters.clear')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerClassName="px-4 pb-8 gap-3 pt-3"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage()
            }
          }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
}

function FilterChip({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-primary/10 px-2.5 py-1">
      <Text className="text-[12px] font-medium text-primary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}
