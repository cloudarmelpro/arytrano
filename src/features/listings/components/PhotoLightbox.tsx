'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Dialog } from '@base-ui/react/dialog'
import { useT } from '@/lib/i18n/client'

export type LightboxPhoto = {
  id: string
  url: string
  width: number
  height: number
  blurhash: string | null
  altFr: string | null
}

/**
 * Photo lightbox extracted from `PhotoGallery` so it can be
 * dynamically imported only when the user actually opens it. Keeps
 * Base UI Dialog (~15-20 KB gz) out of the listing detail's initial
 * client bundle.
 */
export function PhotoLightbox({
  photos,
  openIndex,
  altFallback,
  onClose,
  onPrev,
  onNext,
}: {
  photos: LightboxPhoto[]
  openIndex: number
  altFallback: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const t = useT()
  const count = photos.length
  const current = photos[openIndex]

  // Keyboard navigation. Esc is handled by Base UI Dialog itself.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        onNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPrev, onNext])

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup
          className="fixed inset-0 z-50 flex flex-col data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          aria-label={t('gallery.label')}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-medium">
              {current
                ? t('detail.photoCounter', { current: openIndex + 1, total: count })
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
                  onClick={onPrev}
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
                  onClick={onNext}
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
  )
}
