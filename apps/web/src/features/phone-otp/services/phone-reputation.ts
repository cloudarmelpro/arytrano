import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

/**
 * TRU-18 — call Twilio Lookup v2 to score a phone number. VoIP /
 * disposable numbers get flagged; landlines and mobile pass. Returns
 * a small object the caller can gate on. When env vars are missing
 * we return `{ ok: true, skipped: true }` so the feature is
 * effectively disabled without breaking the flow.
 *
 * Twilio Lookup pricing is ~$0.005 per call — call it selectively
 * (during OTP request for a phone we've never seen) rather than
 * every request.
 */
export type PhoneReputation =
  | { ok: true; skipped: true }
  | { ok: true; skipped: false; type: 'mobile' | 'landline' | 'voip' | 'unknown' }
  | { ok: false; reason: 'network' | 'invalid' }

const LOOKUP_TIMEOUT_MS = 4000

export async function lookupPhoneReputation(
  phoneE164: string,
): Promise<PhoneReputation> {
  const sid = env.TWILIO_ACCOUNT_SID
  const token = env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return { ok: true, skipped: true }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS)
  try {
    const auth = Buffer.from(`${sid}:${token}`).toString('base64')
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phoneE164)}?Fields=line_type_intelligence`
    const res = await fetch(url, {
      headers: { authorization: `Basic ${auth}` },
      signal: controller.signal,
    })
    if (!res.ok) {
      return { ok: false, reason: res.status === 404 ? 'invalid' : 'network' }
    }
    const body = (await res.json()) as {
      line_type_intelligence?: { type?: string }
    }
    const raw = body.line_type_intelligence?.type ?? ''
    const type =
      raw === 'mobile' ? 'mobile'
        : raw === 'landline' ? 'landline'
          : raw === 'voip' || raw === 'nonFixedVoip' || raw === 'fixedVoip' ? 'voip'
            : 'unknown'
    return { ok: true, skipped: false, type }
  } catch (err) {
    Sentry.captureException(err, {
      tags: { feature: 'phone-reputation', step: 'lookup' },
    })
    return { ok: false, reason: 'network' }
  } finally {
    clearTimeout(timer)
  }
}
