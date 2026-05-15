'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@base-ui/react/dialog'
import { useT } from '@/lib/i18n/client'

type GalleryPhoto = {
  id: string
  url: string
  width: number
  height: number
  blurhash: string | null
  altFr: string | null
}

/**
 * Photo gallery for the public listing detail page (T-017).
 *
 * Renders the hero photo + thumbnail grid (both clickable) and a lightbox
 * powered by Base UI Dialog — gives us automatic focus trap, ESC handling,
 * and inert-when-open semantics for the rest of the page.
 *
 * Keyboard within the lightbox:
 *  - ←  → previous photo
 *  - →  → next photo
 *  - Esc → close (Base UI handles)
 */
export function PhotoGallery({
  photos,
  altFallback,
}: {
  photos: GalleryPhoto[]
  altFallback: string
}) {
  const t = useT()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const isOpen = openIndex !== null
  const count = photos.length
  const current = openIndex !== null ? photos[openIndex] : null

  const close = useCallback(() => setOpenIndex(null), [])
  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + count) % count))
  }, [count])
  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % count))
  }, [count])

  // Keyboard navigation (Esc is handled by Base UI Dialog itself).
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, goPrev, goNext])

  if (photos.length === 0) return null

  // Airbnb-style asymmetric grid: 1 big hero photo on the left, 4 small
  // squares stacked on the right (2×2). Mobile shrinks to a single hero.
  // If we have fewer than 5 photos we still render the grid but show
  // a "muted" tile for missing slots so the layout stays balanced.
  const heroPhoto = photos[0]!
  const sidePhotos = photos.slice(1, 5)
  const remainingCount = Math.max(0, photos.length - 5)

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
          {/* Hero (left half on desktop, full on mobile) */}
          <button
            type="button"
            onClick={() => setOpenIndex(0)}
            className="relative block aspect-[4/3] w-full overflow-hidden bg-muted transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:aspect-auto"
            aria-label={t('gallery.open', { n: 1 })}
          >
            <Image
              src={heroPhoto.url}
              alt={heroPhoto.altFr || altFallback}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              placeholder={heroPhoto.blurhash ? 'blur' : 'empty'}
              blurDataURL={heroPhoto.blurhash ?? undefined}
            />
          </button>

          {/* 2×2 side grid (desktop only) */}
          {sidePhotos.length > 0 && (
            <div className="hidden grid-cols-2 gap-2.5 sm:grid">
              {sidePhotos.map((p, i) => {
                const index = i + 1
                const isLastVisible = i === sidePhotos.length - 1
                const showOverlay = isLastVisible && remainingCount > 0
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    className="relative block aspect-square w-full overflow-hidden bg-muted transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t('gallery.open', { n: index + 1 })}
                  >
                    <Image
                      src={p.url}
                      alt={p.altFr || `${altFallback} — photo ${index + 1}`}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                      placeholder={p.blurhash ? 'blur' : 'empty'}
                      blurDataURL={p.blurhash ?? undefined}
                    />
                    {showOverlay && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-base font-semibold text-white">
                        +{remainingCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* "Show all photos" floating button — bottom-right of the grid */}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setOpenIndex(0)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            {t('gallery.showAll', { n: photos.length })}
          </button>
        )}
      </div>

      {/* Lightbox */}
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup
            className="fixed inset-0 z-50 flex flex-col data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
            aria-label={t('gallery.label')}
          >
            {/* Header bar with counter + close */}
            <div className="flex items-center justify-between px-4 py-3 text-white">
              <span className="text-sm font-medium">
                {current
                  ? t('detail.photoCounter', { current: (openIndex ?? 0) + 1, total: count })
                  : ''}
              </span>
              <Dialog.Close
                aria-label={t('gallery.close')}
                className="flex h-9 w-9 items-center justify-center rounded-md text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Dialog.Close>
            </div>

            {/* Photo area with prev/next overlays */}
            <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
              {current && (
                <div className="relative h-full w-full max-w-5xl">
                  <Image
                    src={current.url}
                    alt={current.altFr || altFallback}
                    fill
                    sizes="(min-width: 1024px) 80rem, 100vw"
                    className="object-contain"
                    placeholder={current.blurhash ? 'blur' : 'empty'}
                    blurDataURL={current.blurhash ?? undefined}
                  />
                </div>
              )}

              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label={t('gallery.prev')}
                    className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label={t('gallery.next')}
                    className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
