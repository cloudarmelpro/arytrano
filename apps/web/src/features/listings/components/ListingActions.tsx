'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ListingStatus, UnavailableReason } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n/client'
import {
  publishListingAction,
  toggleAvailabilityAction,
  deleteListingAction,
} from '../actions/publish-listing'

// OWN-20 — same closed set as ListingActionsMenu.
const REASON_OPTIONS: Array<{ value: UnavailableReason; label: string }> = [
  { value: 'RENTED_VIA_ARYTRANO', label: 'Loué via AryTrano' },
  { value: 'RENTED_OFF_PLATFORM', label: 'Loué en dehors d’AryTrano' },
  { value: 'TAKING_A_BREAK', label: 'Pause temporaire' },
  { value: 'OTHER', label: 'Autre' },
]

function Spinner() {
  return (
    <span
      className="mr-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current/30 border-t-current"
      aria-hidden
    />
  )
}

export function ListingActions({
  listingId,
  status,
  layout = 'row',
}: {
  listingId: string
  status: ListingStatus
  layout?: 'row' | 'column'
}) {
  const router = useRouter()
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<'publish' | 'toggle' | 'delete' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [pickingReason, setPickingReason] = useState(false)
  const [reason, setReason] = useState<UnavailableReason>('RENTED_VIA_ARYTRANO')

  function callAction(
    name: 'publish' | 'toggle' | 'delete',
    action: (prev: { ok: boolean }, fd: FormData) => Promise<{ ok: boolean; message?: string }>,
    extras: Record<string, string> = {},
  ) {
    setActiveAction(name)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('listingId', listingId)
      for (const [k, v] of Object.entries(extras)) fd.append(k, v)
      const result = await action({ ok: false }, fd)
      if (result.ok) {
        toast.success(result.message ?? t('listingActions.toast.ok'))
        if (name === 'toggle') setPickingReason(false)
        router.refresh()
      } else {
        toast.error(result.message ?? t('listingActions.toast.error'))
      }
      setActiveAction(null)
    })
  }


  const canPublish = status === 'DRAFT' || status === 'UNAVAILABLE'
  const canToggle = status === 'PUBLISHED' || status === 'UNAVAILABLE'

  return (
    <div className={layout === 'column' ? 'flex flex-col gap-2' : 'flex flex-wrap gap-2'}>
      {canPublish && status === 'DRAFT' && (
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={pending}
          aria-busy={activeAction === 'publish'}
          onClick={() => callAction('publish', publishListingAction)}
        >
          {activeAction === 'publish' && <Spinner />}
          {activeAction === 'publish' ? t('listingActions.publishing') : t('listingActions.publish')}
        </Button>
      )}

      {canToggle && !pickingReason && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          aria-busy={activeAction === 'toggle'}
          onClick={() => {
            // OWN-20 — PUBLISHED → UNAVAILABLE requires a reason first.
            if (status === 'PUBLISHED') {
              setPickingReason(true)
              return
            }
            callAction('toggle', toggleAvailabilityAction)
          }}
        >
          {activeAction === 'toggle' && <Spinner />}
          {activeAction === 'toggle'
            ? t('listingActions.updating')
            : status === 'PUBLISHED'
              ? t('listingActions.markUnavailable')
              : t('listingActions.markAvailable')}
        </Button>
      )}
      {pickingReason && (
        <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs">
          <p className="font-medium text-foreground">
            Pourquoi cette annonce n’est plus disponible ?
          </p>
          <div role="radiogroup" className="flex flex-col gap-1">
            {REASON_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-background"
              >
                <input
                  type="radio"
                  name="unavailable-reason"
                  value={opt.value}
                  checked={reason === opt.value}
                  onChange={() => setReason(opt.value)}
                  disabled={pending}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              aria-busy={activeAction === 'toggle'}
              onClick={() =>
                callAction('toggle', toggleAvailabilityAction, { reason })
              }
            >
              {activeAction === 'toggle' && <Spinner />}
              {activeAction === 'toggle'
                ? t('listingActions.updating')
                : 'Confirmer'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setPickingReason(false)}
            >
              {t('listingActions.cancel')}
            </Button>
          </div>
        </div>
      )}

      {!deleting ? (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => setDeleting(true)}
        >
          {t('listingActions.delete')}
        </Button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm">
          <span className="text-destructive">
            {t('listingActions.confirmHint')}{' '}
            <code className="rounded bg-background px-1 font-mono">
              {t('listingActions.confirmWord')}
            </code>
          </span>
          <Input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={pending}
            className="h-8 w-32"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending || confirm !== t('listingActions.confirmWord')}
            aria-busy={activeAction === 'delete'}
            onClick={() => callAction('delete', deleteListingAction)}
          >
            {activeAction === 'delete' && <Spinner />}
            {activeAction === 'delete' ? t('listingActions.deleting') : t('listingActions.confirm')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => {
              setDeleting(false)
              setConfirm('')
            }}
          >
            {t('listingActions.cancel')}
          </Button>
        </div>
      )}
    </div>
  )
}
