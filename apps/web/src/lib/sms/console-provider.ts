import 'server-only'
import type {
  SmsMessage,
  SmsProvider,
  SmsProviderName,
  SmsSendResult,
} from './types'

/**
 * Dev / test SMS provider — logs the payload to stdout and pretends
 * everything went fine. Lets local development of the OTP flow work
 * without burning real SMS credits or signing a provider contract.
 *
 * IMPORTANT : never use in production. The selector in `lib/sms/
 * index.ts` rejects this provider when `NODE_ENV === 'production'`
 * unless `SMS_PROVIDER=console` is set EXPLICITLY (escape hatch for
 * an emergency dry-run).
 */
export class ConsoleSmsProvider implements SmsProvider {
  readonly name: SmsProviderName = 'console'

  async send(msg: SmsMessage): Promise<SmsSendResult> {
    console.log(
      [
        '',
        '────────────────  📱 [sms-console]  ────────────────',
        `  TO   : ${msg.to}`,
        `  BODY : ${msg.body}`,
        '────────────────────────────────────────────────────',
        '',
      ].join('\n'),
    )
    return { messageId: null, provider: 'console' }
  }
}
