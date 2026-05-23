import { z } from 'zod'

/**
 * Auth contract shared by web + mobile.
 *
 * The mobile app uses these to validate user input client-side BEFORE
 * hitting the API. The server re-validates with its own (potentially
 * stricter) Zod schemas — these here are the canonical "shape" of the
 * request body, no business rules.
 */

export const localeSchema = z.enum(['fr-MG', 'mg'])
export type Locale = z.infer<typeof localeSchema>

export const registerRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(80),
  locale: localeSchema.optional(),
})

export type RegisterRequest = z.infer<typeof registerRequestSchema>

export const loginRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(128),
  totpCode: z.string().regex(/^\d{6}$/).optional(),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(20).max(512),
})

export type RefreshRequest = z.infer<typeof refreshRequestSchema>

export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

/**
 * Tokens issued by `/api/v1/auth/login` and `/auth/register`.
 * Access token = short-lived JWT for API calls.
 * Refresh token = long-lived, stored in SecureStore on mobile.
 */
export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive().describe('access token TTL in seconds'),
})

export type AuthTokens = z.infer<typeof authTokensSchema>

/**
 * Decoded JWT payload structure. The mobile client typically does NOT
 * decode the JWT (the server is the source of truth), but exposing the
 * shape here is useful for typing the bearer middleware on both sides.
 */
export const jwtPayloadSchema = z.object({
  sub: z.string().describe('user id'),
  role: z.enum(['STUDENT', 'OWNER', 'ADMIN']),
  locale: localeSchema,
  ver: z.number().int(),
  exp: z.number().int(),
  iat: z.number().int().optional(),
})

export type JwtPayload = z.infer<typeof jwtPayloadSchema>
