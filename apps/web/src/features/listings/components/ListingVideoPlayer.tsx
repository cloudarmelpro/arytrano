'use client'

import { useEffect, useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'

/**
 * T-059 — modal walkthrough video player.
 *
 * Native HTML5 `<video>` with `preload="metadata"` (NOT `auto`) so
 * only ~100 KB of metadata is fetched at open ; the visitor still
 * hits play to actually stream. Poster image is served as the
 * thumbnail until they do.
 *
 * Lazy-loaded by PhotoGallery via `next/dynamic` so the Base UI
 * Dialog chunk (~15 KB gz) doesn't ship with the listing detail
 * bundle on first paint.
 */
export function ListingVideoPlayer({
  video,
  onClose,
}: {
  video: {
    url: string
    posterUrl: string
    posterBlurhash: string | null
    durationSec: number
  }
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Auto-play once mounted so the click-to-open feels seamless. The
  // browser may refuse (autoplay policy) — in that case the visitor
  // sees the poster + native controls and taps play themselves.
  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  return (
    <Dialog.Root open onOpenChange={(o) => { if (!o) onClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm" />
        <Dialog.Popup
          aria-labelledby="listing-video-title"
          className="fixed left-1/2 top-1/2 z-50 flex w-[min(96vw,1200px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex-col gap-2"
        >
          <Dialog.Title
            id="listing-video-title"
            className="sr-only"
          >
            Visite vidéo de l’annonce
          </Dialog.Title>

          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            controls
            preload="metadata"
            poster={video.posterUrl}
            playsInline
            className="aspect-video w-full rounded-2xl bg-black object-contain shadow-2xl"
          >
            <source src={video.url} />
            Ton navigateur ne supporte pas la lecture vidéo.
          </video>

          <Dialog.Close
            render={
              <button
                type="button"
                className="self-end rounded-xl cursor-pointer bg-white/95 px-4 py-2 text-sm font-semibold text-foreground shadow transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Fermer
              </button>
            }
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
