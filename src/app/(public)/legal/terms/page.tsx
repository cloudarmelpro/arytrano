import type { Metadata } from 'next'
import {
  LegalPageShell,
  LegalSection,
} from '@/components/shared/LegalPageShell'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import type { MessageKey } from '@/lib/i18n/messages'

const LAST_UPDATED = '2026-05-19'

const SECTIONS: Array<{ h: MessageKey; body: MessageKey }> = [
  { h: 'legal.terms.s1.h', body: 'legal.terms.s1.body' },
  { h: 'legal.terms.s2.h', body: 'legal.terms.s2.body' },
  { h: 'legal.terms.s3.h', body: 'legal.terms.s3.body' },
  { h: 'legal.terms.s4.h', body: 'legal.terms.s4.body' },
  { h: 'legal.terms.s5.h', body: 'legal.terms.s5.body' },
  { h: 'legal.terms.s6.h', body: 'legal.terms.s6.body' },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('legal.terms.title'),
    description: t('legal.terms.s1.body'),
    alternates: await localeAlternates('/legal/terms'),
  }
}

export default async function TermsPage() {
  const t = getT(await getLocale())
  return (
    <LegalPageShell
      eyebrow="legal.eyebrow"
      title="legal.terms.title"
      lastUpdated={LAST_UPDATED}
    >
      {SECTIONS.map((s) => (
        <LegalSection key={s.h} heading={t(s.h)}>
          <p>{t(s.body)}</p>
        </LegalSection>
      ))}
    </LegalPageShell>
  )
}
