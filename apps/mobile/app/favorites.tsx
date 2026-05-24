import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { listFavorites } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { ListingCard } from '@/components/listings/ListingCard'
import { useT } from '@/lib/i18n/use-locale'

/**
 * Favorites — bearer-required version of Home. Cursor pagination, the
 * usual TanStack Query loop, and `initialFavorited={true}` passed to
 * every card (by definition every item in this list IS favorited, so
 * the heart starts filled).
 */
export default function Favorites() {
  const { signedIn, isLoading: authLoading } = useAuth()
  const t = useT()
  const [refreshing, setRefreshing] = useState(false)

  // Auth gate — anon users get bounced to sign-in. Effect rather than
  // render-phase replace so we don't throw during the first render.
  useEffect(() => {
    if (!authLoading && !signedIn) {
      router.replace('/sign-in')
    }
  }, [authLoading, signedIn])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ['favorites'],
    queryFn: ({ pageParam }) => listFavorites(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.nextCursor ?? undefined,
    enabled: signedIn,
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

  if (authLoading || !signedIn) return null

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
        <Text className="font-serif text-3xl text-foreground">
          {t('favorites.title')}
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
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-foreground">
            {t('favorites.empty.title')}
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            {t('favorites.empty.lead')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => (
            <ListingCard listing={item} initialFavorited={true} />
          )}
          contentContainerClassName="px-4 pb-8 gap-3"
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
