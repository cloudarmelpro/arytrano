import 'server-only'
import {
  SmsSendError,
  type SmsMessage,
  type SmsProvider,
  type SmsProviderName,
  type SmsSendResult,
} from './types'

/**
 * Twilio SMS provider. v1 implementation lives here for completeness,
 * but it WILL NOT be activated until the user provides
 * `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER`
 * env vars. Until then the selector in `lib/sms/index.ts` falls back
 * to the console mock.
 *
 * Madagascar coverage : Twilio bills around $0.05-0.08 per SMS to MG
 * numbers (varies by network). At the lead-flow scale of 100-500
 * OTPs / month, monthly bill is ~$5-40 — acceptable launch cost.
 *
 * Cheaper alternative : Africa's Talking ($0.01-0.02 per MG SMS).
 * Both providers slot into the same `SmsProvider` interface — swap
 * in `lib/sms/index.ts` when the cheaper option is ready.
 */
export class TwilioSmsProvider implements SmsProvider {
  readonly name: SmsProviderName = 'twilio'
  private readonly accountSid: string
  private readonly authToken: string
  private readonly from: string

  constructor(cfg: {
    accountSid: string
    authToken: string
    from: string
  }) {
    this.accountSid = cfg.accountSid
    this.authToken = cfg.authToken
    this.from = cfg.from
  }

  async send(msg: SmsMessage): Promise<SmsSendResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
      'base64',
    )
    const params = new URLSearchParams({
      To: msg.to,
      From: this.from,
      Body: msg.body,
    })

    let res: Response
    try {
      res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
    } catch (err) {
      throw new SmsSendError({
        provider: 'twilio',
        code: 'provider_unreachable',
        message: err instanceof Error ? err.message : 'fetch failed',
      })
    }

    if (res.status === 401) {
      throw new SmsSendError({
        provider: 'twilio',
        code: 'provider_unauthorized',
        message: 'Twilio rejected the credentials',
      })
    }
    if (res.status === 429) {
      throw new SmsSendError({
        provider: 'twilio',
        code: 'rate_limited',
        message: 'Twilio rate limit hit',
      })
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      // Common Twilio error : 21211 invalid 'To' number, 21408 unsupported region.
      const isInvalidRecipient = /21211/.test(text)
      const isUnsupportedRegion = /21408/.test(text)
      throw new SmsSendError({
        provider: 'twilio',
        code: isInvalidRecipient
          ? 'invalid_recipient'
          : isUnsupportedRegion
            ? 'unsupported_country'
            : 'unknown',
        message: `Twilio ${res.status} ${text.slice(0, 200)}`,
      })
    }

    const json = (await res.json().catch(() => ({}))) as { sid?: string }
    return { messageId: json.sid ?? null, provider: 'twilio' }
  }
}
