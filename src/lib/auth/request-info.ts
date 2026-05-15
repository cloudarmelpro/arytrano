import 'server-only'
import crypto from 'node:crypto'
import { UAParser } from 'ua-parser-js'
import { env } from '@/lib/env'

export type RequestInfo = {
  ipHash: string | null
  userAgent: string | null
  browser: string | null
  os: string | null
  deviceType: string | null
}

function pickHeader(h: Headers, name: string): string | null {
  const v = h.get(name)
  return v && v.trim() !== '' ? v.trim() : null
}

function extractClientIp(h: Headers): string | null {
  const forwarded = pickHeader(h, 'x-forwarded-for')
  if (forwarded) {
    // First entry = original client
    return forwarded.split(',')[0]?.trim() ?? null
  }
  return (
    pickHeader(h, 'x-real-ip') ??
    pickHeader(h, 'cf-connecting-ip') ??
    pickHeader(h, 'true-client-ip') ??
    null
  )
}

export function hashIp(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + (env.AUTH_SECRET ?? ''))
    .digest('hex')
}

/**
 * Hash a User-Agent string with the same scheme as `hashIp`. Lets us
 * de-duplicate logs by device fingerprint without ever storing raw UA
 * strings (which can reveal browser version + extensions = identifying).
 */
export function hashUa(userAgent: string): string {
  return crypto
    .createHash('sha256')
    .update(userAgent + (env.AUTH_SECRET ?? ''))
    .digest('hex')
}

export function extractRequestInfo(headersInput: Headers): RequestInfo {
  const ip = extractClientIp(headersInput)
  const userAgent = pickHeader(headersInput, 'user-agent')

  let browser: string | null = null
  let os: string | null = null
  let deviceType: string | null = null

  if (userAgent) {
    const parsed = UAParser(userAgent)
    browser = parsed.browser.name ?? null
    os = parsed.os.name ?? null
    const dt = parsed.device.type
    deviceType = dt ?? 'desktop'
  }

  return {
    ipHash: ip ? hashIp(ip) : null,
    userAgent,
    browser,
    os,
    deviceType,
  }
}
