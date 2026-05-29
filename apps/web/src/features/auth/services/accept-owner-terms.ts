import 'server-only'
import { prisma } from '@/lib/db'
import { OWNER_TERMS_VERSION } from '../constants'

/**
 * Marks an OWNER account as having accepted the current Owner Terms
 * (T-049).
 *
 * No tokenVersion bump : the dashboard layout reads `ownerTermsAcceptedAt`
 * via a per-request Prisma query, so the next /dashboard render after
 * the action's redirect picks up the fresh timestamp without touching
 * the JWT. A tokenVersion bump here would invalidate the session
 * mid-flight and bounce the user back to /sign-in — the exact opposite
 * of what we want.
 *
 * Idempotent : a second call for an already-accepted user just
 * refreshes the timestamp + version. Cheap (one Prisma update).
 *
 * Authorization is the caller's job — the Server Action verifies
 * the session and the OWNER role before calling.
 */
export type AcceptOwnerTermsOutcome =
  | { kind: 'ok'; acceptedAt: Date; version: string }
  | { kind: 'not_found'; userId: string }
  | { kind: 'not_owner'; userId: string; currentRole: string }

export async function acceptOwnerTerms(
  userId: string,
): Promise<AcceptOwnerTermsOutcome> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true },
  })
  if (!user || user.status !== 'ACTIVE') {
    return { kind: 'not_found', userId }
  }
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    return { kind: 'not_owner', userId, currentRole: user.role }
  }

  const acceptedAt = new Date()
  await prisma.user.update({
    where: { id: user.id },
    data: {
      ownerTermsAcceptedAt: acceptedAt,
      ownerTermsVersion: OWNER_TERMS_VERSION,
    },
  })

  return { kind: 'ok', acceptedAt, version: OWNER_TERMS_VERSION }
}
