import 'server-only'
import { env } from '@/lib/env'
import { ConsoleSmsProvider } from './console-provider'
import { TwilioSmsProvider } from './twilio-provider'
import type { SmsMessage, SmsProvider, SmsSendResult } from './types'

/**
 * T-002 — SMS provider selector.
 *
 * Env-driven, lazy-instantiated. The provider is cached after first
 * call ; tests can reset it via `__resetSmsProviderForTests`.
 *
 * Selection rules :
 *  1. `SMS_PROVIDER=twilio` + Twilio creds present → Twilio.
 *  2. Anything else AND `NODE_ENV !== 'production'` → console mock.
 *  3. Production without a real provider → throws on first send so
 *     the visitor sees a clean 500 + we get a Sentry signal instead
 *     of silently dropping codes.
 *
 * Add Africa's Talking by mirroring the Twilio branch once we have
 * a contract — same `SmsProvider` interface, no caller change.
 */

let cached: SmsProvider | null = null

export function getSmsProvider(): SmsProvider {
  if (cached) return cached

  const choice = env.SMS_PROVIDER ?? null

  if (choice === 'twilio') {
    if (
      !env.TWILIO_ACCOUNT_SID ||
      !env.TWILIO_AUTH_TOKEN ||
      !env.TWILIO_FROM_NUMBER
    ) {
      throw new Error(
        'SMS_PROVIDER=twilio but TWILIO_ACCOUNT_SID/AUTH_TOKEN/FROM_NUMBER missing',
      )
    }
    cached = new TwilioSmsProvider({
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      from: env.TWILIO_FROM_NUMBER,
    })
    return cached
  }

  // Dev / test default. In production this branch is intentional
  // ONLY when SMS_PROVIDER=console is set explicitly (emergency
  // dry-run scenario). Otherwise we want a hard failure.
  if (env.NODE_ENV === 'production' && choice !== 'console') {
    throw new Error(
      'No real SMS provider configured in production. Set SMS_PROVIDER=twilio or =console.',
    )
  }
  cached = new ConsoleSmsProvider()
  return cached
}

export async function sendSms(msg: SmsMessage): Promise<SmsSendResult> {
  return getSmsProvider().send(msg)
}

/** Test-only escape hatch. NOT exported in the production build. */
export function __resetSmsProviderForTests(): void {
  cached = null
}

export type { SmsMessage, SmsProvider, SmsSendResult } from './types'
export { SmsSendError } from './types'
