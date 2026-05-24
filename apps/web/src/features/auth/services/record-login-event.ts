import 'server-only'
import { prisma } from '@/lib/db'
import { extractRequestInfo } from '@/lib/auth/request-info'
import { recordLoginInputSchema, type RecordLoginPayload } from '../schemas'

export type RecordLoginInput = RecordLoginPayload & {
  /** Request whose headers we'll inspect for IP / UA. Optional — omit for OAuth event callbacks. */
  request?: Request
}

export async function recordLoginEvent(input: RecordLoginInput): Promise<void> {
  // Validate the serializable part (everything except `request`).
  const { userId, authMethod, isMobileApp } = recordLoginInputSchema.parse({
    userId: input.userId,
    authMethod: input.authMethod,
    isMobileApp: input.isMobileApp,
  })

  const info = input.request
    ? extractRequestInfo(input.request.headers)
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
