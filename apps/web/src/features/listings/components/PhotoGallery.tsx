'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useT } from '@/lib/i18n/client'
import type { LightboxPhoto } from './PhotoLightbox'

// Lazy-load the Dialog-powered lightbox: Base UI Dialog (~15-20 KB gz)
// only ships when the user actually opens the gallery. SSR off because
// the lightbox is never visible on first paint.
const PhotoLightbox = dynamic(
  () => import('./PhotoLightbox').then((m) => m.PhotoLightbox),
  { ssr: false },
)

type GalleryPhoto = LightboxPhoto

/**
 * Photo gallery for the public listing detail page (T-017).
 *
 * Renders the hero photo + thumbnail grid (both clickable). The
 * lightbox itself (Base UI Dialog + keyboard nav) lives in a sibling
 * `PhotoLightbox` chunk that's only fetched once the user clicks.
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
  const count = photos.length

  const close = useCallback(() => setOpenIndex(null), [])
  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + count) % count))
  }, [count])
  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % count))
  }, [count])

  if (photos.length === 0) return null

  // Airbnb-style asymmetric grid: 1 big hero photo on the left, 4 small
  // squares stacked on the right (2×2). Mobile shrinks to a single hero.
  const heroPhoto = photos[0]!
  const sidePhotos = photos.slice(1, 5)
  const remainingCount = Math.max(0, photos.length - 5)

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-xl">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
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
                      loading="lazy"
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

      {openIndex !== null && (
        <PhotoLightbox
          photos={photos}
          openIndex={openIndex}
          altFallback={altFallback}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  )
}
