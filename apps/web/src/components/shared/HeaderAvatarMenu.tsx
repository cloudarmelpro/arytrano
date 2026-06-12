'use client'

import Link from 'next/link'
import { Menu } from '@base-ui/react/menu'
import type { UserRole } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useT } from '@/lib/i18n/client'
import type { MessageKey } from '@/lib/i18n/messages'
// Direct file import — `@/features/auth` index pulls in `next/headers`
// and would poison this Client Component bundle.
import { signOutAction } from '@/features/auth/actions/sign-out'
import { broadcastAuthChange } from '@/features/auth/lib/broadcast'

/**
 * Right-side user menu in the Header — avatar trigger opens a Base UI
 * menu styled with leading icons + section labels (Vercel / Linear /
 * Stripe pattern). Brand colour (indigo `--primary`) is used for hover
 * states; no background change — just the text + icon recolour.
 */
export function HeaderAvatarMenu({
  name,
  email,
  image,
  role,
}: {
  name: string | null
  email: string
  image: string | null
  role: UserRole
}) {
  const t = useT()
  const firstName = name?.trim().split(/\s+/)[0] ?? null
  const initial = name?.[0]?.toUpperCase() ?? email[0]?.toUpperCase() ?? 'A'
  const isOwner = role === 'OWNER' || role === 'ADMIN'

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t('header.avatarMenu.aria')}
        className="group inline-flex cursor-pointer items-center gap-2.5 rounded-md text-left text-white outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
      >
        <Avatar className="h-10 w-10 ring-2 ring-white/30">
          {image && <AvatarImage src={image} alt={name ?? email} />}
          <AvatarFallback className="bg-white text-[13px] font-semibold text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="truncate text-[13.5px] font-semibold text-white">
            {name ?? firstName ?? email.split('@')[0]}
          </span>
          <span className="truncate text-[11.5px] font-medium text-white/65">
            {email}
          </span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="ml-0.5 text-white/70 transition group-data-popup-open:rotate-180"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50 outline-none">
          {/* 2026-06-12 — unified popup chrome. Same DNA as the Select
              and Combobox dropdowns across the app : rounded-xl,
              shadow-lg, ring-1 ring-foreground/10, inner p-1. */}
          <Menu.Popup className="min-w-[16rem] overflow-hidden rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0">
            {/* User info card at top — full-width header (no divider) */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-10 w-10 ring-1 ring-border">
                {image && <AvatarImage src={image} alt={name ?? email} />}
                <AvatarFallback className="text-sm font-semibold text-primary">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {name ?? firstName ?? email.split('@')[0]}
                </p>
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
            </div>

            {/* Main account section — every link uses the same item spacing */}
            <SectionLabel>{t('header.avatarMenu.section.account')}</SectionLabel>
            <div className="pb-1">
              <MenuItem
                href="/dashboard"
                labelKey="header.avatarMenu.dashboard"
                icon={<IconLayout />}
              />
              {isOwner && (
                <MenuItem
                  href="/dashboard/listings"
                  labelKey="header.avatarMenu.myListings"
                  icon={<IconList />}
                />
              )}
              <MenuItem
                href="/dashboard/favoris"
                labelKey="header.avatarMenu.favorites"
                icon={<IconHeart />}
              />
              <MenuItem
                href="/dashboard/profile"
                labelKey="header.avatarMenu.profile"
                icon={<IconUserCog />}
              />
              {role === 'ADMIN' && (
                <MenuItem
                  href="/admin"
                  labelKey="header.avatarMenu.adminConsole"
                  icon={<IconShield />}
                />
              )}
            </div>

            {/* Sign-out — destructive (red) by default; hover slightly
               dims to signal interactivity. No divider above (visual
               consistency with the rest of the items). */}
            <Menu.Item
              render={
                <form
                  action={signOutAction}
                  onSubmit={() => broadcastAuthChange('signout')}
                >
                  <button
                    type="submit"
                    className="group/item flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive outline-none transition data-highlighted:bg-destructive/10"
                  >
                    <span className="flex h-5 w-5 items-center justify-center text-destructive transition">
                      <IconLogOut />
                    </span>
                    <span>{t('header.avatarMenu.signOut')}</span>
                  </button>
                </form>
              }
            />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
      {children}
    </p>
  )
}

function MenuItem({
  href,
  labelKey,
  icon,
}: {
  href: string
  labelKey: MessageKey
  icon: React.ReactNode
}) {
  const t = useT()
  return (
    <Menu.Item
      render={
        <Link
          href={href}
          className="group/item flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground outline-none transition data-highlighted:bg-primary/10 data-highlighted:text-foreground"
        >
          <span className="flex h-5 w-5 items-center justify-center text-muted-foreground transition group-data-highlighted/item:text-primary">
            {icon}
          </span>
          <span>{t(labelKey)}</span>
        </Link>
      }
    />
  )
}

/* ---------- icons ---------- */

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

function IconHeart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconUserCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
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
