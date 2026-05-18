import 'server-only'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'
import { errors } from '@/lib/api/errors'

/**
 * Defence-in-depth admin guard for Server Actions and admin services.
 *
 * The layout `/admin/layout.tsx` already redirects non-admins to /dashboard,
 * but that's a UI gate — a Server Action lives at its own URL and can be
 * invoked from anywhere with a valid CSRF token, so EVERY admin mutation
 * must call `requireAdmin()` before touching data.
 *
 * Also re-reads `role` from the DB (not the JWT) so a freshly demoted admin
 * stops being able to perform admin actions immediately, even if their web
 * session JWT still claims ADMIN (project_jwt_role_staleness — known limit).
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    throw errors.unauthorized('Authentification requise')
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  })
  if (!dbUser || dbUser.status !== 'ACTIVE' || dbUser.role !== 'ADMIN') {
    throw errors.forbidden('Action réservée aux administrateurs')
  }
  return { userId: session.user.id }
}
