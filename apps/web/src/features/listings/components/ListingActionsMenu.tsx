'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from '@base-ui/react/menu'
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

type ActionName = 'publish' | 'toggle' | 'delete'
type ActionFn = (
  prev: { ok: boolean },
  fd: FormData,
) => Promise<{ ok: boolean; message?: string }>

/**
 * Kebab-trigger dropdown used in the owner listings grid card. Wraps the
 * same Server Actions as `ListingActions` but renders them as compact
 * Base UI menu items instead of a row of buttons — keeps the flat,
 * visitor-style card layout uncluttered.
 *
 * Delete keeps its inline confirm step (typing "SUPPRIMER") for safety —
 * when active, the confirm strip replaces the trigger to make the
 * destructive action unmissable.
 */
export function ListingActionsMenu({
  listingId,
  status,
}: {
  listingId: string
  status: ListingStatus
}) {
  const router = useRouter()
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<ActionName | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirm, setConfirm] = useState('')

  function callAction(name: ActionName, action: ActionFn) {
    setActiveAction(name)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('listingId', listingId)
      const result = await action({ ok: false }, fd)
      if (result.ok) {
        toast.success(result.message ?? t('listingActions.toast.ok'))
        if (name === 'delete') {
          setDeleting(false)
          setConfirm('')
        }
        router.refresh()
      } else {
        toast.error(result.message ?? t('listingActions.toast.error'))
      }
      setActiveAction(null)
    })
  }

  const canPublish = status === 'DRAFT'
  const canToggle = status === 'PUBLISHED' || status === 'UNAVAILABLE'

  if (deleting) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-md bg-destructive/5 p-2 text-xs">
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
          aria-label={t('listingActions.confirmInput.aria')}
          className="h-8 w-28"
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
          {activeAction === 'delete'
            ? t('listingActions.deleting')
            : t('listingActions.confirm')}
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
    )
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={t('listingActions.menuAria')}
        disabled={pending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-popup-open:bg-muted data-popup-open:text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50 outline-none"
        >
          {/* 2026-06-12 — unified dropdown popup DNA. */}
          <Menu.Popup className="min-w-[11rem] overflow-hidden rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0">
            {canPublish && (
              <Menu.Item
                disabled={pending}
                onClick={() => callAction('publish', publishListingAction)}
                className="group/item flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-foreground outline-none transition data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-primary/10 data-highlighted:text-foreground"
              >
                <span className="flex h-4 w-4 items-center justify-center text-muted-foreground transition group-data-highlighted/item:text-primary">
                  <IconUpload />
                </span>
                {activeAction === 'publish'
                  ? t('listingActions.publishing')
                  : t('listingActions.publish')}
              </Menu.Item>
            )}
            {canToggle && (
              <Menu.Item
                disabled={pending}
                onClick={() => callAction('toggle', toggleAvailabilityAction)}
                className="group/item flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-foreground outline-none transition data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-primary/10 data-highlighted:text-foreground"
              >
                <span className="flex h-4 w-4 items-center justify-center text-muted-foreground transition group-data-highlighted/item:text-primary">
                  {status === 'PUBLISHED' ? <IconEyeOff /> : <IconEye />}
                </span>
                {activeAction === 'toggle'
                  ? t('listingActions.updating')
                  : status === 'PUBLISHED'
                    ? t('listingActions.markUnavailable')
                    : t('listingActions.markAvailable')}
              </Menu.Item>
            )}
            <Menu.Item
              disabled={pending}
              onClick={() => setDeleting(true)}
              className="group/item flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2.5 text-destructive outline-none transition data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-destructive/10"
            >
              <span className="flex h-4 w-4 items-center justify-center text-destructive transition">
                <IconTrash />
              </span>
              {t('listingActions.delete')}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function IconUpload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
