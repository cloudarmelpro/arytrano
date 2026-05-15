'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { useT } from '@/lib/i18n/client'
import type { MessageKey } from '@/lib/i18n/messages'
// Import the action DIRECTLY (not via `@/features/auth` index) — the
// index also re-exports `auth` / `signIn` which depend on `next/headers`
// and would poison this Client Component bundle.
import { signOutAction } from '@/features/auth/actions/sign-out'

type Item = {
  href: string
  labelKey: MessageKey
  icon: React.ReactNode
  /** Optional badge for unread/pending counts (e.g. open reports). */
  badge?: number
}

type Section = {
  labelKey: MessageKey
  items: Item[]
}

function IconLayout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function IconLogOut() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconFlag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  )
}

/**
 * Top-level section roots (e.g. `/admin`, `/dashboard`) match only on
 * exact pathname — otherwise their prefix swallows every sub-route and
 * the overview link stays highlighted on /admin/listings, /admin/reports…
 */
function isActive(pathname: string, href: string): boolean {
  const isSectionRoot = href.split('/').filter(Boolean).length <= 1
  if (isSectionRoot) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

const buildSections = (openReports: number): Section[] => [
  {
    labelKey: 'admin.section.dashboard',
    items: [
      { href: '/admin', labelKey: 'admin.nav.overview', icon: <IconLayout /> },
    ],
  },
  {
    labelKey: 'admin.section.moderation',
    items: [
      { href: '/admin/listings', labelKey: 'admin.nav.listings', icon: <IconList /> },
      {
        href: '/admin/reports',
        labelKey: 'admin.nav.reports',
        icon: <IconFlag />,
        badge: openReports,
      },
    ],
  },
]

export function AdminSidebar({ openReports = 0 }: { openReports?: number }) {
  const pathname = usePathname()
  const t = useT()
  const sections = buildSections(openReports)

  return (
    <aside className="md:w-60">
      <p className="mb-5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t('admin.console')}
      </p>
      <nav aria-label={t('admin.console')} className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.labelKey} className="flex flex-col gap-2">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              {t(section.labelKey)}
            </p>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((it) => {
                const active = isActive(pathname, it.href)
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
                      <span className="flex-1">{t(it.labelKey)}</span>
                      {it.badge !== undefined && it.badge > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-auto bg-destructive/10 text-destructive text-[10px]"
                        >
                          {it.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Sign-out — bottom of the sidebar, separated by a divider. */}
        <form action={signOutAction} className="mt-2 border-t border-border pt-4">
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
