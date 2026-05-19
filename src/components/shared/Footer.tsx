import Link from 'next/link'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import { BrandWordmark } from './BrandWordmark'

export async function Footer() {
  const locale = await getLocale()
  const t = getT(locale)
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-1">
          <BrandWordmark />
          <p className="max-w-xs text-sm text-muted-foreground">
            {t('landing.footer.tagline')}
          </p>
          <div className="mt-2 flex gap-2">
            <StorePill label="iOS · v0.5" sub="Bientôt sur" />
            <StorePill label="Android · v0.5" sub="Bientôt sur" />
          </div>
        </div>

        <FooterColumn title={t('landing.footer.section.product')}>
          <FooterLink href="/annonces" label={t('landing.footer.link.listings')} t={t} />
          <FooterLink href="/quartiers" label={t('landing.footer.link.neighborhoods')} t={t} />
          <FooterLink href="/#how-it-works" label={t('landing.footer.link.howItWorks')} t={t} />
          <FooterLink href="/#faq" label={t('landing.footer.link.faq')} t={t} />
        </FooterColumn>

        <FooterColumn title={t('landing.footer.section.owners')}>
          <FooterLink href="/sign-up?role=OWNER" label={t('landing.footer.link.publishListing')} t={t} />
          <FooterLink href="/dashboard/verify-owner" label={t('landing.footer.link.verification')} t={t} />
          <FooterLink href="/#owner" label={t('landing.footer.link.pricing')} t={t} />
        </FooterColumn>

        <FooterColumn title={t('landing.footer.section.resources')}>
          <FooterLink href="/about" label={t('landing.footer.link.about')} t={t} />
          <FooterLink href="/blog" label={t('landing.footer.link.blog')} t={t} />
          <FooterLink href="/careers" label={t('landing.footer.link.careers')} t={t} />
          <FooterLink href="/press" label={t('landing.footer.link.press')} t={t} />
          <FooterLink href="/security" label={t('landing.footer.link.security')} t={t} />
          <FooterLink href="/status" label={t('landing.footer.link.status')} t={t} />
        </FooterColumn>

        <FooterColumn title={t('landing.footer.section.legal')}>
          <FooterLink href="/legal/terms" label={t('landing.footer.link.terms')} t={t} />
          <FooterLink href="/legal/privacy" label={t('landing.footer.link.privacy')} t={t} />
          <FooterLink href="/legal/cookies" label={t('landing.footer.link.cookies')} t={t} />
          <FooterLink href="/contact" label={t('landing.footer.link.contact')} t={t} />
        </FooterColumn>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          {t('landing.footer.copyright', { year })}
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({
  href,
  label,
  t: _t,
}: {
  href: string
  label: string
  t: Translator
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-foreground transition hover:text-primary"
      >
        {label}
      </Link>
    </li>
  )
}

function StorePill({ label, sub }: { label: string; sub: string }) {
  return (
    <span className="flex items-center gap-2 rounded-md bg-foreground/5 px-3 py-2 text-foreground/80">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] uppercase tracking-wider opacity-70">{sub}</span>
        <span className="text-xs font-semibold">{label}</span>
      </span>
    </span>
  )
}
