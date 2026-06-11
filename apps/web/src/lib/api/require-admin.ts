import 'server-only'
import { prisma } from '@/lib/db'
import { errors } from './errors'

/**
 * E-T28 — helper used by REST handlers that already validated the
 * bearer token (so we have a `userId`) but need to additionally
 * verify the caller is an ADMIN.
 *
 * Throws the 403 `ApiError` via `errors.forbidden` ; never returns
 * for non-admins. The Server Action path duplicates this check via
 * `session.user.role !== 'ADMIN'` so the same gate exists on both
 * transports.
 */
export async function requireAdmin(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (!user) throw errors.forbidden('Accès refusé.')
  if (user.role !== 'ADMIN') throw errors.forbidden('Accès refusé.')
}
