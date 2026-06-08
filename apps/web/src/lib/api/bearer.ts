import 'server-only'
import { prisma } from '@/lib/db'
import { verifyJwt, type AppJwtPayload } from '@/lib/auth/jwt'
import { errors } from './errors'

/**
 * Extract and verify a Bearer access token from a Request.
 * Returns the decoded JWT payload, or throws ApiError(401).
 *
 * Also validates `tokenVersion` (`ver` claim) matches the live DB value.
 * A token issued before a password change / reset / unlink is rejected.
 */
export async function requireBearer(req: Request): Promise<AppJwtPayload> {
  const header = req.headers.get('authorization')
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    throw errors.unauthorized('Missing or malformed Authorization header')
  }
  const token = header.slice(7).trim()
  if (!token) throw errors.unauthorized('Empty bearer token')

  let payload: AppJwtPayload
  try {
    payload = await verifyJwt(token, 'access')
  } catch {
    throw errors.unauthorized('Invalid or expired access token')
  }

  // Compare ver claim with DB tokenVersion. Mismatch = token was issued
  // before the user rotated credentials → revoked.
  //
  // SEC-C1 (2026-05-29) — also read emailVerified to enforce the same
  // gate the web Credentials provider does. An attacker who obtained a
  // token via a now-fixed register path (or a legacy unverified
  // account) is denied every protected endpoint.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { tokenVersion: true, status: true, emailVerified: true },
  })
  if (!user || user.status !== 'ACTIVE') {
    throw errors.unauthorized('User no longer active')
  }
  if (user.tokenVersion !== payload.ver) {
    throw errors.unauthorized('Token revoked. Sign in again.')
  }
  if (user.emailVerified === null) {
    throw errors.forbidden('Email non vérifié')
  }

  return payload
}

/** Optional: returns payload if present and valid, null otherwise. */
export async function optionalBearer(req: Request): Promise<AppJwtPayload | null> {
  try {
    return await requireBearer(req)
  } catch {
    return null
  }
}

/**
 * Bearer + role gate. Throws 403 if the caller is not OWNER or ADMIN.
 * Defence-in-depth on top of `findFirst({ ownerId })` in services: blocks a
 * demoted user from continuing to mutate listings they once created.
 */
export async function requireOwnerBearer(req: Request): Promise<AppJwtPayload> {
  const payload = await requireBearer(req)
  if (payload.role !== 'OWNER' && payload.role !== 'ADMIN') {
    throw errors.forbidden('Action réservée aux propriétaires')
  }
  return payload
}
