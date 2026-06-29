import type { ReactNode } from 'react'
import Link from 'next/link'

/**
 * EDT-11 — shared empty-state primitive.
 *
 * Standardizes icon + title + lead + optional CTA across favorites,
 * saved searches, leases, listings, and any future dashboard list
 * that lands in a zero-row state. Server Component (no client JS) so
 * pages that already are RSC stay RSC.
 *
 * Pass `cta` for an internal Link, or use the `actions` slot for any
 * other content (Server Action button, multiple buttons, etc.).
 */
export type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
  cta?: { href: string; label: string }
  actions?: ReactNode
  /** Tighten the padding for inline (in-list) empty states. */
  variant?: 'page' | 'inline'
}

export function EmptyState({
  icon,
  title,
  description,
  cta,
  actions,
  variant = 'page',
}: EmptyStateProps) {
  const pad = variant === 'page' ? 'p-12' : 'p-8'
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 text-center ${pad}`}
    >
      <span
        aria-hidden
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
      >
        {icon}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="mt-2 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {cta.label}
        </Link>
      )}
      {actions}
    </div>
  )
}
