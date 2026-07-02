import 'server-only'
import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'
import { withUtm } from '@/lib/marketing/utm'

/**
 * OWN-03 — post a listing announcement to the Telegram channel.
 * Uses the Bot API `sendMessage` with parse_mode=Markdown. No-op
 * when the two env vars are absent so dev / preview don't spam a
 * production channel.
 */
export type TelegramListingPayload = {
  title: string
  citySlug: string
  neighborhoodSlug: string
  slug: string
  priceMonthlyMGA: number
  neighborhoodName: string
  cityName: string
}

const API_TIMEOUT_MS = 4000

export async function broadcastListingToTelegram(
  payload: TelegramListingPayload,
): Promise<void> {
  const token = env.TELEGRAM_BOT_TOKEN
  const channel = env.TELEGRAM_CHANNEL_ID
  if (!token || !channel) return

  const baseUrl = env.AUTH_URL.replace(/\/$/, '')
  const link = withUtm(
    `${baseUrl}/${payload.citySlug}/${payload.neighborhoodSlug}/${payload.slug}`,
    { source: 'telegram', medium: 'social', campaign: 'auto-share' },
  )
  const priceLine = `${payload.priceMonthlyMGA.toLocaleString('fr-FR')} Ar / mois`
  const text = [
    `🏠 *${escapeMarkdown(payload.title)}*`,
    `📍 ${escapeMarkdown(payload.neighborhoodName)}, ${escapeMarkdown(payload.cityName)}`,
    `💰 ${priceLine}`,
    ``,
    link,
  ].join('\n')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: channel,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: false,
        }),
        signal: controller.signal,
      },
    )
    if (!res.ok) {
      Sentry.captureMessage('telegram broadcast failed', {
        level: 'warning',
        tags: { feature: 'telegram', status: String(res.status) },
      })
    }
  } catch (err) {
    Sentry.captureException(err, {
      tags: { feature: 'telegram', step: 'send' },
    })
  } finally {
    clearTimeout(timer)
  }
}

/** Minimal Markdown v1 escape — we only send safe fields. */
function escapeMarkdown(s: string): string {
  return s.replace(/[_*[`]/g, (c) => `\\${c}`)
}
