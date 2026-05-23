import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/use-auth'

export default function Profile() {
  const { signedIn, isLoading, logout } = useAuth()

  // Auth gate — bounce anon users to sign-in. Wrapped in useEffect so
  // the redirect happens after the first render commit (router.replace
  // during render throws).
  useEffect(() => {
    if (!isLoading && !signedIn) {
      router.replace('/sign-in')
    }
  }, [isLoading, signedIn])

  if (isLoading || !signedIn) return null

  function confirmLogout() {
    Alert.alert(
      'Se déconnecter',
      'Tu pourras te reconnecter à tout moment.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/')
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-2 pb-10">
        <Pressable
          onPress={() => router.back()}
          className="-ml-2 mb-4 self-start p-2"
          accessibilityLabel="Retour"
        >
          <Text className="text-base text-muted-foreground">← Retour</Text>
        </Pressable>

        <Text className="font-serif text-3xl text-foreground">Mon profil</Text>

        <View className="mt-8 flex flex-col gap-3">
          <ProfileRow
            label="Recherches sauvegardées"
            // TODO(next slice) : wire to /dashboard/saved-searches equivalent
            onPress={() =>
              Alert.alert('Bientôt', 'Ce flow arrive dans la prochaine version.')
            }
          />
          <ProfileRow
            label="Mes favoris"
            // TODO(next slice) : Favorites screen
            onPress={() =>
              Alert.alert('Bientôt', 'Ce flow arrive dans la prochaine version.')
            }
          />
          <ProfileRow
            label="Paramètres du compte"
            onPress={() =>
              Alert.alert('Bientôt', 'Ce flow arrive dans la prochaine version.')
            }
          />
        </View>

        <View className="mt-10">
          <Button
            title="Se déconnecter"
            variant="outline"
            onPress={confirmLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function ProfileRow({
  label,
  onPress,
}: {
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="flex-row items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 active:bg-muted"
    >
      <Text className="text-base text-foreground">{label}</Text>
      <Text className="text-base text-muted-foreground">›</Text>
    </Pressable>
  )
}
