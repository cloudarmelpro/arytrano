import 'server-only'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { env } from '@/lib/env'

// Security audit H-3 (2026-05-29) — control-char set used for the `to`
// field in `sendEmail`. Built via `new RegExp` so the source stays
// readable (no embedded control chars in the file). Mirrors the
// `sanitizeEmailHeaderValue` helper but no length cap (RFC 5321 allows
// up to 320 chars for an address).
const TO_UNSAFE = new RegExp('[\\r\\n\\t\\u0000\\u2028\\u2029]+', 'g')

let cached: Transporter | null = null

function getTransport(): Transporter | null {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return null
  if (!cached) {
    cached = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
    })
  }
  return cached
}

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  text?: string
  /**
   * Fable-audit L1 — optional extra headers. Newsletter uses
   * `List-Unsubscribe` + `List-Unsubscribe-Post` so Gmail/Yahoo can
   * surface a one-click unsubscribe UI. Whitelist below prevents
   * anything else being injected — the field is app-controlled so a
   * closed set stays tight.
   */
  headers?: Partial<Record<'List-Unsubscribe' | 'List-Unsubscribe-Post', string>>
}

export async function sendEmail(input: SendEmailInput): Promise<{ id?: string; skipped?: true }> {
  const transport = getTransport()
  const from = env.EMAIL_FROM ?? env.GMAIL_USER

  if (!transport || !from) {
    if (env.NODE_ENV !== 'production') {
      console.warn(
        `\n[email] Gmail SMTP not configured — would have sent:\n` +
          `  to:      ${input.to}\n` +
          `  subject: ${input.subject}\n` +
          `  preview: ${input.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)}\n`,
      )
      return { skipped: true }
    }
    throw new Error('Email not configured: set GMAIL_USER and GMAIL_APP_PASSWORD')
  }

  // Strip CR / LF from subject — defense against header-injection via any
  // user-supplied data interpolated into the subject template (CRLF in title
  // could inject Bcc:/Content-Type: headers in some SMTP transports).
  const safeSubject = input.subject.replace(/[\r\n]+/g, ' ').slice(0, 200)

  // Security audit H-3 — strip CRLF + tab + NUL + U+2028/9 from the
  // `to` address before nodemailer touches it. Modern nodemailer does
  // its own validation, but defense-in-depth: any future code path
  // that builds `to` by concatenation (e.g. a name + bracketed
  // address pair) would re-open the CRLF vector. See TO_UNSAFE above.
  const safeTo = input.to.replace(TO_UNSAFE, '').trim()

  // Fable-audit L1 — sanitize whitelisted headers (List-Unsubscribe
   // etc.) the same way as subject/to before passing to nodemailer.
  const safeHeaders: Record<string, string> = {}
  if (input.headers) {
    for (const [k, v] of Object.entries(input.headers)) {
      if (typeof v === 'string') {
        safeHeaders[k] = v.replace(/[\r\n]+/g, ' ').slice(0, 500)
      }
    }
  }

  const result = await transport.sendMail({
    from,
    to: safeTo,
    subject: safeSubject,
    html: input.html,
    text: input.text ?? input.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    ...(Object.keys(safeHeaders).length > 0 && { headers: safeHeaders }),
  })

  return { id: result.messageId }
}
