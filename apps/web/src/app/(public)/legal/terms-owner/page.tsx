import type { Metadata } from 'next'
import {
  LegalPageShell,
  LegalSection,
} from '@/components/shared/LegalPageShell'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { localeAlternates } from '@/lib/seo/alternates'
import type { MessageKey } from '@/lib/i18n/messages'

const LAST_UPDATED = '2026-05-29'

const SECTIONS: Array<{
  h: MessageKey
  body: MessageKey
  /** Renders the section with the amber highlight callout style — used
   *  for the section §5 "obligation de transparence" so it cannot be
   *  visually skipped on the long-form legal page. */
  highlight?: boolean
}> = [
  { h: 'legal.termsOwner.s1.h', body: 'legal.termsOwner.s1.body' },
  { h: 'legal.termsOwner.s2.h', body: 'legal.termsOwner.s2.body' },
  { h: 'legal.termsOwner.s3.h', body: 'legal.termsOwner.s3.body' },
  { h: 'legal.termsOwner.s4.h', body: 'legal.termsOwner.s4.body' },
  {
    h: 'legal.termsOwner.s5.h',
    body: 'legal.termsOwner.s5.body',
    highlight: true,
  },
  { h: 'legal.termsOwner.s6.h', body: 'legal.termsOwner.s6.body' },
  { h: 'legal.termsOwner.s7.h', body: 'legal.termsOwner.s7.body' },
  { h: 'legal.termsOwner.s8.h', body: 'legal.termsOwner.s8.body' },
  { h: 'legal.termsOwner.s9.h', body: 'legal.termsOwner.s9.body' },
]

export async function generateMetadata(): Promise<Metadata> {
  const t = getT(await getLocale())
  return {
    title: t('legal.termsOwner.title'),
    description: t('legal.termsOwner.preambule'),
    alternates: await localeAlternates('/legal/terms-owner'),
  }
}

export default async function TermsOwnerPage() {
  const t = getT(await getLocale())
  return (
    <LegalPageShell
      eyebrow="legal.eyebrow"
      title="legal.termsOwner.title"
      lastUpdated={LAST_UPDATED}
    >
      <LegalSection heading={t('legal.termsOwner.preambule.h')}>
        <p>{t('legal.termsOwner.preambule')}</p>
      </LegalSection>
      {SECTIONS.map((s) => (
        <LegalSection key={s.h} heading={t(s.h)}>
          {s.highlight ? (
            <div className="not-prose rounded-2xl border border-amber-300/60 bg-amber-50/70 p-5">
              <p className="text-[14.5px] leading-[1.65] text-amber-950/90 whitespace-pre-line">
                {t(s.body)}
              </p>
            </div>
          ) : (
            <p className="whitespace-pre-line">{t(s.body)}</p>
          )}
        </LegalSection>
      ))}
    </LegalPageShell>
  )
}
