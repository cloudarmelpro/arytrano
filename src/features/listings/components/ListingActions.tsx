'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ListingStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n/client'
import {
  publishListingAction,
  toggleAvailabilityAction,
  deleteListingAction,
} from '../actions/publish-listing'

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

  function callAction(
    name: 'publish' | 'toggle' | 'delete',
    action: (prev: { ok: boolean }, fd: FormData) => Promise<{ ok: boolean; message?: string }>,
  ) {
    setActiveAction(name)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('listingId', listingId)
      const result = await action({ ok: false }, fd)
      if (result.ok) {
        toast.success(result.message ?? t('listingActions.toast.ok'))
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

      {canToggle && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          aria-busy={activeAction === 'toggle'}
          onClick={() => callAction('toggle', toggleAvailabilityAction)}
        >
          {activeAction === 'toggle' && <Spinner />}
          {activeAction === 'toggle'
            ? t('listingActions.updating')
            : status === 'PUBLISHED'
              ? t('listingActions.markUnavailable')
              : t('listingActions.markAvailable')}
        </Button>
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
