import 'server-only'

/**
 * T-002 — SMS provider abstraction.
 *
 * Swappable backends so we can start dev on a console mock, switch to
 * Twilio or Africa's Talking on staging, and keep the option to
 * negotiate a Madagascar telco-direct contract later. The selector
 * lives in `lib/sms/index.ts` and reads `env.SMS_PROVIDER`.
 *
 * Contract :
 *  - Caller passes the recipient phone in E.164 (`+261341234567`).
 *  - Implementation handles per-provider format quirks internally
 *    (digits-only, country-code split, etc.).
 *  - On success, the returned `messageId` is the provider's tracking
 *    id ; null when the provider doesn't expose one. Caller does NOT
 *    persist it for v1 ; future receipt-poll cron can.
 *  - On failure, throw `SmsSendError` with a stable `code` so the
 *    caller can branch on error class without parsing strings.
 */

export type SmsMessage = {
  to: string
  body: string
}

export type SmsSendResult = {
  /** Provider tracking id. null when not available. */
  messageId: string | null
  /** Provider name that handled the send — for debug + telemetry. */
  provider: SmsProviderName
}

export type SmsProviderName = 'console' | 'twilio' | 'africastalking'

export interface SmsProvider {
  readonly name: SmsProviderName
  send(msg: SmsMessage): Promise<SmsSendResult>
}

export type SmsErrorCode =
  | 'invalid_recipient' // phone format rejected by provider
  | 'provider_unauthorized' // bad credentials at runtime
  | 'provider_unreachable' // network / timeout
  | 'rate_limited' // provider's own rate limit
  | 'unsupported_country' // MG number on a provider that doesn't cover MG
  | 'unknown'

export class SmsSendError extends Error {
  readonly code: SmsErrorCode
  readonly provider: SmsProviderName

  constructor(opts: {
    code: SmsErrorCode
    provider: SmsProviderName
    message: string
  }) {
    super(opts.message)
    this.code = opts.code
    this.provider = opts.provider
  }
}
