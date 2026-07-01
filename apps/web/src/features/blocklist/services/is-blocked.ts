import 'server-only'
import { prisma } from '@/lib/db'

export type IsBlockedInput = {
  ipHash?: string | null
  phone?: string | null
  email?: string | null
}

/**
 * TRU-11 — single lookup that reports whether any of the passed
 * identity signals matches a live blocklist entry. Expired rows are
 * ignored. Best-effort: DB errors return false so a transient hiccup
 * doesn't lock out legitimate users.
 */
export async function isBlocked(input: IsBlockedInput): Promise<boolean> {
  const now = new Date()
  const OR: Array<{ kind: 'IP_HASH' | 'PHONE' | 'EMAIL'; value: string }> = []
  if (input.ipHash) OR.push({ kind: 'IP_HASH', value: input.ipHash })
  if (input.phone) OR.push({ kind: 'PHONE', value: input.phone.trim() })
  if (input.email) OR.push({ kind: 'EMAIL', value: input.email.trim().toLowerCase() })
  if (OR.length === 0) return false

  try {
    const hit = await prisma.blocklistEntry.findFirst({
      where: {
        AND: [
          { OR },
          { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        ],
      },
      select: { id: true },
    })
    return Boolean(hit)
  } catch {
    return false
  }
}
