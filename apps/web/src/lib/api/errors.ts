import 'server-only'

export type ApiErrorCode =
  | 'validation_failed'
  | 'unauthorized'
  | 'totp_required'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'internal_error'

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly fields?: Record<string, string[]>

  constructor(opts: {
    code: ApiErrorCode
    status: number
    message: string
    fields?: Record<string, string[]>
  }) {
    super(opts.message)
    this.code = opts.code
    this.status = opts.status
    this.fields = opts.fields
  }
}

export const errors = {
  validation: (message: string, fields?: Record<string, string[]>) =>
    new ApiError({ code: 'validation_failed', status: 400, message, fields }),
  unauthorized: (message = 'Authentication required') =>
    new ApiError({ code: 'unauthorized', status: 401, message }),
  totpRequired: (message = 'Code 2FA requis') =>
    new ApiError({ code: 'totp_required', status: 401, message }),
  forbidden: (message = 'Forbidden') =>
    new ApiError({ code: 'forbidden', status: 403, message }),
  notFound: (message = 'Not found') =>
    new ApiError({ code: 'not_found', status: 404, message }),
  conflict: (message: string) =>
    new ApiError({ code: 'conflict', status: 409, message }),
  rateLimited: (message = 'Too many requests') =>
    new ApiError({ code: 'rate_limited', status: 429, message }),
  internal: (message = 'Internal server error') =>
    new ApiError({ code: 'internal_error', status: 500, message }),
}
