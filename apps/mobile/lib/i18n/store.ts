import * as SecureStore from 'expo-secure-store'
import { localeSchema, type Locale } from '@arytrano/shared'

/**
 * Persists the active locale + the "seen onboarding" flag in
 * SecureStore. We use SecureStore (not AsyncStorage) so a single
 * storage adapter covers tokens AND preferences — fewer moving
 * parts.
 *
 * Locale defaults to `fr-MG` when nothing is stored. The onboarding
 * screen writes whichever option the user picks; subsequent app
 * launches read it back here.
 */

const LOCALE_KEY = 'arytrano.locale'
const ONBOARDED_KEY = 'arytrano.onboarded'

export async function readLocale(): Promise<Locale> {
  const raw = await SecureStore.getItemAsync(LOCALE_KEY)
  const parsed = localeSchema.safeParse(raw)
  return parsed.success ? parsed.data : 'fr-MG'
}

export async function writeLocale(locale: Locale): Promise<void> {
  await SecureStore.setItemAsync(LOCALE_KEY, locale)
}

export async function readOnboarded(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(ONBOARDED_KEY)
  return raw === 'true'
}

export async function writeOnboarded(): Promise<void> {
  await SecureStore.setItemAsync(ONBOARDED_KEY, 'true')
}
