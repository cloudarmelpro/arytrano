import Constants from 'expo-constants'

/**
 * Runtime configuration for the mobile app.
 *
 * `API_BASE_URL` resolves in this order :
 *   1. `EXPO_PUBLIC_API_URL` env var (typed prod / staging builds)
 *   2. `extra.apiUrl` from app.json
 *   3. dev fallback : the LAN address of the web dev server, derived
 *      from the Expo manifest. On a physical device `localhost` points
 *      at the phone itself — we need the dev machine's LAN IP, which
 *      Expo exposes via `hostUri`.
 */

function resolveDevApiUrl(): string {
  const hostUri =
    // expo SDK 51+
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    // older Expo versions
    (Constants.manifest2 as { extra?: { expoGo?: { debuggerHost?: string } } } | null)
      ?.extra?.expoGo?.debuggerHost ??
    'localhost:3000'

  // hostUri is `<ip>:<expoPort>` — strip the port and append :3000 for
  // the Next.js dev server.
  const host = hostUri.split(':')[0]
  return `http://${host}:3000`
}

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  resolveDevApiUrl()
