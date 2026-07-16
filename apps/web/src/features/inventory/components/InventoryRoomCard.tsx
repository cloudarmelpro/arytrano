'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { cloudinaryThumbnail } from '@/lib/cloudinary/thumbnail'
import { upsertInventoryItemAction } from '../actions/upsert-inventory-item'
import { uploadInventoryPhotoAction } from '../actions/upload-inventory-photo'
import { deleteInventoryItemAction } from '../actions/delete-inventory-item'

/**
 * E-T27.2 — one card per room. The visitor uploads photos one at a
 * time (each upload is a Server Action that returns a Cloudinary
 * URL), edits the notes, and saves the whole row via the upsert
 * action.
 *
 * Locking : the parent decides `disabled` based on lease status +
 * phase rules (ENTRY locked once TERMINATED, EXIT locked when in
 * DISPUTED?). The card itself just renders the disabled state.
 */

type ExistingItem = {
  id: string
  notes: string | null
  photoUrls: string[]
  uploadedBy: { id: string; name: string | null } | null
  updatedAt: Date
}

export function InventoryRoomCard({
  leaseId,
  phase,
  roomKey,
  roomLabel,
  existing,
  disabled,
}: {
  leaseId: string
  phase: 'ENTRY' | 'EXIT'
  roomKey: string
  roomLabel: string
  existing: ExistingItem | null
  disabled: boolean
}) {
  const [photoUrls, setPhotoUrls] = useState<string[]>(existing?.photoUrls ?? [])
  const [notes, setNotes] = useState<string>(existing?.notes ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadState, uploadAction] = useActionState(
    uploadInventoryPhotoAction.bind(null, leaseId, phase),
    { ok: false } as { ok: boolean; message?: string; url?: string },
  )
  const [saveState, saveAction] = useActionState(upsertInventoryItemAction, {
    ok: false,
    message: undefined as string | undefined,
    itemId: undefined as string | undefined,
    fields: undefined as Record<string, string[]> | undefined,
  })

  // On upload success, append the URL to local list + reset the file
  // input so the same file can be re-picked. Guarded by a ref so a
  // second commit with the same URL doesn't fire twice.
  const lastAppendedRef = useRef<string | null>(null)
  useEffect(() => {
    if (
      uploadState.ok &&
      uploadState.url &&
      lastAppendedRef.current !== uploadState.url
    ) {
      lastAppendedRef.current = uploadState.url
      setPhotoUrls((prev) =>
        prev.includes(uploadState.url!) ? prev : [...prev, uploadState.url!],
      )
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [uploadState])

  function removePhoto(url: string) {
    setPhotoUrls((prev) => prev.filter((u) => u !== url))
  }

  function handleSave() {
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    fd.set('phase', phase)
    fd.set('roomKey', roomKey)
    if (notes) fd.set('notes', notes)
    for (const url of photoUrls) fd.append('photoUrls', url)
    startTransition(() => saveAction(fd))
  }

  function handleDelete() {
    if (!existing) return
    if (!confirm(`Supprimer la pièce ${roomLabel} ?`)) return
    const fd = new FormData()
    fd.set('leaseId', leaseId)
    fd.set('itemId', existing.id)
    startTransition(async () => {
      const result = await deleteInventoryItemAction({ ok: false }, fd)
      if (!result.ok) toast.error(result.message ?? 'Erreur')
      else {
        setPhotoUrls([])
        setNotes('')
        toast.success('Pièce supprimée.')
      }
    })
  }

  return (
    <article
      className={`rounded-2xl border bg-background p-5 ${disabled ? 'opacity-60' : 'border-border'}`}
      aria-disabled={disabled}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[16px] font-bold tracking-tight">{roomLabel}</h3>
        {existing ? (
          <span className="text-[11px] text-foreground/55">
            modifié{' '}
            {new Date(existing.updatedAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
            {existing.uploadedBy?.name ? ` par ${existing.uploadedBy.name}` : ''}
          </span>
        ) : null}
      </header>

      {/* Photos grid */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photoUrls.map((url) => (
          <div key={url} className="group relative overflow-hidden rounded-md border border-border">
            {/* Perf audit fix (2026-06-12) — inject a Cloudinary
                thumbnail transform (~3KB) instead of streaming the
                original (~300KB) into a 240px tile. `loading="lazy"`
                + explicit dimensions kill the CLS. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryThumbnail(url, { width: 320, height: 320 })}
              alt={`État ${roomLabel}`}
              width={320}
              height={320}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full object-cover"
            />
            {!disabled ? (
              <button
                type="button"
                onClick={() => removePhoto(url)}
                aria-label="Retirer la photo"
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
        {/* Upload tile */}
        {!disabled && photoUrls.length < 20 ? (
          <form
            action={uploadAction}
            className="flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-border text-foreground/55 hover:border-primary/40 hover:text-primary"
          >
            <label className="flex h-full w-full cursor-pointer items-center justify-center text-[12px]">
              <UploadButton inputRef={fileInputRef} />
            </label>
          </form>
        ) : null}
      </div>

      {uploadState.message && !uploadState.ok ? (
        <p
          role="alert"
          className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-[12.5px] text-destructive"
        >
          {uploadState.message}
        </p>
      ) : null}

      {/* Notes */}
      <Field className="mt-4">
        <FieldLabel htmlFor={`notes-${phase}-${roomKey}`}>
          Observations
        </FieldLabel>
        <Textarea
          id={`notes-${phase}-${roomKey}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Tache mur cuisine, robinet qui fuit, mobilier présent…"
          disabled={disabled}
        />
      </Field>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={disabled}
        >
          Enregistrer
        </Button>
        {existing && !disabled ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            Supprimer la pièce
          </Button>
        ) : null}
      </div>

      {saveState.message ? (
        <p
          role="alert"
          className={`mt-3 rounded-md border px-3 py-2 text-[12.5px] ${
            saveState.ok
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-destructive/30 bg-destructive/5 text-destructive'
          }`}
        >
          {saveState.ok ? 'Enregistré.' : saveState.message}
        </p>
      ) : null}
    </article>
  )
}

function UploadButton({
  inputRef,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const { pending } = useFormStatus()
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        name="photo"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="sr-only"
        onChange={(e) => {
          // Auto-submit when a file is picked.
          if (e.target.files && e.target.files.length > 0) {
            e.currentTarget.form?.requestSubmit()
          }
        }}
        disabled={pending}
      />
      <span className="flex flex-col items-center gap-1">
        <span aria-hidden className="text-2xl leading-none">
          +
        </span>
        <span>{pending ? 'Upload…' : 'Ajouter'}</span>
      </span>
    </>
  )
}
