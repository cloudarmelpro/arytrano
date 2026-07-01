import type { ReactNode } from 'react'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Shared shell for the 4 legal pages (CGU, Privacy, Cookies, Mentions).
 * Renders a serif H1, a last-updated chip, and a draft banner above
 * the page body. The banner makes it explicit to visitors AND search
 * engines that this content is provisional pending legal review.
 */
export async function LegalPageShell({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: MessageKey
  title: MessageKey
  lastUpdated: string
  children: ReactNode
}) {
  const locale = await getLocale()
  const t = getT(locale)
  return (
    <article className="bg-background">
      <header className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-[760px] px-6 py-14 lg:py-16">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
            {t(eyebrow)}
          </span>
          <h1 className="mt-3 text-[clamp(32px,3.6vw,48px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
            {t(title)}
          </h1>
          <p className="mt-3 text-[13.5px] font-medium text-muted-foreground">
            {t('legal.lastUpdated', { date: lastUpdated })}
          </p>
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13.5px] leading-[1.5] text-amber-900">
            {t('legal.draftNotice')}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[760px] px-6 py-12 lg:py-16">
        <div className="prose prose-neutral max-w-none">
          {children}
        </div>
      </div>
    </article>
  )
}

export function LegalSection({
  heading,
  children,
}: {
  heading: MessageKey | string
  children: ReactNode
}) {
  return (
    <section className="mb-10 last:mb-0">
      <h2 className="mb-3 text-[20px] font-bold leading-[1.3] tracking-[-0.01em] text-foreground sm:text-[22px]">
        {heading}
      </h2>
      <div className="flex flex-col gap-3 text-[15px] leading-[1.65] text-foreground/80">
        {children}
      </div>
    </section>
  )
}
