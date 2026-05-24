import 'server-only'
import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { env } from '@/lib/env'

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

  const result = await transport.sendMail({
    from,
    to: input.to,
    subject: safeSubject,
    html: input.html,
    text: input.text ?? input.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  })

  return { id: result.messageId }
}
