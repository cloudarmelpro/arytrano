'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon, type IconName } from './Icon'

export type NavEntry = {
  id: string
  href: string
  label: string
  icon: IconName
}

export function HeaderPrimaryNav({ items }: { items: NavEntry[] }) {
  const rawPathname = usePathname() ?? '/'
  const pathname = rawPathname.startsWith('/mg/')
    ? rawPathname.slice('/mg'.length)
    : rawPathname === '/mg'
      ? '/'
      : rawPathname
  const current = resolveActive(pathname)

  return (
    <nav
      aria-label="Navigation principale"
      className="border-t border-white/10 bg-primary"
    >
      <div className="no-scrollbar mx-auto flex max-w-[1280px] items-stretch gap-0.5 overflow-x-auto px-6 sm:gap-2 lg:px-10">
        {items.map((n) => {
          const isActive = current === n.id
          return (
            <Link
              key={n.id}
              href={n.href}
              data-active={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`relative -mb-px inline-flex shrink-0 items-center gap-1 sm:gap-2 whitespace-nowrap border-b-2 pl-0 pr-1 sm:pr-2.5 py-3.5 mr-0.5 sm:mr-2.5 last:mr-0 text-[12px] sm:text-[14px] tracking-[-0.005em] transition ${
                isActive
                  ? 'border-white font-semibold text-white'
                  : 'border-transparent font-medium text-white/80 hover:text-white'
              }`}
            >
              <span
                className={`inline-flex items-center justify-center transition ${
                  isActive ? 'text-white' : 'text-white/70'
                }`}
              >
                <Icon name={n.icon} size={15} />
              </span>
              {n.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function resolveActive(pathname: string): string | null {
  if (pathname === '/' || pathname === '') return null
  if (pathname.startsWith('/annonces')) return 'annonces'
  if (pathname.startsWith('/quartiers')) return 'quartiers'
  if (pathname.startsWith('/comment-ca-marche')) return 'how'
  if (pathname.startsWith('/proprietaires')) return 'owners'
  return null
}
