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

// T-059 — same lazy strategy for the video modal. Reuses Base UI
// Dialog ; only loaded if the visitor actually clicks the "Visite
// vidéo" CTA (critical on 3G — most visitors won't open it).
const VideoPlayer = dynamic(
  () => import('./ListingVideoPlayer').then((m) => m.ListingVideoPlayer),
  { ssr: false },
)

type GalleryPhoto = LightboxPhoto

type GalleryVideo = {
  url: string
  posterUrl: string
  posterBlurhash: string | null
  durationSec: number
}

/**
 * Photo gallery for the public listing detail page (T-017).
 *
 * Renders the hero photo + thumbnail grid (both clickable). The
 * lightbox itself (Base UI Dialog + keyboard nav) lives in a sibling
 * `PhotoLightbox` chunk that's only fetched once the user clicks.
 *
 * T-059 — when a walkthrough video is attached, a "Visite vidéo"
 * play button overlays the hero photo. Click-to-play opens a modal
 * with the native HTML5 player. The video stream is NEVER loaded
 * on first paint (preload="none") — critical for 3G visitors.
 */
export function PhotoGallery({
  photos,
  altFallback,
  video = null,
}: {
  photos: GalleryPhoto[]
  altFallback: string
  video?: GalleryVideo | null
}) {
  const t = useT()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [videoOpen, setVideoOpen] = useState(false)
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
            {video ? (
              <span
                className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-foreground/85 px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.08em] text-background backdrop-blur-sm"
                aria-hidden
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {t('gallery.video.badge')}
              </span>
            ) : null}
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

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {video ? (
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_2px_4px_rgba(16,18,40,0.15)] transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
              {t('gallery.video.cta')}
            </button>
          ) : null}
          {photos.length > 1 && (
            <button
              type="button"
              onClick={() => setOpenIndex(0)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground cursor-pointer transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {video && videoOpen ? (
        <VideoPlayer video={video} onClose={() => setVideoOpen(false)} />
      ) : null}
    </>
  )
}
