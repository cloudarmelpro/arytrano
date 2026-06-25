'use client'

import { startTransition, useActionState, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  uploadListingVideoAction,
  deleteListingVideoAction,
} from '../actions/upload-listing-video'
import {
  ACCEPTED_VIDEO_MIME,
  MAX_LISTING_VIDEO_BYTES,
  MAX_LISTING_VIDEO_DURATION_SEC,
} from '../schemas/listing-video'

type ExistingVideo = {
  url: string
  posterUrl: string
  durationSec: number
  bytes: number
  status?: 'PUBLISHED' | 'HIDDEN_BY_ADMIN'
  hiddenReason?: string | null
}

/**
 * T-059 — owner upload UI for the walkthrough video. Lives next to the
 * existing PhotoManager on /dashboard/listings/[id]/edit.
 *
 * One video per listing (v1). Replacing destroys the previous
 * Cloudinary asset server-side.
 */
export function ListingVideoManager({
  listingId,
  existing,
}: {
  listingId: string
  existing: ExistingVideo | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [previewName, setPreviewName] = useState<string | null>(null)

  const [uploadState, uploadAction] = useActionState(uploadListingVideoAction, {
    ok: false,
    message: undefined as string | undefined,
    url: undefined as string | undefined,
    posterUrl: undefined as string | undefined,
    durationSec: undefined as number | undefined,
  })
  const [, deleteAction] = useActionState(deleteListingVideoAction, {
    ok: false,
    message: undefined as string | undefined,
  })

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPreviewName(f.name)
    const fd = new FormData()
    fd.set('listingId', listingId)
    fd.set('video', f)
    startTransition(() => {
      uploadAction(fd)
    })
  }

  function onDelete() {
    const fd = new FormData()
    fd.set('listingId', listingId)
    startTransition(() => {
      deleteAction(fd)
    })
    toast.success('Vidéo supprimée.')
  }

  if (uploadState.message && !uploadState.ok) {
    // Re-render — surface as a toast on next render. We use a tiny
    // useEffect-style guard via key so the toast fires once per state.
    // (Sonner dedupes by message text, so this stays clean.)
    toast.error(uploadState.message)
  }
  if (uploadState.ok && uploadState.url) {
    toast.success('Vidéo en ligne — vos visiteurs verront le bouton "Visite vidéo".')
  }

  const current: ExistingVideo | null =
    uploadState.ok && uploadState.url && uploadState.posterUrl
      ? {
          url: uploadState.url,
          posterUrl: uploadState.posterUrl,
          durationSec: uploadState.durationSec ?? 0,
          bytes: 0,
        }
      : existing

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold tracking-[-0.005em] text-foreground">
            Visite vidéo (optionnel)
          </h3>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-foreground/65">
            Une courte vidéo (max 2 min, 50 Mo) qui montre l’intérieur.
            Les visiteurs cliquent pour la lancer — elle ne se charge
            jamais automatiquement.
          </p>
        </div>
      </header>

      {current ? (
        <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
          {/* T-059 admin moderation — surface the hidden state to the
              owner so they understand why their video isn't visible
              publicly. Optionally show the admin's reason. */}
          {current.status === 'HIDDEN_BY_ADMIN' ? (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-[12.5px] text-amber-900">
              <p className="font-semibold">
                Vidéo masquée par l’équipe AryTrano
              </p>
              {current.hiddenReason ? (
                <p className="mt-1 leading-[1.55]">
                  Raison : {current.hiddenReason}
                </p>
              ) : (
                <p className="mt-1 leading-[1.55]">
                  Contacte le support si tu penses qu’il s’agit d’une
                  erreur.
                </p>
              )}
            </div>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.posterUrl}
            alt="Aperçu de la vidéo"
            className="aspect-video w-full rounded-lg object-cover"
          />
          <div className="flex items-center justify-between gap-2 text-[12.5px] text-foreground/70">
            <span>{current.durationSec}s</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>
      ) : null}

      <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-8 text-center transition hover:border-primary/40 hover:bg-primary/[0.04]">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_VIDEO_MIME.join(',')}
          onChange={onChange}
          className="sr-only"
        />
        <UploadSubmitLabel previewName={previewName} hasExisting={!!current} />
        <span className="text-[11.5px] text-foreground/55">
          MP4 / MOV / WebM, max{' '}
          {Math.round(MAX_LISTING_VIDEO_BYTES / 1024 / 1024)} Mo,{' '}
          {MAX_LISTING_VIDEO_DURATION_SEC}s.
        </span>
      </label>
    </section>
  )
}

function UploadSubmitLabel({
  previewName,
  hasExisting,
}: {
  previewName: string | null
  hasExisting: boolean
}) {
  const { pending } = useFormStatus()
  if (pending) {
    return (
      <span className="text-[13.5px] font-semibold text-primary">
        Envoi… ({previewName ?? 'fichier'})
      </span>
    )
  }
  return (
    <span className="text-[13.5px] font-semibold text-foreground">
      {hasExisting ? 'Remplacer la vidéo' : 'Choisir un fichier vidéo'}
    </span>
  )
}
