'use client'

import { startTransition, useActionState, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { deleteListingVideoAction } from '../actions/upload-listing-video'
import { signListingVideoUploadAction } from '../actions/sign-listing-video-upload'
import { confirmListingVideoUploadAction } from '../actions/confirm-listing-video-upload'
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

type UploadStage =
  | { kind: 'idle' }
  | { kind: 'signing' }
  | { kind: 'uploading'; percent: number; fileName: string }
  | { kind: 'finalizing' }

/**
 * T-059 — owner upload UI for the walkthrough video. Uses a
 * CLIENT-DIRECT upload to Cloudinary so the file bypasses the
 * Vercel function entirely (no body-size limit, no function
 * timeout, no double-bandwidth waste).
 *
 * Flow :
 *   1. Server Action returns Cloudinary signed-upload credentials.
 *   2. Browser PUTs the file directly to Cloudinary with a real
 *      progress XHR (fetch streams progress poorly in browsers).
 *   3. Browser sends the small {publicId, url, durationSec, bytes}
 *      payload back to a Server Action that persists the row.
 *
 * The same pattern will port to AWS S3 pre-signed PUT URLs once the
 * asset storage migration happens — just swap the URL + the small
 * "confirm" action's validation.
 */
export function ListingVideoManager({
  listingId,
  existing,
}: {
  listingId: string
  existing: ExistingVideo | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<UploadStage>({ kind: 'idle' })
  const [current, setCurrent] = useState<ExistingVideo | null>(existing)

  const [, deleteAction] = useActionState(deleteListingVideoAction, {
    ok: false,
    message: undefined as string | undefined,
  })

  function onDelete() {
    const fd = new FormData()
    fd.set('listingId', listingId)
    startTransition(() => {
      deleteAction(fd)
    })
    setCurrent(null)
    toast.success('Vidéo supprimée.')
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_LISTING_VIDEO_BYTES) {
      toast.error(
        `Vidéo trop lourde (${Math.round(f.size / 1024 / 1024)} Mo). ${Math.round(
          MAX_LISTING_VIDEO_BYTES / 1024 / 1024,
        )} Mo maximum.`,
      )
      e.target.value = ''
      return
    }

    try {
      // 1) Get signed-upload credentials.
      setStage({ kind: 'signing' })
      const signFd = new FormData()
      signFd.set('listingId', listingId)
      const signRes = await signListingVideoUploadAction(
        { ok: false } as Awaited<
          ReturnType<typeof signListingVideoUploadAction>
        >,
        signFd,
      )
      if (
        !signRes.ok ||
        !signRes.signature ||
        !signRes.timestamp ||
        !signRes.cloudName ||
        !signRes.apiKey ||
        !signRes.folder
      ) {
        throw new Error(signRes.message ?? 'Signature refusée.')
      }

      // 2) Direct PUT to Cloudinary with progress.
      setStage({ kind: 'uploading', percent: 0, fileName: f.name })
      const cloudResp = await uploadToCloudinaryDirect({
        file: f,
        cloudName: signRes.cloudName,
        apiKey: signRes.apiKey,
        timestamp: signRes.timestamp,
        signature: signRes.signature,
        folder: signRes.folder,
        onProgress: (percent) =>
          setStage({ kind: 'uploading', percent, fileName: f.name }),
      })

      // 3) Persist on our side.
      setStage({ kind: 'finalizing' })
      const confirmFd = new FormData()
      confirmFd.set('listingId', listingId)
      confirmFd.set('publicId', cloudResp.public_id)
      confirmFd.set('url', cloudResp.secure_url)
      confirmFd.set('durationSec', String(cloudResp.duration ?? 0))
      confirmFd.set('bytes', String(cloudResp.bytes ?? 0))
      const confirmRes = await confirmListingVideoUploadAction(
        { ok: false } as Awaited<
          ReturnType<typeof confirmListingVideoUploadAction>
        >,
        confirmFd,
      )
      if (!confirmRes.ok) {
        throw new Error(confirmRes.message ?? 'Validation refusée.')
      }

      // Build poster URL the same way the server does so the preview
      // appears immediately without a router.refresh().
      const cloudPrefix = `https://res.cloudinary.com/${signRes.cloudName}/video/upload`
      const posterUrl = `${cloudPrefix}/so_2,c_fill,w_1280,h_720,q_auto,f_jpg/${cloudResp.public_id}.jpg`
      setCurrent({
        url: cloudResp.secure_url,
        posterUrl,
        durationSec: Math.round(cloudResp.duration ?? 0),
        bytes: cloudResp.bytes ?? 0,
        status: 'PUBLISHED',
      })
      toast.success(
        'Vidéo en ligne — vos visiteurs verront le bouton "Visite vidéo".',
      )
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Upload a échoué. Réessaie dans un instant.',
      )
    } finally {
      setStage({ kind: 'idle' })
      e.target.value = ''
    }
  }

  const isBusy = stage.kind !== 'idle'

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold tracking-[-0.005em] text-foreground">
            Visite vidéo (optionnel)
          </h3>
          <p className="mt-1 text-[12.5px] leading-[1.5] text-foreground/65">
            Une courte vidéo (max 2 min, 50 Mo) qui montre l’intérieur.
            L’upload va directement de ton appareil à Cloudinary — il
            ne passe pas par nos serveurs.
          </p>
        </div>
      </header>

      {current ? (
        <div className="flex flex-col gap-3 rounded-xl bg-muted/30 p-3">
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
                  Contacte le support si tu penses qu’il s’agit d’une erreur.
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

      <label
        className={`group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-6 py-8 text-center transition hover:border-primary/40 hover:bg-primary/[0.04] ${
          isBusy ? 'pointer-events-none opacity-70' : ''
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_VIDEO_MIME.join(',')}
          onChange={onChange}
          disabled={isBusy}
          className="sr-only"
        />
        <UploadLabel stage={stage} hasExisting={!!current} />
        <span className="text-[11.5px] text-foreground/55">
          MP4 / MOV / WebM, max{' '}
          {Math.round(MAX_LISTING_VIDEO_BYTES / 1024 / 1024)} Mo,{' '}
          {MAX_LISTING_VIDEO_DURATION_SEC}s.
        </span>
        {stage.kind === 'uploading' ? (
          <div
            className="mt-2 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-background ring-1 ring-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(stage.percent)}
          >
            <div
              className="h-full bg-primary transition-[width] duration-150 ease-out"
              style={{ width: `${stage.percent}%` }}
            />
          </div>
        ) : null}
      </label>
    </section>
  )
}

function UploadLabel({
  stage,
  hasExisting,
}: {
  stage: UploadStage
  hasExisting: boolean
}) {
  // Allow the parent's <label> click to fire even while we're "idle".
  // useFormStatus is no longer relevant — keep the call site clean.
  void useFormStatus
  switch (stage.kind) {
    case 'signing':
      return (
        <span className="text-[13.5px] font-semibold text-primary">
          Préparation…
        </span>
      )
    case 'uploading':
      return (
        <span className="text-[13.5px] font-semibold text-primary">
          Upload en cours · {Math.round(stage.percent)}%
        </span>
      )
    case 'finalizing':
      return (
        <span className="text-[13.5px] font-semibold text-primary">
          Finalisation…
        </span>
      )
    case 'idle':
    default:
      return (
        <span className="text-[13.5px] font-semibold text-foreground">
          {hasExisting ? 'Remplacer la vidéo' : 'Choisir un fichier vidéo'}
        </span>
      )
  }
}

type CloudinaryUploadResponse = {
  public_id: string
  secure_url: string
  bytes: number
  duration?: number
}

/**
 * XHR-based upload so we can report real progress. fetch() doesn't
 * expose upload progress in browsers as of 2026 ; sticking to XHR
 * here is the standard workaround.
 */
async function uploadToCloudinaryDirect(opts: {
  file: File
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
  onProgress: (percent: number) => void
}): Promise<CloudinaryUploadResponse> {
  return new Promise((resolve, reject) => {
    const fd = new FormData()
    fd.set('file', opts.file)
    fd.set('api_key', opts.apiKey)
    fd.set('timestamp', String(opts.timestamp))
    fd.set('signature', opts.signature)
    fd.set('folder', opts.folder)

    const xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${opts.cloudName}/video/upload`,
    )
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        opts.onProgress((e.loaded / e.total) * 100)
      }
    }
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText) as
          | CloudinaryUploadResponse
          | { error: { message: string } }
        if (xhr.status >= 200 && xhr.status < 300 && 'public_id' in body) {
          resolve(body)
        } else {
          const msg =
            'error' in body && body.error?.message
              ? body.error.message
              : `Cloudinary HTTP ${xhr.status}`
          reject(new Error(msg))
        }
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Réponse Cloudinary invalide.'))
      }
    }
    xhr.onerror = () =>
      reject(new Error('Erreur réseau pendant l’upload Cloudinary.'))
    xhr.send(fd)
  })
}
