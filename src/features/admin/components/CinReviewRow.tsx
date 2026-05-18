'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import {
  approveOwnerCinAction,
  rejectOwnerCinAction,
} from '../actions/review-cin'

/**
 * Admin row for one pending CIN submission (T-039). Inline approve /
 * reject controls — the reject path opens a textarea for the rejection
 * reason without leaving the row.
 *
 * The CIN preview is rendered via the protected `/admin/owner-verifications/
 * [ownerId]/cin` route — opens in a new tab so the admin can keep the
 * queue visible. Image MIME types preview inline; PDFs open as a tab.
 */
export function CinReviewRow({
  ownerId,
  email,
  name,
  phone,
  submittedAt,
  mimeType,
}: {
  ownerId: string
  email: string
  name: string | null
  phone: string | null
  submittedAt: Date
  mimeType: string | null
}) {
  const t = useT()
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle')
  const [reason, setReason] = useState('')
  const isImage = mimeType?.startsWith('image/')
  const cinHref = `/admin/owner-verifications/${ownerId}/cin`

  function onApprove() {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('ownerId', ownerId)
      const result = await approveOwnerCinAction({ ok: false }, fd)
      if (result.ok) {
        toast.success(result.message ?? t('admin.cin.approve.toast.ok'))
        router.refresh()
      } else {
        toast.error(result.message ?? t('admin.cin.approve.toast.error'))
      }
    })
  }

  function onReject() {
    if (reason.trim().length < 5) {
      toast.error(t('admin.cin.reject.tooShort'))
      return
    }
    startTransition(async () => {
      const fd = new FormData()
      fd.append('ownerId', ownerId)
      fd.append('reason', reason.trim())
      const result = await rejectOwnerCinAction({ ok: false }, fd)
      if (result.ok) {
        toast.success(result.message ?? t('admin.cin.reject.toast.ok'))
        setMode('idle')
        setReason('')
        router.refresh()
      } else {
        toast.error(result.message ?? t('admin.cin.reject.toast.error'))
      }
    })
  }

  return (
    <li className="flex flex-col gap-4 rounded-xl bg-muted/30 p-5 sm:flex-row sm:items-start">
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {name ?? '—'}
          </p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {email}
          </p>
          {phone && (
            <p className="font-mono text-xs text-muted-foreground">{phone}</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('admin.cin.submittedAt', {
            date: new Intl.DateTimeFormat('fr-FR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(submittedAt),
          })}
          {' · '}
          <a
            href={cinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            {isImage ? t('admin.cin.openImage') : t('admin.cin.openPdf')}
          </a>
        </p>

        {mode === 'rejecting' && (
          <div className="mt-2 flex flex-col gap-2">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('admin.cin.reject.reasonPlaceholder')}
              rows={3}
              maxLength={500}
              aria-label={t('admin.cin.reject.reasonAria')}
              disabled={pending}
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.cin.reject.reasonHint')}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-row gap-2 sm:flex-col sm:items-end">
        {mode === 'idle' ? (
          <>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onApprove}
              disabled={pending}
              aria-busy={pending}
            >
              {t('admin.cin.approve.cta')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMode('rejecting')}
              disabled={pending}
              className="text-destructive hover:text-destructive"
            >
              {t('admin.cin.reject.cta')}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onReject}
              disabled={pending || reason.trim().length < 5}
              aria-busy={pending}
            >
              {t('admin.cin.reject.confirm')}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setMode('idle')
                setReason('')
              }}
              disabled={pending}
            >
              {t('admin.cin.reject.cancel')}
            </Button>
          </>
        )}
      </div>
    </li>
  )
}
