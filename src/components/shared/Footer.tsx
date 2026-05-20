import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import { LocaleSwitcher } from './LocaleSwitcher'
import { Icon, type IconName } from './Icon'
import { WhatsAppAlertForm } from '@/features/alerts'

type Column = {
  head: MessageKey
  items: Array<{ label: MessageKey; href: string }>
}

const COLUMNS: Column[] = [
  {
    head: 'footerV3.col.product',
    items: [
      { label: 'footerV3.link.viewListings', href: '/annonces' },
      { label: 'footerV3.link.howItWorks', href: '/comment-ca-marche' },
      { label: 'footerV3.link.quartiers', href: '/quartiers' },
      { label: 'footerV3.link.faq', href: '/#faq' },
    ],
  },
  {
    head: 'footerV3.col.owners',
    items: [
      { label: 'footerV3.link.publishListing', href: '/proprietaires' },
      { label: 'footerV3.link.verification', href: '/proprietaires#verif' },
      { label: 'footerV3.link.pricing', href: '/proprietaires#tarifs' },
      { label: 'footerV3.link.resources', href: '#' },
    ],
  },
  {
    head: 'footerV3.col.about',
    items: [
      { label: 'footerV3.link.about', href: '/about' },
      { label: 'footerV3.link.contact', href: '/contact' },
      { label: 'footerV3.link.blog', href: '/blog' },
      { label: 'footerV3.link.careers', href: '/careers' },
    ],
  },
  {
    head: 'footerV3.col.legal',
    items: [
      { label: 'footerV3.link.terms', href: '/legal/terms' },
      { label: 'footerV3.link.privacy', href: '/legal/privacy' },
      { label: 'footerV3.link.cookies', href: '/legal/cookies' },
      { label: 'footerV3.link.mentions', href: '/legal/mentions' },
    ],
  },
]

type PaymentBrand = {
  key: MessageKey
  /** Real brand logo from `/public/payments/`. */
  logo?: string
  /** Logo aspect-driven width when rendered at 24px height. */
  logoWidth?: number
  icon?: IconName
}

const PAYMENTS: PaymentBrand[] = [
  { key: 'footerV3.pay.mvola', logo: '/payments/Mvola.svg', logoWidth: 76 },
  { key: 'footerV3.pay.orangeMoney', logo: '/payments/Orange.svg', logoWidth: 76 },
  { key: 'footerV3.pay.airtelMoney', logo: '/payments/Airtel.svg', logoWidth: 76 },
  { key: 'footerV3.pay.bankTransfer', icon: 'building' },
  { key: 'footerV3.pay.cash', icon: 'wallet' },
]

const SOCIAL: Array<{ icon: IconName; label: string; href: string }> = [
  { icon: 'whatsapp', label: 'WhatsApp Channel', href: '#' },
  { icon: 'facebook', label: 'Facebook', href: '#' },
  { icon: 'instagram', label: 'Instagram', href: '#' },
  { icon: 'tiktok', label: 'TikTok', href: '#' },
]

export async function Footer() {
  const locale = await getLocale()
  const t = getT(locale)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <NewsletterBlock t={t} />
      <MainGrid t={t} />
      <PaymentsRow t={t} />
      <BottomStrip t={t} year={year} />
    </footer>
  )
}

function NewsletterBlock({ t }: { t: Translator }) {
  return (
    <div className="mx-auto grid max-w-[1280px] items-center gap-14 border-b border-border px-6 py-14 lg:grid-cols-[1.2fr_1fr] lg:px-10">
      <div>
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-primary">
          {t('footerV3.newsletter.eyebrow')}
        </div>
        <h3 className="mt-3.5 max-w-[480px] font-serif text-[28px] font-normal leading-[1.1] tracking-[-0.02em] text-foreground max-sm:text-[22px]">
          {t('footerV3.newsletter.title')}
        </h3>
        <p className="mt-2 max-w-[460px] text-[14px] leading-[1.55] text-foreground/70">
          {t('footerV3.newsletter.lead')}
        </p>
      </div>
      <WhatsAppAlertForm />
    </div>
  )
}

function MainGrid({ t }: { t: Translator }) {
  return (
    <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-14 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] lg:px-10 max-lg:grid-cols-[1.4fr_1fr_1fr] max-md:grid-cols-2 max-sm:grid-cols-1">
      <div className="lg:col-span-1 max-lg:col-span-full">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-foreground no-underline"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/arytrano-mark.svg"
            alt="AryTrano"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-[20px] font-bold tracking-[-0.02em]">AryTrano</span>
        </Link>
        <p className="mt-4 max-w-[280px] text-[13.5px] leading-[1.6] text-foreground/70">
          {t('footerV3.tagline')}
        </p>
        <Link
          href="#"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5 text-[12px] font-semibold text-foreground transition hover:bg-muted/60"
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_3px_oklch(0.65_0.18_152_/_0.2)]"
          />
          {t('footerV3.status.allOperational')}
        </Link>
        <div className="mt-4">
          <LocaleSwitcher />
        </div>
        <div className="mt-5 flex gap-2">
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-muted/40 text-foreground/70 transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Icon name={s.icon} size={16} />
            </a>
          ))}
        </div>
      </div>

      {COLUMNS.map((col) => (
        <div key={col.head}>
          <div className="mb-4 text-[12.5px] font-bold uppercase tracking-[0.08em] text-foreground">
            {t(col.head)}
          </div>
          <ul className="flex flex-col gap-2.5">
            {col.items.map((it) => (
              <li key={it.label}>
                <Link
                  href={it.href}
                  className="text-[13.5px] font-medium text-foreground/70 transition hover:text-primary"
                >
                  {t(it.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function PaymentsRow({ t }: { t: Translator }) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-6 border-t border-border px-6 py-6 lg:px-10">
      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground/70">
        {t('footerV3.pay.label')}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {PAYMENTS.map((p) => {
          const label = t(p.key)
          if (p.logo) {
            return (
              <span
                key={p.key}
                className="inline-flex h-9 items-center rounded-md border border-border bg-white px-2.5"
                title={label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logo}
                  alt={label}
                  height={24}
                  width={p.logoWidth ?? 76}
                  className="h-6 w-auto"
                />
              </span>
            )
          }
          return (
            <span
              key={p.key}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-muted/40 px-3 text-[12px] font-semibold text-foreground/80"
            >
              {p.icon && <Icon name={p.icon} size={13} />}
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function BottomStrip({ t, year }: { t: Translator; year: number }) {
  const bottomLinks: Array<{ key: MessageKey; href: string }> = [
    { key: 'footerV3.bottom.status', href: '#' },
    { key: 'footerV3.bottom.security', href: '/security' },
    { key: 'footerV3.bottom.press', href: '/press' },
    { key: 'footerV3.bottom.sitemap', href: '/sitemap.xml' },
  ]
  return (
    <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-5 pb-7 text-[12.5px] font-medium lg:px-10">
      <div className="flex flex-wrap items-center gap-4 text-foreground/70">
        <span>{t('footerV3.bottom.copyright', { year })}</span>
        <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
        <span className="inline-flex items-center gap-1.5">
          <Icon name="pin" size={12} /> {t('footerV3.bottom.madeIn')}
        </span>
      </div>
      <div className="flex flex-wrap gap-5">
        {bottomLinks.map((l) => (
          <Link
            key={l.key}
            href={l.href}
            className="text-foreground/70 no-underline transition hover:text-primary"
          >
            {t(l.key)}
          </Link>
        ))}
      </div>
    </div>
  )
}
