import { env } from '@/lib/env'
import { safeJsonLd } from './safe-json-ld'

const BASE_URL = env.AUTH_URL.replace(/\/$/, '')

export type BreadcrumbItem = {
  name: string
  /** Absolute or relative path. Relative paths are resolved against `AUTH_URL`. */
  href: string
}

/**
 * Renders a `BreadcrumbList` JSON-LD `<script>` for the given path.
 * Always prepends a "Home" item pointing at `/`. The caller passes
 * the trail from the home down to (but not including) the current page,
 * plus the current page as the last item — the current page's `href`
 * is the URL that goes into Schema.org's `item` field.
 *
 * Server-side only — emits no client JS.
 */
export function BreadcrumbJsonLd({
  homeLabel,
  trail,
}: {
  homeLabel: string
  trail: BreadcrumbItem[]
}) {
  const items = [{ name: homeLabel, href: '/' }, ...trail]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.href.startsWith('http') ? it.href : `${BASE_URL}${it.href}`,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
    />
  )
}
