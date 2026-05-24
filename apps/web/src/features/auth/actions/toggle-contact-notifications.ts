'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '../auth'
import { prisma } from '@/lib/db'

type ActionResult =
  | { ok: true; enabled: boolean }
  | { ok: false; needsAuth?: boolean; message?: string }

/**
 * Toggle the current user's `contactNotificationsEnabled` flag. Used
 * by the NotificationsSection switch in /dashboard/settings. Per
 * memory feedback_server_action_authn_guard, every Server Action with
 * side effects checks auth() first.
 *
 * Idempotent — passing the same `enabled` value twice is a no-op
 * (Prisma will issue the UPDATE but the row state stays).
 */
export async function toggleContactNotificationsAction(
  enabled: boolean,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, needsAuth: true }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { contactNotificationsEnabled: enabled },
    })
    revalidatePath('/dashboard/settings')
    return { ok: true, enabled }
  } catch {
    return { ok: false, message: 'Impossible de mettre à jour la préférence.' }
  }
}
