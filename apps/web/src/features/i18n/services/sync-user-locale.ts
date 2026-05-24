import 'server-only'
import { prisma } from '@/lib/db'
import { toPrismaLocale, type Locale } from '@/lib/i18n/config'

/**
 * Persist a user's locale preference to `User.locale`. Used by the locale
 * switcher (web Server Action) and the mobile REST endpoint that lets a
 * user update their preferred language.
 *
 * Pure business logic — no Auth context, no error swallowing. Callers
 * decide whether DB failure is fatal (REST: yes — return 500) or
 * best-effort (web cookie write already succeeded — log and move on).
 */
export async function syncUserLocale(userId: string, locale: Locale): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { locale: toPrismaLocale(locale) },
  })
}
