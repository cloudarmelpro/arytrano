import { useQuery, useQueryClient } from '@tanstack/react-query'
import { logout as apiLogout, login as apiLogin, register as apiRegister } from '../api/client'
import { getAccessToken } from './token-store'
import { decodeAccessToken } from './jwt-decode'
import {
  registerForPushNotifications,
  unregisterFromPushNotifications,
} from '../push/register'
import type { LoginRequest, RegisterRequest } from '@arytrano/shared'

/**
 * Single-source-of-truth for "is the user signed in".
 *
 * Reads SecureStore lazily via TanStack Query so the answer is cached
 * across screens and re-checked when the cache is invalidated (login,
 * logout, register). The query function returns just the presence of
 * an access token — the actual user payload is a separate query
 * against `/api/v1/users/me` that screens can fetch when they need it.
 *
 * Tokens are kept in SecureStore (Keychain / EncryptedSharedPreferences),
 * never in TanStack's cache, so a memory leak can't expose them.
 */
export const AUTH_QUERY_KEY = ['auth', 'is-signed-in'] as const

export function useAuth() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const token = await getAccessToken()
      if (!token) return { signedIn: false, user: null }
      // Decode locally instead of an extra /users/me round-trip. We
      // only expose what's in the JWT (sub, role) — screens that need
      // name/email still hit /users/me explicitly.
      const payload = decodeAccessToken(token)
      return {
        signedIn: true,
        user: payload ? { id: payload.sub, role: payload.role } : null,
      }
    },
    // Auth state changes rarely; no need to refetch on focus.
    staleTime: Infinity,
  })

  async function login(input: LoginRequest) {
    await apiLogin(input)
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    // Push registration is fire-and-forget — bearer is set, the
    // registration helper handles permission prompt + token POST.
    // Errors swallowed inside `registerForPushNotifications`.
    void registerForPushNotifications()
  }

  async function register(input: RegisterRequest) {
    await apiRegister(input)
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    void registerForPushNotifications()
  }

  async function logout() {
    // Clear the server-side token FIRST while we still have a valid
    // bearer to authenticate the DELETE. If the network call fails
    // we still proceed with local logout — losing the token on the
    // server is acceptable, leaving the user signed in locally is not.
    await unregisterFromPushNotifications()
    await apiLogout()
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY })
    // Also drop every cached query so screens don't render stale
    // private data after the user signed out.
    queryClient.clear()
  }

  return {
    signedIn: query.data?.signedIn ?? false,
    user: query.data?.user ?? null,
    isLoading: query.isLoading,
    login,
    register,
    logout,
  }
}
