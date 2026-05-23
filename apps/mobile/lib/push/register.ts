import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { registerExpoPushToken, unregisterExpoPushToken } from '../api/client'

/**
 * Push notification registration — call after every successful sign-in
 * (or on app launch when the user is already signed in).
 *
 * Flow :
 *   1. Bail on simulators — they can't receive push notifications.
 *   2. Ensure an Android notification channel exists (required since
 *      Android 8). The plugin in app.json creates `default`, but we
 *      verify here in case the OS dropped it on a reinstall.
 *   3. Check existing permission. If granted, skip the prompt;
 *      otherwise request it. Users who deny return without an error
 *      — the app stays usable, just no pushes.
 *   4. Read the device's Expo push token.
 *   5. POST it to /api/v1/users/me/push-token.
 *
 * All failures are logged + swallowed. A device that can't receive
 * notifications is annoying for us but must NEVER block the user
 * from signing in.
 */
export async function registerForPushNotifications(): Promise<void> {
  // Simulators / emulators don't have a push service.
  if (!Device.isDevice) return

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
        // Brand color of the small heads-up notification icon.
        lightColor: '#191970',
      })
    }

    const existing = await Notifications.getPermissionsAsync()
    let status = existing.status
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync()
      status = requested.status
    }
    if (status !== 'granted') return

    const tokenResult = await Notifications.getExpoPushTokenAsync()
    await registerExpoPushToken(tokenResult.data)
  } catch (err) {
    // Push registration is best-effort — log and move on.
    console.warn('[push] register failed', err)
  }
}

/**
 * Tell the server to forget about this device. Called on logout so
 * the next user who signs in on the same device gets the token
 * migrated cleanly (and so we stop pinging the prior user).
 *
 * Fire-and-forget : the user has already moved on from the sign-out
 * screen, we don't await this.
 */
export async function unregisterFromPushNotifications(): Promise<void> {
  try {
    await unregisterExpoPushToken()
  } catch (err) {
    console.warn('[push] unregister failed', err)
  }
}
