'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useT } from '@/lib/i18n/client'
import type { MessageKey } from '@/lib/i18n/messages'
// Import the action DIRECTLY (not via `@/features/auth` index) — the
// index also re-exports `auth` / `signIn` which depend on `next/headers`
// and would poison this Client Component bundle.
import { signOutAction } from '@/features/auth/actions/sign-out'
import { broadcastAuthChange } from '@/features/auth/lib/broadcast'

type Item = {
  href: string
  labelKey: MessageKey
  icon: React.ReactNode
}

type Section = {
  /** Translation key for the uppercase section label. */
  labelKey: MessageKey
  /** Render this section only for these roles. `null` = everyone. */
  roles: null | UserRole[]
  items: Item[]
}

export type AccountSidebarUser = {
  name: string | null
  email: string
  image: string | null
}

function IconHome() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  )
}

function IconHeart() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconLogOut() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconCog() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

/**
 * Top-level section roots (e.g. `/dashboard`) match only on exact pathname
 * — otherwise their prefix swallows every sub-route and the overview link
 * stays highlighted everywhere.
 */
function isActive(pathname: string, href: string): boolean {
  const isSectionRoot = href.split('/').filter(Boolean).length <= 1
  if (isSectionRoot) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

const SECTIONS: Section[] = [
  {
    labelKey: 'sidebar.section.listings',
    roles: ['OWNER', 'ADMIN'],
    items: [
      {
        href: '/dashboard/listings',
        labelKey: 'sidebar.myListings',
        icon: <IconHome />,
      },
      {
        href: '/dashboard/verify-owner',
        labelKey: 'sidebar.verifyOwner',
        icon: <IconShield />,
      },
    ],
  },
  {
    labelKey: 'sidebar.section.discover',
    roles: null,
    items: [
      { href: '/dashboard/favoris', labelKey: 'sidebar.favorites', icon: <IconHeart /> },
    ],
  },
  {
    labelKey: 'sidebar.section.account',
    roles: null,
    items: [
      { href: '/dashboard/profile', labelKey: 'sidebar.profile', icon: <IconUser /> },
      { href: '/dashboard/settings', labelKey: 'sidebar.security', icon: <IconShield /> },
    ],
  },
]

export function AccountSidebar({
  role,
  user,
}: {
  role: UserRole
  user: AccountSidebarUser
}) {
  const pathname = usePathname()
  const t = useT()

  const visibleSections = SECTIONS.filter(
    (s) => s.roles === null || s.roles.includes(role),
  )

  const firstName = user.name?.trim().split(/\s+/)[0] ?? null
  const initial =
    user.name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase() ?? 'A'

  return (
    <aside className="md:w-60">
      {/* User-info card — matches the inside-page sidebar header from the design ref. */}
      <div className="mb-6 flex items-center gap-3 rounded-md px-2 py-2">
        <Avatar className="h-10 w-10 ring-1 ring-border">
          {user.image && <AvatarImage src={user.image} alt={user.name ?? user.email} />}
          <AvatarFallback className="text-sm font-semibold text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {firstName ?? user.email.split('@')[0]}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Link
          href="/dashboard/profile"
          aria-label={t('sidebar.profile')}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <IconCog />
        </Link>
      </div>

      <nav aria-label={t('sidebar.myAccount')} className="flex flex-col gap-6">
        {visibleSections.map((section) => (
          <div key={section.labelKey} className="flex flex-col gap-2">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              {t(section.labelKey)}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((it) => {
                const active = isActive(pathname, it.href)
                const label = t(it.labelKey)
                return (
                  <li key={it.labelKey}>
                    <Link
                      href={it.href}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 items-center justify-center transition ${
                          active
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      >
                        {it.icon}
                      </span>
                      <span>{label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Sign-out — separated from the nav by a divider, sits at the
           bottom of the sidebar. Server Action triggered via a form so
           it works without client JS and naturally posts CSRF-protected. */}
        <form
          action={signOutAction}
          onSubmit={() => broadcastAuthChange('signout')}
          className="mt-2 border-t border-border pt-4"
        >
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <span className="flex h-5 w-5 items-center justify-center text-muted-foreground transition group-hover:text-destructive">
              <IconLogOut />
            </span>
            <span>{t('sidebar.signOut')}</span>
          </button>
        </form>
      </nav>
    </aside>
  )
}
