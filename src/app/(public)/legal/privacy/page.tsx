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
  { h: 'legal.privacy.s1.h', body: 'legal.privacy.s1.body' },
  { h: 'legal.privacy.s2.h', body: 'legal.privacy.s2.body' },
  { h: 'legal.privacy.s3.h', body: 'legal.privacy.s3.body' },
  { h: 'legal.privacy.s4.h', body: 'legal.privacy.s4.body' },
  { h: 'legal.privacy.s5.h', body: 'legal.privacy.s5.body' },
  { h: 'legal.privacy.s6.h', body: 'legal.privacy.s6.body' },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('legal.privacy.title'),
    description: t('legal.privacy.s1.body'),
    alternates: await localeAlternates('/legal/privacy'),
  }
}

export default async function PrivacyPage() {
  const t = getT(await getLocale())
  return (
    <LegalPageShell
      eyebrow="legal.eyebrow"
      title="legal.privacy.title"
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
