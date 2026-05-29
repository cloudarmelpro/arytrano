import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Authorization helper — verifies the caller has accepted the dedicated
 * Owner Terms (T-049). Used at the top of every owner-only service
 * that performs a side effect, so the gate cannot be bypassed by
 * calling the REST API directly from the mobile app (or any other
 * client that skips the dashboard layout gate).
 *
 * The dashboard layout's redirect-to-onboarding still exists as a UX
 * convenience for web users — this server-side check is the security
 * boundary.
 *
 * Returns true when the user accepted, false otherwise. The caller
 * decides whether to throw (REST handlers → 422) or to redirect
 * (Server Actions → /onboarding/owner/terms).
 */
export async function ownerTermsAcceptedFor(
  userId: string,
): Promise<boolean> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, ownerTermsAcceptedAt: true },
  })
  if (!u) return false
  // STUDENT accounts don't need to accept the Owner Terms — they aren't
  // bound by them. Return true so the helper doesn't accidentally
  // block student-only services if they call it for some reason.
  if (u.role !== 'OWNER' && u.role !== 'ADMIN') return true
  return u.ownerTermsAcceptedAt !== null
}
