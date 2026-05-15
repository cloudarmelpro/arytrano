'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import {
  uploadListingPhotoAction,
  removeListingPhotoAction,
  reorderListingPhotosAction,
} from '../actions/photos'
import { MAX_PHOTOS_PER_LISTING } from '../schemas'

export type ListingPhotoView = {
  id: string
  url: string
  width: number
  height: number
  position: number
  altFr: string | null
}

export function PhotoManager({
  listingId,
  initialPhotos,
}: {
  listingId: string
  initialPhotos: ListingPhotoView[]
}) {
  const t = useT()
  const [photos, setPhotos] = useState(initialPhotos)
  const [uploading, startUpload] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [reordering, setReordering] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)

  const remaining = MAX_PHOTOS_PER_LISTING - photos.length
  const busy = uploading || removingId !== null || reordering

  function handleUpload(file: File) {
    startUpload(async () => {
      const fd = new FormData()
      fd.append('photo', file)
      const result = await uploadListingPhotoAction(listingId, { ok: false }, fd)
      if (result.ok && result.photoId && result.url) {
        toast.success(result.message ?? t('photoManager.toast.added'))
        setPhotos((prev) => [
          ...prev,
          {
            id: result.photoId!,
            url: result.url!,
            width: 1600,
            height: 1200,
            position: prev.length,
            altFr: null,
          },
        ])
      } else {
        toast.error(result.message ?? t('photoManager.toast.uploadFailed'))
      }
    })
  }

  async function handleRemove(photoId: string) {
    const previous = photos
    setRemovingId(photoId)
    setPhotos((p) => p.filter((x) => x.id !== photoId).map((x, i) => ({ ...x, position: i })))
    try {
      const result = await removeListingPhotoAction(listingId, photoId)
      if (!result.ok) {
        toast.error(result.message ?? t('photoManager.toast.removeFailed'))
        setPhotos(previous) // rollback
      } else {
        toast.success(result.message ?? t('photoManager.toast.removed'))
      }
    } finally {
      setRemovingId(null)
    }
  }

  async function applyReorder(next: ListingPhotoView[]) {
    const previous = photos
    setReordering(true)
    setPhotos(next.map((p, i) => ({ ...p, position: i })))
    try {
      const result = await reorderListingPhotosAction(listingId, next.map((p) => p.id))
      if (!result.ok) {
        toast.error(result.message ?? t('photoManager.toast.reorderFailed'))
        setPhotos(previous)
      } else {
        toast.success(result.message ?? t('photoManager.toast.reordered'))
      }
    } finally {
      setReordering(false)
    }
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null)
      return
    }
    const from = photos.findIndex((p) => p.id === dragId)
    const to = photos.findIndex((p) => p.id === targetId)
    if (from === -1 || to === -1) return
    const next = [...photos]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setDragId(null)
    applyReorder(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('photoManager.counter', { current: photos.length, max: MAX_PHOTOS_PER_LISTING })}{' '}
          {t('photoManager.counterHint')}
        </p>
        <label
          className={`inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition ${
            remaining <= 0 || busy
              ? 'pointer-events-none cursor-not-allowed opacity-50'
              : 'cursor-pointer hover:bg-muted'
          }`}
        >
          {uploading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" aria-hidden />}
          {uploading ? t('photoManager.uploading') : t('photoManager.add')}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            disabled={remaining <= 0 || busy}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          {t('photoManager.empty')}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, idx) => {
            const isRemoving = removingId === p.id
            return (
              <li
                key={p.id}
                draggable={!busy}
                onDragStart={() => !busy && setDragId(p.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => !busy && handleDrop(p.id)}
                className={`group relative aspect-square overflow-hidden rounded-md border border-border bg-muted ${
                  dragId === p.id ? 'opacity-50' : ''
                } ${busy && !isRemoving ? 'cursor-not-allowed' : ''}`}
              >
                <Image
                  src={p.url}
                  alt={p.altFr ?? `Photo ${idx + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                  draggable={false}
                  unoptimized={false}
                />
                {idx === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    {t('photoManager.thumbnail')}
                  </span>
                )}
                {isRemoving && (
                  <span
                    className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
                    aria-live="polite"
                  >
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/40 border-t-foreground" aria-hidden />
                  </span>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={() => handleRemove(p.id)}
                  disabled={busy}
                  className="absolute bottom-1.5 right-1.5 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t('photoManager.remove')}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
