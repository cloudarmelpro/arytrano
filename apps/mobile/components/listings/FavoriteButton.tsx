import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Pressable, Text } from 'react-native'
import { router } from 'expo-router'
import { ApiError, toggleFavorite } from '@/lib/api/client'
import { useAuth } from '@/lib/auth/use-auth'
import { useT } from '@/lib/i18n/use-locale'

/**
 * Heart button that toggles a listing in/out of the bearer user's
 * favorites. Anon callers get bounced to `/sign-in` on tap — the API
 * would 401 anyway.
 *
 * Optimistic update : flip the local state immediately, roll back if
 * the server call fails. Avoids the perceived lag on a slow 3G
 * connection.
 *
 * The component owns its own local `favorited` state instead of a
 * cache-driven one because:
 *   - The Home listing query doesn't currently include the
 *     `favorited` flag per row (the web's `getFavoritedListingIds`
 *     is a separate query) so passing it in as a prop would require
 *     prefetching favorites every Home mount.
 *   - For v1 the heart-button state is "best-effort UI" — a fresh
 *     mount will re-read from the server when the user opens the
 *     Favorites screen.
 */
export function FavoriteButton({
  listingId,
  initialFavorited = false,
  size = 36,
}: {
  listingId: string
  initialFavorited?: boolean
  size?: number
}) {
  const { signedIn } = useAuth()
  const t = useT()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => toggleFavorite(listingId),
    onSuccess: () => {
      // Heart fill IS the user feedback. Invalidate so the Favorites
      // screen refreshes its list whenever the user toggles from
      // anywhere (Home / Listing detail / Favorites itself).
      void queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
    onError: (err) => {
      const message =
        err instanceof ApiError ? err.message : t('favorites.error')
      Alert.alert(t('favorites.error'), message)
    },
  })

  const favorited = mutation.isPending
    ? !initialFavorited // optimistic flip during the request
    : (mutation.data?.favorited ?? initialFavorited)

  function onPress() {
    if (!signedIn) {
      router.push('/sign-in')
      return
    }
    mutation.mutate()
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: favorited }}
      accessibilityLabel={
        favorited ? t('favorites.removed') : t('favorites.added')
      }
      // Visual : circle with a heart character. `♥` outlines naturally
      // on white when the state is off, fills primary when on.
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="items-center justify-center bg-background/90 active:scale-95"
    >
      <Text
        className={`text-base ${favorited ? 'text-red-600' : 'text-foreground/70'}`}
        style={{ fontSize: size * 0.5 }}
      >
        {favorited ? '♥' : '♡'}
      </Text>
    </Pressable>
  )
}
