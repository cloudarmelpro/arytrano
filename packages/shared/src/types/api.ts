import { z } from 'zod'

/**
 * Canonical response envelopes for `/api/v1/`. Matches the web server's
 * `src/lib/api/response.ts` exactly so the mobile client can type any
 * endpoint response with confidence.
 */

export type ApiSuccess<T> = {
  data: T
  meta?: Record<string, unknown>
}

export type ApiFailure = {
  error: {
    code: ApiErrorCode
    message: string
    fields?: Record<string, string[]>
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export const apiErrorCodeSchema = z.enum([
  'validation_failed',
  'unauthorized',
  'totp_required',
  'forbidden',
  'not_found',
  'conflict',
  'rate_limited',
  'internal_error',
])

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>

export function isApiFailure<T>(r: ApiResponse<T>): r is ApiFailure {
  return 'error' in r && r.error !== undefined
}

export function isApiSuccess<T>(r: ApiResponse<T>): r is ApiSuccess<T> {
  return 'data' in r
}

/**
 * Cursor-based pagination meta. Mirrors what `/api/v1/listings` returns.
 */
export type PageMeta = {
  nextCursor: string | null
  hasMore: boolean
}
