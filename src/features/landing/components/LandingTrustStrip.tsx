import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { Icon, type IconName } from '@/components/shared/Icon'

const ITEMS: Array<{
  icon: IconName
  title: MessageKey
  subtitle: MessageKey
}> = [
  {
    icon: 'shield',
    title: 'landing.trust.verified.title',
    subtitle: 'landing.trust.verified.subtitle',
  },
  {
    icon: 'eye',
    title: 'landing.trust.photos.title',
    subtitle: 'landing.trust.photos.subtitle',
  },
  {
    icon: 'whatsapp',
    title: 'landing.trust.contact.title',
    subtitle: 'landing.trust.contact.subtitle',
  },
  {
    icon: 'check',
    title: 'landing.trust.price.title',
    subtitle: 'landing.trust.price.subtitle',
  },
]

export function LandingTrustStrip({ locale }: { locale: Locale }) {
  const t = getT(locale)
  return (
    <section className="border-b border-border bg-background py-10 lg:py-12">
      <div className="mx-auto grid max-w-[1280px] gap-6 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {ITEMS.map((it) => (
          <article key={it.title} className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon name={it.icon} size={20} />
            </span>
            <div>
              <div className="text-[14.5px] font-bold text-foreground">
                {t(it.title)}
              </div>
              <div className="mt-0.5 text-[13px] font-medium text-muted-foreground">
                {t(it.subtitle)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
