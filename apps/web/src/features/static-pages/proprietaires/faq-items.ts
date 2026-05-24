import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Single source of truth for the /proprietaires FAQ list.
 *
 * Consumed by:
 *   - `app/(public)/proprietaires/page.tsx` — feeds the FAQPage JSON-LD
 *     for Google's rich-result snippet
 *   - `ProprietairesPage.tsx` → `ProprietairesFaqAccordion` — renders
 *     the visible UI
 *
 * Keeping both call sites pointed at this array prevents the JSON-LD
 * and the visible text from drifting when one is updated and the
 * other forgotten.
 */
export const PROPRIETAIRES_FAQ_ITEMS: ReadonlyArray<{
  q: MessageKey
  a: MessageKey
}> = [
  { q: 'proprietaires.faq.q1.q', a: 'proprietaires.faq.q1.a' },
  { q: 'proprietaires.faq.q2.q', a: 'proprietaires.faq.q2.a' },
  { q: 'proprietaires.faq.q3.q', a: 'proprietaires.faq.q3.a' },
  { q: 'proprietaires.faq.q4.q', a: 'proprietaires.faq.q4.a' },
  { q: 'proprietaires.faq.q5.q', a: 'proprietaires.faq.q5.a' },
  { q: 'proprietaires.faq.q6.q', a: 'proprietaires.faq.q6.a' },
]
