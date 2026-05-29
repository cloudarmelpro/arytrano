'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { UserRole } from '@prisma/client'
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

function IconBookmark() {
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
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
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

function IconFileSignature() {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 18s.5-2 2-2 2 2 4 2" />
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
        href: '/dashboard/leases',
        labelKey: 'sidebar.myLeases',
        icon: <IconFileSignature />,
      },
      {
        href: '/dashboard/verify-owner',
        labelKey: 'sidebar.verifyOwner',
        icon: <IconShield />,
      },
    ],
  },
  {
    labelKey: 'sidebar.section.tenant',
    roles: ['STUDENT'],
    items: [
      {
        href: '/dashboard/leases',
        labelKey: 'sidebar.myLeases',
        icon: <IconFileSignature />,
      },
    ],
  },
  {
    labelKey: 'sidebar.section.discover',
    roles: null,
    items: [
      { href: '/dashboard/favoris', labelKey: 'sidebar.favorites', icon: <IconHeart /> },
      {
        href: '/dashboard/saved-searches',
        labelKey: 'sidebar.savedSearches',
        icon: <IconBookmark />,
      },
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

export function AccountSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname()
  const t = useT()

  const visibleSections = SECTIONS.filter(
    (s) => s.roles === null || s.roles.includes(role),
  )

  return (
    <aside className="md:w-60">
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
