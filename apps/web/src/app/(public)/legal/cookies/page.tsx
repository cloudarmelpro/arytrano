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
  { h: 'legal.cookies.s1.h', body: 'legal.cookies.s1.body' },
  { h: 'legal.cookies.s2.h', body: 'legal.cookies.s2.body' },
  { h: 'legal.cookies.s3.h', body: 'legal.cookies.s3.body' },
  { h: 'legal.cookies.s4.h', body: 'legal.cookies.s4.body' },
  { h: 'legal.cookies.s5.h', body: 'legal.cookies.s5.body' },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('legal.cookies.title'),
    description: t('legal.cookies.s1.body'),
    alternates: await localeAlternates('/legal/cookies'),
  }
}

export default async function CookiesPage() {
  const t = getT(await getLocale())
  return (
    <LegalPageShell
      eyebrow="legal.eyebrow"
      title="legal.cookies.title"
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
