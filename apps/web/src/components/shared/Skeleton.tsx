/**
 * EDT-13 — pure Tailwind skeleton primitive used by Suspense fallbacks.
 * Server Component (no JS shipped), so heavy list pages can render an
 * instant grid outline while the RSC data fetches.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
    />
  )
}

/**
 * Card-shaped placeholder mirroring the PublicListingCard layout.
 * Aspect-ratio comes from the photo tile so grids don't reflow on load.
 */
export function ListingCardSkeleton() {
  return (
    <article className="flex flex-col gap-3">
      <Skeleton className="aspect-[5/4] w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-24" />
    </article>
  )
}

/** 3-row list placeholder for dashboard-style tables. */
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex gap-3 py-2">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}
