import 'react-native-gesture-handler'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import '../global.css'

/**
 * Root layout — wraps every screen with the providers the app needs :
 *
 *  - GestureHandlerRootView : required by react-native-gesture-handler
 *    on every screen, not just the ones using gestures (otherwise
 *    nested gestures inside ScrollViews break).
 *  - QueryClientProvider : TanStack Query handles API caching + retry +
 *    offline-friendly stale-while-revalidate. Single instance per app.
 *    We keep `staleTime: 60s` so a quick re-mount doesn't re-fetch
 *    listings the user just scrolled past.
 *  - Stack (expo-router) : declarative typed routing tree.
 */
export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            // Madagascar 3G : prefer the cached page over hitting a
            // failed network on focus, and let the user pull-to-refresh
            // when they actually want fresh data.
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </GestureHandlerRootView>
  )
}
