import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
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
import { listListings } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { ListingCard } from '@/components/listings/ListingCard'

/**
 * Home — the primary discovery surface.
 *
 * - Cursor-based infinite scroll : fetches the next page when the
 *   FlatList nears its end. The web's `/api/v1/listings` endpoint
 *   already returns `meta.nextCursor` — no offset gymnastics needed.
 * - Pull-to-refresh wired via `RefreshControl` so a user can force a
 *   fresh fetch when a listing-of-interest finally gets posted.
 * - Header has the brand + a Sign in / Profile pill depending on
 *   auth state.
 */
export default function Home() {
  const { signedIn } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ['listings'],
    queryFn: ({ pageParam }) =>
      listListings(pageParam ? { cursor: pageParam } : {}),
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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Top bar — brand + auth chip */}
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <Text className="font-serif text-2xl text-foreground">AryTrano</Text>
        {signedIn ? (
          <Pressable
            onPress={() => router.push('/profile')}
            className="rounded-full bg-muted px-3 py-1.5"
            accessibilityLabel="Mon profil"
          >
            <Text className="text-sm font-medium text-foreground">Profil</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/sign-in')}
            className="rounded-full bg-primary px-3 py-1.5"
            accessibilityLabel="Se connecter"
          >
            <Text className="text-sm font-medium text-primary-foreground">
              Se connecter
            </Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-red-900">
            Connexion impossible
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Vérifie ta connexion et tire vers le bas pour réessayer.
          </Text>
          <Text className="mt-3 text-xs text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base font-semibold text-foreground">
            Aucune annonce pour le moment
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            On publie une dizaine d&apos;annonces par mois. Reviens bientôt.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => <ListingCard listing={item} />}
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
