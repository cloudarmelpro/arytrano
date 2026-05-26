import 'server-only'
import { prisma } from '@/lib/db'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { recordLoginInputSchema, type RecordLoginPayload } from '../schemas'

export type RecordLoginInput = RecordLoginPayload & {
  /** Request whose headers we'll inspect for IP / UA. Used by REST routes (mobile login/register). */
  request?: Request
  /**
   * Raw headers — used by `events.signIn` (OAuth + magic-link), which doesn't
   * receive a Request object. Caller passes `await headers()` from `next/headers`.
   * If both `request` and `headers` are supplied, `request` wins.
   */
  headers?: Headers
}

export async function recordLoginEvent(input: RecordLoginInput): Promise<void> {
  // Validate the serializable part (everything except `request`/`headers`).
  const { userId, authMethod, isMobileApp } = recordLoginInputSchema.parse({
    userId: input.userId,
    authMethod: input.authMethod,
    isMobileApp: input.isMobileApp,
  })

  const sourceHeaders = input.request?.headers ?? input.headers ?? null
  const info = sourceHeaders
    ? extractRequestInfo(sourceHeaders)
    : { ipHash: null, userAgent: null, browser: null, os: null, deviceType: null }

  await prisma.loginEvent.create({
    data: {
      userId,
      authMethod,
      ipHash: info.ipHash,
      userAgent: info.userAgent,
      browser: info.browser,
      os: info.os,
      deviceType: info.deviceType,
      isMobileApp: isMobileApp ?? false,
    },
  })
}
