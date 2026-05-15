import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ApiError } from './errors'

export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> }
export type ApiFailure = {
  error: { code: string; message: string; fields?: Record<string, string[]> }
}

export function ok<T>(data: T, opts?: { status?: number; meta?: Record<string, unknown> }) {
  const body: ApiSuccess<T> = { data, ...(opts?.meta ? { meta: opts.meta } : {}) }
  return NextResponse.json(body, { status: opts?.status ?? 200 })
}

export function created<T>(data: T) {
  return ok(data, { status: 201 })
}

export function fail(err: unknown) {
  if (err instanceof ApiError) {
    const body: ApiFailure = {
      error: { code: err.code, message: err.message, ...(err.fields ? { fields: err.fields } : {}) },
    }
    return NextResponse.json(body, { status: err.status })
  }
  if (err instanceof ZodError) {
    const fields: Record<string, string[]> = {}
    for (const issue of err.issues) {
      const key = issue.path.join('.') || '_'
      if (!fields[key]) fields[key] = []
      fields[key].push(issue.message)
    }
    return NextResponse.json(
      { error: { code: 'validation_failed', message: 'Invalid input', fields } },
      { status: 400 },
    )
  }
  console.error('[api] unhandled error:', err)
  return NextResponse.json(
    { error: { code: 'internal_error', message: 'Internal server error' } },
    { status: 500 },
  )
}

/** Wrap a route handler so any thrown error becomes a JSON response. */
export function withErrorHandling<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Promise<Response>,
) {
  return async (...args: TArgs): Promise<Response> => {
    try {
      return await handler(...args)
    } catch (err) {
      return fail(err)
    }
  }
}
