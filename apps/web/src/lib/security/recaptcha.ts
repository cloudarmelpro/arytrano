import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

/**
 * TRU-17 — reCAPTCHA v3 server-side verifier.
 *
 * Calls Google's siteverify endpoint, returns whether the token's
 * score clears the configured threshold AND the expected action
 * matches. When the env vars are missing (dev / preview / forgotten
 * keys) we short-circuit to `{ ok: true, score: null }` so a missing
 * config never silently locks every visitor out of sign-up. The
 * tradeoff is explicit: production deploys must set both env vars.
 *
 * The siteverify endpoint accepts a 2s budget — we cap at 3s to
 * survive Madagascar's higher RTT. A timeout falls back to "ok"
 * with a Sentry warning rather than rejecting the legitimate user.
 */
export type RecaptchaVerifyResult = {
  ok: boolean
  /** null when verification was skipped (no keys / network error) */
  score: number | null
  /** Set when ok=false — surface in form error message */
  reason?:
    | 'missing_token'
    | 'siteverify_failed'
    | 'action_mismatch'
    | 'low_score'
}

const SITEVERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const TIMEOUT_MS = 3_000

export async function verifyRecaptchaToken(
  token: string | null | undefined,
  expectedAction: string,
): Promise<RecaptchaVerifyResult> {
  // No keys configured → skip (dev / forgotten config).
  if (!env.RECAPTCHA_SECRET_KEY || !env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    return { ok: true, score: null }
  }

  // Keys present but the client didn't include a token → fail closed.
  if (!token || typeof token !== 'string') {
    return { ok: false, score: null, reason: 'missing_token' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let payload: {
    success: boolean
    score?: number
    action?: string
    hostname?: string
    'error-codes'?: string[]
  }
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
      signal: controller.signal,
    })
    payload = await res.json()
  } catch (err) {
    Sentry.captureException(err, {
      level: 'warning',
      tags: { kind: 'recaptcha', stage: 'siteverify' },
    })
    // Network / timeout — admit the user (TRU-04 + TRU-10 still gate).
    return { ok: true, score: null }
  } finally {
    clearTimeout(timer)
  }

  if (!payload.success) {
    return { ok: false, score: null, reason: 'siteverify_failed' }
  }

  // Mismatched action almost always means a token was minted on a
  // different form (or replayed) — reject.
  if (payload.action !== expectedAction) {
    return {
      ok: false,
      score: payload.score ?? null,
      reason: 'action_mismatch',
    }
  }

  const score = payload.score ?? 0
  if (score < env.RECAPTCHA_MIN_SCORE) {
    return { ok: false, score, reason: 'low_score' }
  }

  return { ok: true, score }
}
