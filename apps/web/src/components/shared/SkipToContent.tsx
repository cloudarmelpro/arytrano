import { getT } from '@/lib/i18n/translate'
import { getLocale } from '@/lib/i18n/get-locale'

/**
 * WCAG 2.1 — Skip-to-main-content link.
 * Hidden visually until focused (first Tab key on a page); clicking jumps
 * past the header/sidebar so keyboard users don't tab through the same
 * nav on every page load.
 *
 * The target `<main id="main">` lives in every section layout.
 */
export async function SkipToContent() {
  const t = getT(await getLocale())
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {t('a11y.skipToContent')}
    </a>
  )
}
