import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth/use-auth'
import { useLocale, useT } from '@/lib/i18n/use-locale'

export default function Profile() {
  const { signedIn, isLoading, logout } = useAuth()
  const t = useT()
  const { locale, setLocale } = useLocale()

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
      t('profile.logout.confirm.title'),
      t('profile.logout.confirm.body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logout()
            router.replace('/')
          },
        },
      ],
    )
  }

  function showComingSoon() {
    Alert.alert(t('profile.comingSoon.title'), t('profile.comingSoon.body'))
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-2 pb-10">
        <Pressable
          onPress={() => router.back()}
          className="-ml-2 mb-4 self-start p-2"
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Text className="text-base text-muted-foreground">
            {t('common.back')}
          </Text>
        </Pressable>

        <Text className="font-serif text-3xl text-foreground">
          {t('profile.title')}
        </Text>

        <View className="mt-8 flex flex-col gap-3">
          <ProfileRow
            label={t('profile.row.favorites')}
            onPress={() => router.push('/favorites')}
          />
          <ProfileRow
            label={t('profile.row.savedSearches')}
            onPress={() => router.push('/saved-searches')}
          />
          <ProfileRow
            label={t('profile.row.settings')}
            onPress={showComingSoon}
          />
        </View>

        {/* Locale picker — matches the onboarding one but lives here
            so users can switch language without going through the
            first-launch flow again. */}
        <Text className="mt-10 mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('onboarding.locale.title')}
        </Text>
        <View className="flex-row gap-2">
          <LocalePill
            label={t('onboarding.locale.fr')}
            active={locale === 'fr-MG'}
            onPress={() => setLocale('fr-MG')}
          />
          <LocalePill
            label={t('onboarding.locale.mg')}
            active={locale === 'mg'}
            onPress={() => setLocale('mg')}
          />
        </View>



        <View className="mt-10">
          <Button
            title={t('profile.logout')}
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
      // A11y P1-4 : navigation rows that route to a new screen are
      // semantically links, not buttons. Lets TalkBack offer the
      // expected swipe-right link affordance.
      accessibilityRole="link"
      accessibilityLabel={label}
      className="flex-row items-center justify-between rounded-2xl border border-border bg-background px-4 py-4 active:bg-muted"
    >
      <Text className="text-base text-foreground">{label}</Text>
      {/* A11y P3-2 : chevron is decorative; the row's label already
          conveys the action. Hide from a11y tree so VoiceOver doesn't
          read "right-pointing angle bracket". */}
      <Text
        className="text-base text-muted-foreground"
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        ›
      </Text>
    </Pressable>
  )
}

function LocalePill({
  label,
  active,
  onPress,
}: {
  label: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      // A11y P2-3 : radio, not button (mutually-exclusive 2-option picker).
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      className={`flex-1 items-center rounded-xl border px-4 py-3 ${
        active
          ? 'border-primary bg-primary'
          : 'border-border bg-background active:bg-muted'
      }`}
    >
      <Text
        className={`text-base font-semibold ${
          active ? 'text-primary-foreground' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  )
}
