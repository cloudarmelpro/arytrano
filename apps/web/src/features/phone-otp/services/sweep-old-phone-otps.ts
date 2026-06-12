import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Daily sweep of PhoneOtp rows older than 24h. Audit fix 2026-06-12 :
 * the schema commented "Cron sweep daily clears rows older than 24h"
 * but the cron didn't exist. Without it, every verified/consumed/
 * expired row accumulated forever — privacy footprint (phoneHash +
 * codeHash) AND a slow-growing table.
 *
 * Cutoff = createdAt < now - 24h. We keep recent rows even if
 * already verified/consumed so `hasRecentlyVerifiedPhone` can still
 * answer "did this phone verify in the last 15 min" lookups.
 */
export async function sweepOldPhoneOtps(): Promise<{ deleted: number }> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const result = await prisma.phoneOtp.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return { deleted: result.count }
}
