import { useQuery } from '@tanstack/react-query'
import { Text, View, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { listCities } from '@/lib/api/client'

/**
 * Welcome / smoke-test screen.
 *
 * Hits `GET /api/v1/cities` to prove the end-to-end pipeline works :
 *   Expo Metro → TanStack Query → fetch → web dev server → Prisma →
 *   shared schema validates the response → renders.
 *
 * Once the foundation is stable, this gets replaced by the onboarding
 * carousel + locale picker (E-T22 scope).
 */
export default function Welcome() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cities'],
    queryFn: () => listCities(),
  })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="px-6 py-10">
        <Text className="font-serif text-4xl text-foreground">AryTrano</Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Logement étudiant à Madagascar.
        </Text>

        <View className="mt-10">
          <Text className="text-xs uppercase tracking-wider text-muted-foreground">
            Smoke test : GET /api/v1/cities
          </Text>

          {isLoading && (
            <View className="mt-4 flex-row items-center gap-2">
              <ActivityIndicator />
              <Text className="text-sm text-muted-foreground">Loading…</Text>
            </View>
          )}

          {error && (
            <View className="mt-4 rounded-lg bg-red-50 p-3">
              <Text className="text-sm font-semibold text-red-900">
                Erreur API
              </Text>
              <Text className="mt-1 text-xs text-red-800">
                {error instanceof Error ? error.message : 'Unknown error'}
              </Text>
            </View>
          )}

          {data && (
            <View className="mt-4 flex flex-col gap-2">
              {data.map((c) => (
                <View
                  key={c.id}
                  className="rounded-lg border border-border bg-muted p-3"
                >
                  <Text className="text-base font-semibold text-foreground">
                    {c.nameFr}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {c.nameMg} · {c.lat.toFixed(4)}, {c.lng.toFixed(4)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
