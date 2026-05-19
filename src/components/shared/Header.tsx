import Link from 'next/link'
import { auth } from '@/features/auth'
import { getProfile } from '@/features/auth/services/update-profile'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT, type Translator } from '@/lib/i18n/translate'
import type { Locale } from '@/lib/i18n/config'
import { LocaleSwitcher } from './LocaleSwitcher'
import { HeaderAvatarMenu } from './HeaderAvatarMenu'
import { Icon, type IconName } from './Icon'
import { HeaderPrimaryNav, type NavEntry } from './HeaderPrimaryNav'

type NavConfig = {
  id: string
  href: string
  labelKey:
    | 'header.nav.listings'
    | 'header.nav.quartiers'
    | 'header.nav.howItWorks'
    | 'header.nav.owners'
  icon: IconName
}

const NAV_CONFIG: NavConfig[] = [
  { id: 'annonces', href: '/annonces', labelKey: 'header.nav.listings', icon: 'home-heart' },
  { id: 'quartiers', href: '/quartiers', labelKey: 'header.nav.quartiers', icon: 'pin' },
  { id: 'how', href: '/comment-ca-marche', labelKey: 'header.nav.howItWorks', icon: 'help' },
  { id: 'owners', href: '/proprietaires', labelKey: 'header.nav.owners', icon: 'building' },
]

export async function Header() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const t = getT(locale)
  const user = session?.user
  const profile = user ? await getProfile(user.id) : null
  const navItems: NavEntry[] = NAV_CONFIG.map((n) => ({
    id: n.id,
    href: n.href,
    label: t(n.labelKey),
    icon: n.icon,
  }))

  return (
    <header className="relative z-10">
      <UtilityStrip t={t} />
      <BrandRow
        locale={locale}
        t={t}
        user={
          user && profile
            ? {
                name: profile.name,
                email: profile.email,
                image: profile.image,
                role: user.role,
              }
            : null
        }
      />
      <HeaderPrimaryNav items={navItems} />
    </header>
  )
}

function UtilityStrip({ t }: { t: Translator }) {
  return (
    <div className="hidden bg-[oklch(0.16_0.04_277)] text-white/80 sm:block">
      <div className="mx-auto flex max-w-[1280px] items-center justify-end gap-7 px-6 py-2 text-[12.5px] font-medium lg:px-10">
        <Link
          href="/sign-up?role=OWNER"
          className="text-white/85 transition hover:text-white"
        >
          {t('header.topbar.becomeOwner')}
        </Link>
        <span aria-hidden className="h-3.5 w-px bg-white/15" />
        <Link
          href="/#faq"
          className="inline-flex items-center gap-1.5 text-white/85 transition hover:text-white"
        >
          <Icon name="help" size={14} /> {t('header.topbar.help')}
        </Link>
        <span aria-hidden className="h-3.5 w-px bg-white/15" />
        <Link
          href="/dashboard"
          className="text-white/85 transition hover:text-white"
        >
          {t('header.topbar.studentSpace')}
        </Link>
      </div>
    </div>
  )
}

function BrandRow({
  locale,
  t,
  user,
}: {
  locale: Locale
  t: Translator
  user: {
    name: string | null
    email: string
    image: string | null
    role: 'STUDENT' | 'OWNER' | 'ADMIN'
  } | null
}) {
  return (
    <div className="bg-primary text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 pt-4 pb-3.5 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-3 text-white no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/arytrano-mark-light.svg"
            alt=""
            width={38}
            height={38}
            className="h-[38px] w-[38px]"
          />
          <span className="text-[19px] font-bold tracking-[-0.02em]">AryTrano</span>
        </Link>
        <div className="flex items-center gap-5 max-lg:gap-3">
          <span className="hidden items-center gap-2 text-[13px] text-white/90 lg:inline-flex">
            <LocaleSwitcher dark />
          </span>
          <Link
            href="/dashboard/favoris"
            className="hidden items-center gap-1.5 text-[14px] font-medium text-white/90 transition hover:text-white lg:inline-flex"
          >
            <Icon name="heart" size={16} /> {t('header.action.favorites')}
          </Link>
          <Link
            href="/dashboard"
            className="hidden items-center gap-1.5 text-[14px] font-medium text-white/90 transition hover:text-white lg:inline-flex"
          >
            <Icon name="calendar" size={16} /> {t('header.action.reservations')}
          </Link>
          {user ? (
            <HeaderAvatarMenu
              name={user.name}
              email={user.email}
              image={user.image}
              role={user.role}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-up"
                className="hidden h-[38px] items-center rounded-[10px] bg-transparent px-4 text-[13.5px] font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.36)] transition hover:bg-white/10 sm:inline-flex"
              >
                {t('header.cta.signUp')}
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-[38px] items-center rounded-[10px] bg-white px-4 text-[13.5px] font-semibold text-primary transition hover:bg-[oklch(0.97_0.012_90)]"
              >
                {t('header.signIn')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

