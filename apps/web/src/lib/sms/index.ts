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
 *  2. NODE_ENV !== production → ConsoleSmsProvider (mock, logs the
 *     code locally).
 *  3. Production without a real provider → hard throw. The console
 *     provider is HARD-REFUSED in production (security audit
 *     2026-06-12) because it writes OTPs in stdout / Sentry
 *     breadcrumbs, which is a credential leak channel.
 *
 * Add Africa's Talking by mirroring the Twilio branch once we have
 * a contract — same `SmsProvider` interface, no caller change.
 */

let cached: SmsProvider | null = null

export function getSmsProvider(): SmsProvider {
  if (cached) return cached

  const choice = env.SMS_PROVIDER ?? null
  const isProd = env.NODE_ENV === 'production'

  // SECURITY (audit fix 2026-06-12) — Console provider in production
  // writes the OTP body in stdout. Even with SMS_PROVIDER=console
  // set explicitly we refuse, because the "emergency dry-run"
  // escape hatch is worth less than the credential leak risk.
  if (isProd && choice === 'console') {
    throw new Error(
      'SMS_PROVIDER=console is forbidden in production. Use a real provider (twilio).',
    )
  }

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

  if (isProd) {
    throw new Error(
      'No real SMS provider configured in production. Set SMS_PROVIDER=twilio.',
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
