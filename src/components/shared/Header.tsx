import Link from 'next/link'
import { auth } from '@/features/auth'
import { getProfile } from '@/features/auth/services/update-profile'
import { getLocale } from '@/lib/i18n/get-locale'
import { getT } from '@/lib/i18n/translate'
import { BrandWordmark } from './BrandWordmark'
import { LocaleSwitcher } from './LocaleSwitcher'
import { HeaderAvatarMenu } from './HeaderAvatarMenu'

export async function Header() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const t = getT(locale)
  const user = session?.user

  // Fetch avatar + name only when there's a session — keeps anonymous
  // page loads from doing a DB round trip just to render the header.
  const profile = user ? await getProfile(user.id) : null

  return (
    // Sticky + backdrop-blur ("glass" effect) — modern, stays visible
    // on scroll, no bottom border (design choice for airy feel).
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandWordmark />
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 sm:flex">
            <Link
              href="/annonces"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {t('header.nav.listings')}
            </Link>
            <Link
              href="/quartiers"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {t('header.nav.quartiers')}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />

          {user && profile ? (
            <HeaderAvatarMenu
              name={profile.name}
              email={profile.email}
              image={profile.image}
              role={user.role}
            />
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:shadow-md hover:opacity-90"
            >
              {t('header.signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
