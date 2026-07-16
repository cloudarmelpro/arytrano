/**
 * Fable-audit SEO P0-2 (2026-07-02) — Next.js metadata SHALLOW-merges
 * `openGraph`: any page that sets its own openGraph fully replaces the
 * layout's — including `images`, `siteName`, `locale`. Every page must
 * spread these defaults into its openGraph return so shares don't
 * degrade to a bare card.
 *
 * Usage :
 *   openGraph: { ...ogDefaults, title, description, url, type }
 */
export const ogDefaults: {
  siteName: string
  locale: string
  alternateLocale: string[]
  images: Array<{ url: string; width: number; height: number; alt: string }>
} = {
  siteName: 'AryTrano',
  locale: 'fr_MG',
  alternateLocale: ['mg_MG'],
  images: [
    { url: '/images/arytrano.webp', width: 1200, height: 630, alt: 'AryTrano' },
  ],
}
