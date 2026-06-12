'use client'

import { Menu } from '@base-ui/react/menu'
import { useT } from '@/lib/i18n/client'

/**
 * Facebook-style kebab menu (3 dots) for comment / review / owner-response
 * rows. Trigger lives top-right of the parent (parent must be `relative`).
 * Clicking opens a Base UI Menu popover with two items: Modifier / Supprimer.
 *
 * The actual edit + delete logic stays in the host component (`onEdit`,
 * `onDelete` callbacks) so this stays a thin presentational shell —
 * easy to drop on either a review or an owner-response without coupling.
 */
export function CommentActionsMenu({
  onEdit,
  onDelete,
  triggerAriaLabel,
}: {
  onEdit: () => void
  onDelete: () => void
  /** Screen-reader label for the trigger button. */
  triggerAriaLabel: string
}) {
  const t = useT()
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={triggerAriaLabel}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted data-popup-open:text-foreground"
      >
        <KebabIcon />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={4} className="z-50 outline-none">
          {/* 2026-06-12 — unified dropdown popup DNA. */}
          <Menu.Popup className="min-w-[11rem] overflow-hidden rounded-xl bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0">
            <Menu.Item
              onClick={onEdit}
              className="flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2.5 font-medium text-foreground outline-none transition data-highlighted:bg-primary/10 data-highlighted:text-foreground"
            >
              <PencilIcon />
              <span>{t('commentActions.edit')}</span>
            </Menu.Item>
            <Menu.Item
              onClick={onDelete}
              className="flex cursor-pointer select-none items-center gap-3 rounded-md px-3 py-2.5 font-medium text-destructive outline-none transition data-highlighted:bg-destructive/10"
            >
              <TrashIcon />
              <span>{t('commentActions.delete')}</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function KebabIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
