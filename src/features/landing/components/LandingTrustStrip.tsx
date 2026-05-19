import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'

/**
 * Trust strip directly under the hero (T-042). Four icon+label cards
 * communicating the differentiators vs Facebook Marketplace (which is
 * the de-facto competitor in Madagascar): identity verification, photo
 * protection, direct contact, transparent pricing.
 *
 * RSC — no client JS needed (no interaction, no hover state beyond CSS).
 */
export function LandingTrustStrip({ locale }: { locale: Locale }) {
  const t = getT(locale)
  const cards: Array<{
    titleKey: MessageKey
    bodyKey: MessageKey
    icon: React.ReactNode
  }> = [
    {
      titleKey: 'landing.trust.verified.title',
      bodyKey: 'landing.trust.verified.subtitle',
      icon: <ShieldIcon />,
    },
    {
      titleKey: 'landing.trust.photos.title',
      bodyKey: 'landing.trust.photos.subtitle',
      icon: <CameraIcon />,
    },
    {
      titleKey: 'landing.trust.contact.title',
      bodyKey: 'landing.trust.contact.subtitle',
      icon: <ChatIcon />,
    },
    {
      titleKey: 'landing.trust.price.title',
      bodyKey: 'landing.trust.price.subtitle',
      icon: <CoinIcon />,
    },
  ]
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-14 lg:grid-cols-4">
        {cards.map((c) => (
          <TrustCard
            key={c.titleKey}
            title={t(c.titleKey)}
            body={t(c.bodyKey)}
            icon={c.icon}
          />
        ))}
      </div>
    </section>
  )
}

function TrustCard({
  title,
  body,
  icon,
}: {
  title: string
  body: string
  icon: React.ReactNode
}) {
  return (
    <article className="flex flex-col gap-2">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </article>
  )
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
      <path d="M12 6v2m0 8v2" />
    </svg>
  )
}
