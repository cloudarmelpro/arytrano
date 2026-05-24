import * as SecureStore from 'expo-secure-store'
import type { AuthTokens } from '@arytrano/shared'

/**
 * Secure persistence of the JWT pair on device.
 *
 * Uses `expo-secure-store` — Keychain on iOS, EncryptedSharedPreferences
 * on Android. Tokens never touch AsyncStorage (plaintext, world-readable
 * on rooted devices).
 *
 * The refresh token lives separately from the access token because we
 * want to clear the access token aggressively (every app cold start
 * triggers a refresh) while keeping the refresh token sticky for the
 * 30-day grace window.
 */

const ACCESS_KEY = 'arytrano.accessToken'
const REFRESH_KEY = 'arytrano.refreshToken'
const EXPIRES_KEY = 'arytrano.accessExpiresAt'

// Sec P2-5 : pin the Keychain access policy explicitly. Default on
// iOS is `AFTER_FIRST_UNLOCK` — fine for tokens but worth being
// explicit so an iCloud Keychain restore on a different device
// doesn't silently migrate the refresh token to a new phone.
// WHEN_UNLOCKED_THIS_DEVICE_ONLY = stays on this device, requires
// unlock for every read.
const SECURE_STORE_OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
}

export async function saveTokens(tokens: AuthTokens): Promise<void> {
  const expiresAt = Date.now() + tokens.expiresIn * 1000
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken, SECURE_STORE_OPTS),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken, SECURE_STORE_OPTS),
    SecureStore.setItemAsync(EXPIRES_KEY, String(expiresAt), SECURE_STORE_OPTS),
  ])
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY)
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY)
}

export async function getAccessExpiresAt(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(EXPIRES_KEY)
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/**
 * Clear every credential — call on sign-out, account deletion, or
 * after a server-side token revocation (HTTP 401 with code = unauthorized
 * and `Token revoked. Sign in again.` message).
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
    SecureStore.deleteItemAsync(EXPIRES_KEY),
  ])
}

/** True when the stored access token has fewer than 30 seconds of life left. */
export async function isAccessTokenExpiring(): Promise<boolean> {
  const exp = await getAccessExpiresAt()
  if (!exp) return true
  return exp - Date.now() < 30_000
}
