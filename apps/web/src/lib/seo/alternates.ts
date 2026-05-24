import 'server-only'
import { getLocale } from '@/lib/i18n/get-locale'

/**
 * Build the `alternates` metadata block for a public page so Google
 * understands the `/mg/...` variant exists and indexes both languages.
 *
 * Pass the FR-canonical path (without `/mg` prefix); the helper reads the
 * current request locale to make the canonical SELF-REFERENTIAL — Google
 * indexes `/annonces` and `/mg/annonces` as DISTINCT pages that are
 * `hreflang` alternates of each other. If we canonical-pointed every MG
 * page back to FR, Google would deindex the MG version entirely.
 *
 * For the home page pass `'/'`. The MG mirror resolves to `/mg/`.
 */
export async function localeAlternates(path: string) {
  const locale = await getLocale()
  const fr = path
  const mg = path === '/' ? '/mg/' : `/mg${path}`
  return {
    canonical: locale === 'mg' ? mg : fr,
    languages: {
      'fr-MG': fr,
      mg,
      // `x-default` tells Google what to serve when no language matches —
      // we point it at FR (broader audience than MG).
      'x-default': fr,
    },
  }
}
