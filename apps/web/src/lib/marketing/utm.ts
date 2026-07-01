/**
 * MKT-09 — UTM tag helpers. Any outbound link the platform generates
 * (WhatsApp share, Facebook post, email digest CTA, Telegram bot)
 * MUST flow through `withUtm()` so we can measure inbound attribution
 * with Sentry breadcrumbs / server logs later.
 *
 * Existing marketing outputs that must adopt this:
 *   - Weekly owner digest CTA (OWN-04) — `source=email`, `medium=digest`
 *   - Interest lead confirm email — `source=email`, `medium=confirmation`
 *   - Concierge WhatsApp templates (MKT-14) — `source=whatsapp`
 *   - Auto-social posts (OWN-01/02/03) — `source=facebook|instagram|telegram`
 */

export type UtmParams = {
  source: string
  medium: string
  campaign?: string
  content?: string
  term?: string
}

const RESERVED_KEYS = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'])

/**
 * Append UTM query params to a URL. Preserves any existing query
 * string, and overwrites conflicting utm_* params so the freshest
 * intent wins. Never mutates the input.
 */
export function withUtm(url: string, utm: UtmParams): string {
  try {
    // The URL constructor requires an absolute base; assume https for
    // relative inputs so tests + templates that pass "/dashboard"
    // still work.
    const base = url.startsWith('http') ? url : `https://arytrano.com${url.startsWith('/') ? '' : '/'}${url}`
    const parsed = new URL(base)

    for (const key of RESERVED_KEYS) parsed.searchParams.delete(key)
    parsed.searchParams.set('utm_source', utm.source)
    parsed.searchParams.set('utm_medium', utm.medium)
    if (utm.campaign) parsed.searchParams.set('utm_campaign', utm.campaign)
    if (utm.content) parsed.searchParams.set('utm_content', utm.content)
    if (utm.term) parsed.searchParams.set('utm_term', utm.term)

    // Preserve relative shape when the caller passed a path.
    if (url.startsWith('/')) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Bulk-tag a mapping of relative paths (used in email templates)
 * with the same UTM triplet. Returns a new object; leaves keys
 * whose value is not a string untouched.
 */
export function tagLinks<T extends Record<string, unknown>>(
  links: T,
  utm: UtmParams,
): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(links)) {
    out[k] = typeof v === 'string' ? withUtm(v, utm) : v
  }
  return out as T
}
