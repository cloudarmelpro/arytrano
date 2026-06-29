'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  createAdminNoteAction,
  deleteAdminNoteAction,
  type AdminNoteTargetType,
  type CreateAdminNoteActionState,
} from '@/features/admin-notes'

type NoteRow = {
  id: string
  body: string
  createdAt: string
  author: { id: string; name: string | null; email: string }
}

const INITIAL: CreateAdminNoteActionState = { ok: false }

function fmt(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/**
 * ADM-08 — admin notes panel.
 *
 * Renders the list (server-fetched) + a Compose field + delete buttons
 * (author-only). All writes go through the Server Actions which call
 * requireAdmin() and audit-log the change. Author identity is checked
 * server-side; we surface the delete button optimistically based on
 * `currentUserId`.
 */
export function AdminNotesPanel({
  targetType,
  targetId,
  notes,
  currentUserId,
  revalidatePath,
}: {
  targetType: AdminNoteTargetType
  targetId: string
  notes: NoteRow[]
  currentUserId: string
  revalidatePath: string
}) {
  const [state, action, pending] = useActionState(
    createAdminNoteAction,
    INITIAL,
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [body, setBody] = useState('')
  const [, startTransition] = useTransition()

  // Reset the textarea after a successful submit. The server's revalidate
  // brings new rows in via the `notes` prop.
  useEffect(() => {
    if (state.ok) {
      setBody('')
      formRef.current?.reset()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  async function handleDelete(id: string) {
    const result = await deleteAdminNoteAction(id, revalidatePath)
    if (!result.ok && result.message) toast.error(result.message)
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-background p-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">Notes admin</h2>
        <p className="text-xs text-muted-foreground">
          Internes — visibles uniquement par les admins. Markdown plain text.
        </p>
      </header>

      <form
        ref={formRef}
        action={action}
        className="flex flex-col gap-2"
        aria-busy={pending}
      >
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="admin-note-body">Nouvelle note</FieldLabel>
            <textarea
              id="admin-note-body"
              name="body"
              required
              minLength={2}
              maxLength={2000}
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={pending}
              className="min-h-[80px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              placeholder="Contexte interne, alertes, suite à donner…"
            />
          </Field>
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={pending || body.trim().length < 2}>
            {pending ? 'Enregistrement…' : 'Ajouter la note'}
          </Button>
        </div>
      </form>

      <ul className="flex flex-col gap-3">
        {notes.length === 0 ? (
          <li className="text-sm italic text-muted-foreground">Aucune note pour cette cible.</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3"
            >
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span className="font-medium text-foreground">
                  {note.author.name ?? note.author.email}
                </span>
                <time className="font-mono text-foreground/55">
                  {fmt(note.createdAt)}
                </time>
              </div>
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/85">
                {note.body}
              </pre>
              {note.author.id === currentUserId && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => startTransition(() => handleDelete(note.id))}
                    className="text-[11px] font-medium text-destructive hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
