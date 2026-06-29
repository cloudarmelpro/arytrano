'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * EDT-10 — sticky bottom bar on mobile (`<lg`) that surfaces the
 * price + lead CTA without forcing the visitor to scroll past the
 * full description + photos + map before they can act.
 *
 * Instead of duplicating the heavy <InterestLeadCta> dialog (which
 * lives in the aside), we delegate to it: click triggers the existing
 * dialog open button by `data-testid="lead-cta-open"`. Cheaper than
 * threading dialog state through two components, and the aside CTA
 * itself stays the source of truth for the modal lifecycle.
 *
 * Hidden on `lg+` because the aside is already visible there.
 */
export function MobileStickyContactBar({
  priceLabel,
  ctaLabel,
}: {
  priceLabel: string
  ctaLabel: string
}) {
  // Avoid SSR/hydration mismatch — only render after mount; the bar
  // is decoration anyway, the aside CTA always works.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  function openLeadDialog() {
    const trigger = document.querySelector<HTMLButtonElement>(
      '[data-testid="lead-cta-open"]',
    )
    trigger?.click()
  }

  if (!mounted) return null

  return (
    <div
      role="region"
      aria-label="Action rapide"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-4px_20px_-12px_rgba(0,0,0,0.25)] backdrop-blur lg:hidden"
      // Respect the iOS bottom safe area so the CTA isn't half hidden
      // behind the home indicator.
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <p className="flex-1 font-mono text-[15px] font-semibold leading-tight text-foreground">
          {priceLabel}
          <span className="ml-1 text-[11px] font-normal text-muted-foreground">
            / mois
          </span>
        </p>
        <Button type="button" size="default" onClick={openLeadDialog}>
          {ctaLabel}
        </Button>
      </div>
    </div>
  )
}
