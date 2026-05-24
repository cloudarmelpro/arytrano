'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Dialog } from '@base-ui/react/dialog'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n/client'
import {
  publishTestimonialAction,
  unpublishTestimonialAction,
} from '../actions/publish-testimonial'
import { deleteTestimonialAction } from '../actions/delete-testimonial'

type Props = {
  id: string
  isPublished: boolean
}

/**
 * Inline action cluster shown on each row of /admin/testimonials :
 * Edit (link) · Publish/Unpublish (toggle button) · Delete (Dialog
 * confirm). All actions tagged with toast feedback so the admin
 * doesn't wonder if their click did anything.
 */
export function TestimonialActions({ id, isPublished }: Props) {
  const t = useT()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function handlePublishToggle() {
    startTransition(async () => {
      const res = isPublished
        ? await unpublishTestimonialAction(id)
        : await publishTestimonialAction(id)
      if (res.ok) {
        toast.success(
          isPublished
            ? t('admin.testimonials.toast.unpublished')
            : t('admin.testimonials.toast.published'),
        )
      } else {
        toast.error(res.message ?? t('admin.testimonials.toast.error'))
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteTestimonialAction(id)
      if (res.ok) {
        toast.success(t('admin.testimonials.toast.deleted'))
        setDeleteOpen(false)
      } else {
        toast.error(res.message ?? t('admin.testimonials.toast.error'))
      }
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/testimonials/${id}/edit`}
        className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition hover:bg-muted"
      >
        {t('admin.testimonials.row.edit')}
      </Link>

      <Button
        type="button"
        variant={isPublished ? 'outline' : 'default'}
        size="sm"
        onClick={handlePublishToggle}
        disabled={pending}
        aria-busy={pending}
        aria-pressed={isPublished}
      >
        {isPublished
          ? t('admin.testimonials.row.unpublish')
          : t('admin.testimonials.row.publish')}
      </Button>

      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Trigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              {t('admin.testimonials.row.delete')}
            </Button>
          }
        />
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-6 shadow-xl data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {t('admin.testimonials.delete.dialog.title')}
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {t('admin.testimonials.delete.dialog.body')}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close
                render={
                  <Button type="button" variant="outline" disabled={pending}>
                    {t('admin.testimonials.delete.dialog.cancel')}
                  </Button>
                }
              />
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
                aria-busy={pending}
              >
                {t('admin.testimonials.delete.dialog.confirm')}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
