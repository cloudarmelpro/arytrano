import { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  type ViewToken,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import type { Locale } from '@arytrano/shared'
import { Button } from '@/components/ui/Button'
import { useLocale, useT } from '@/lib/i18n/use-locale'
import { writeOnboarded } from '@/lib/i18n/store'
import type { MessageKey } from '@/lib/i18n/messages'

type Slide = {
  titleKey: MessageKey
  bodyKey: MessageKey
  emoji: string
  bg: string
}

const SLIDES: Slide[] = [
  {
    titleKey: 'onboarding.slide1.title',
    bodyKey: 'onboarding.slide1.body',
    emoji: '🏠',
    bg: 'bg-primary',
  },
  {
    titleKey: 'onboarding.slide2.title',
    bodyKey: 'onboarding.slide2.body',
    emoji: '💬',
    bg: 'bg-[#1d8a4a]',
  },
  {
    titleKey: 'onboarding.slide3.title',
    bodyKey: 'onboarding.slide3.body',
    emoji: '✓',
    bg: 'bg-[#b8651d]',
  },
]

/**
 * Onboarding — 3 intro slides + locale picker + entry CTAs.
 *
 * Carousel uses a horizontal FlatList with `pagingEnabled` (snaps to
 * each slide) so we don't pull in `react-native-pager-view` or a
 * carousel library — the bundle stays lean.
 *
 * The locale picker writes to SecureStore via `useLocale.setLocale`
 * BEFORE any CTA — that way the next screen (Home or Sign-in)
 * already renders in the chosen language.
 *
 * Completing onboarding (any CTA) sets the `onboarded` flag so the
 * gate in `index.tsx` doesn't redirect here again.
 */
export default function Onboarding() {
  const t = useT()
  const { locale, setLocale } = useLocale()
  const [index, setIndex] = useState(0)
  const listRef = useRef<FlatList>(null)
  const { width } = Dimensions.get('window')

  function onViewableItemsChanged(info: { viewableItems: ViewToken[] }) {
    const first = info.viewableItems[0]
    if (first && typeof first.index === 'number') {
      setIndex(first.index)
    }
  }

  // useRef the config object so its identity is stable across renders
  // — RN throws if `viewabilityConfig` or the callback identity
  // changes between renders.
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current
  const onViewable = useRef(onViewableItemsChanged).current

  async function complete(target: '/' | '/sign-in') {
    await writeOnboarded()
    router.replace(target)
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row items-center justify-end px-5 py-2">
        <Pressable
          onPress={() => complete('/')}
          accessibilityLabel={t('common.skip')}
          className="px-2 py-1.5"
        >
          <Text className="text-sm font-medium text-muted-foreground">
            {t('common.skip')}
          </Text>
        </Pressable>
      </View>

      {/* Slides */}
      <View className="flex-1">
        <FlatList
          ref={listRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }) => (
            <View style={{ width }} className="items-center justify-center px-8">
              <View
                className={`mb-8 h-32 w-32 items-center justify-center rounded-3xl ${item.bg}`}
              >
                <Text className="text-6xl text-primary-foreground">
                  {item.emoji}
                </Text>
              </View>
              <Text className="text-center text-3xl text-foreground">
                {t(item.titleKey)}
              </Text>
              <Text className="mt-3 text-center text-base text-foreground/70">
                {t(item.bodyKey)}
              </Text>
            </View>
          )}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewable}
        />

        {/* Dots indicator — A11y P1-1 : the visible dots are decorative
            (the wrapping View carries the progress announcement) so
            screen reader users know which slide they're on. */}
        <View
          accessibilityRole="text"
          accessibilityLabel={t('onboarding.slide.progress', {
            current: index + 1,
            total: SLIDES.length,
          })}
          className="flex-row items-center justify-center gap-2 py-4"
        >
          {SLIDES.map((_, i) => (
            <View
              key={i}
              importantForAccessibility="no"
              accessibilityElementsHidden={true}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-6 bg-primary' : 'w-2 bg-muted'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Locale picker */}
      <View className="px-6 pb-2">
        <Text className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
      </View>

      {/* CTAs */}
      <View className="flex flex-col gap-3 px-6 pb-6 pt-4">
        <Button title={t('onboarding.cta.browse')} onPress={() => complete('/')} />
        <Button
          title={t('onboarding.cta.signIn')}
          variant="outline"
          onPress={() => complete('/sign-in')}
        />
      </View>
    </SafeAreaView>
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
      // A11y P2-3 : a 2-option mutually-exclusive picker is a radio
      // group, not a pair of buttons. `selected` + `radio` matches
      // what TalkBack/VoiceOver expect for this UX.
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
