import 'server-only'
import { prisma } from '@/lib/db'
import { OWNER_TERMS_VERSION } from '../constants'

/**
 * Marks an OWNER account as having accepted the current Owner Terms
 * (T-049). Bumps `tokenVersion` so the existing JWT/session is
 * invalidated and the next request re-issues with the up-to-date
 * gate state, otherwise the dashboard gate would keep redirecting
 * until the user manually signed out/in.
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
      // tokenVersion bump : invalidates the JWT so the per-request
      // validation in auth.ts re-reads the fresh `ownerTermsAcceptedAt`.
      // Without this the dashboard gate keeps redirecting on the same
      // tab until the user signs out.
      tokenVersion: { increment: 1 },
    },
  })

  return { kind: 'ok', acceptedAt, version: OWNER_TERMS_VERSION }
}
