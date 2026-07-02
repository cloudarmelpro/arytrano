import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { z } from 'zod'
import { env } from '@/lib/env'

const ACCESS_TTL = '15m'
const REFRESH_TTL = '30d'
const ISSUER = 'arytrano'

export type TokenType = 'access' | 'refresh'

/**
 * Defense-in-depth: jose only verifies the signature + standard JWT claims.
 * We Zod-validate the payload shape too so a tampered-but-signed token (only
 * possible if AUTH_SECRET leaked) still can't bypass our typed assumptions.
 *
 * `ver` is `tokenVersion` from User table — incremented on password change,
 * reset, or OAuth unlink. `requireBearer` compares it to the live DB value
 * and rejects on mismatch, so stolen JWTs become invalid the moment the user
 * rotates their credentials.
 */
const appJwtPayloadSchema = z.object({
  sub: z.string().min(1),
  role: z.enum(['STUDENT', 'OWNER', 'ADMIN', 'MODERATOR', 'SUPPORT']),
  type: z.enum(['access', 'refresh']),
  ver: z.number().int().nonnegative(),
  iss: z.string().optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
})

export type AppJwtPayload = z.infer<typeof appJwtPayloadSchema>

type PayloadInput = {
  sub: string
  role: AppJwtPayload['role']
  ver: number
}

function getKey() {
  return new TextEncoder().encode(env.AUTH_SECRET)
}

export async function signAccessToken(payload: PayloadInput): Promise<string> {
  return new SignJWT({ ...payload, type: 'access' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .setSubject(payload.sub)
    .sign(getKey())
}

export async function signRefreshToken(payload: PayloadInput): Promise<string> {
  return new SignJWT({ ...payload, type: 'refresh' as const })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .setSubject(payload.sub)
    .sign(getKey())
}

export async function verifyJwt(token: string, expected: TokenType): Promise<AppJwtPayload> {
  const { payload } = await jwtVerify(token, getKey(), { issuer: ISSUER })
  const parsed = appJwtPayloadSchema.parse(payload)
  if (parsed.type !== expected) {
    throw new Error(`Expected ${expected} token, got ${parsed.type}`)
  }
  return parsed
}

export async function signTokenPair(payload: PayloadInput) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ])
  return { accessToken, refreshToken }
}
