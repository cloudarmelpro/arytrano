import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * Expo push-token management for the mobile app (E-T22).
 *
 * The mobile client calls `setExpoPushToken` after :
 *   - the user grants notification permission on first launch,
 *   - the user signs in / registers (the token may have rotated
 *     while the user was signed out on the same device),
 *   - the OS-issued token rotates (rare, but possible on Android).
 *
 * Tokens look like `ExponentPushToken[XXX...]` — we don't validate
 * the inner structure (Expo's format is stable enough), only that
 * the value starts with the prefix and stays under 200 chars.
 *
 * `@unique` on the column means a token registered by user A cannot
 * be re-used by user B — if user B signs in on the same device,
 * the token effectively migrates to B and is removed from A. We
 * implement this with a transaction : clear any existing
 * `expoPushToken = X` before setting it on the new user.
 */

const TOKEN_REGEX = /^ExponentPushToken\[[A-Za-z0-9_\-=+]+\]$/

export type ExpoPushToken = string & { readonly __brand: 'ExpoPushToken' }

export function isExpoPushToken(value: unknown): value is ExpoPushToken {
  return (
    typeof value === 'string' && value.length <= 200 && TOKEN_REGEX.test(value)
  )
}

export async function setExpoPushToken(
  userId: string,
  token: string,
): Promise<void> {
  if (!isExpoPushToken(token)) {
    throw errors.validation('Invalid Expo push token')
  }
  // Transaction so the "claim the token away from any previous owner"
  // step is atomic with the assignment. Without it a race between
  // two devices that received the same token (rare but possible on
  // device factory-reset) could leave both rows pointing at it,
  // violating @unique on the next write.
  await prisma.$transaction([
    prisma.user.updateMany({
      where: { expoPushToken: token, NOT: { id: userId } },
      data: { expoPushToken: null },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { expoPushToken: token },
    }),
  ])
}

export async function clearExpoPushToken(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { expoPushToken: null },
  })
}
