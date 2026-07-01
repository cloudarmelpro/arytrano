import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'

/**
 * Eyebrow + H1 + sub for `/comment-ca-marche`. Extracted out of
 * `CommentClient` so the H1 lives in a Server Component — crawlers
 * see it in the static HTML without executing the audience-toggle
 * client island.
 */
export function CommentHero({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="bg-background pt-16 pb-6 text-center lg:pt-20 lg:pb-8">
      <div className="mx-auto max-w-[920px] px-6 lg:px-10">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary">
          {t('comment.eyebrow')}
        </span>
        <h1 className="mt-3.5 mb-5 text-[clamp(36px,4.6vw,64px)] font-normal leading-[1.05] tracking-[-0.025em] text-foreground">
          {t('comment.h1.lead')}{' '}
          <em className="italic text-primary">
            {t('comment.h1.accent')}
          </em>
        </h1>
        <p className="mx-auto max-w-[720px] text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
          {t('comment.sub')}
        </p>
      </div>
    </section>
  )
}
