'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sendOwnerBroadcastAction } from '../actions/send-owner-broadcast'

const INITIAL = { ok: false as const }

export function OwnerBroadcastForm() {
  const [state, action, pending] = useActionState(
    sendOwnerBroadcastAction,
    INITIAL,
  )
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (state.ok) {
      toast.success(
        `Broadcast envoyé : ${state.sent} / ${state.scanned} propriétaires (${state.failed} échecs).`,
      )
      setSubject('')
      setBody('')
      setConfirming(false)
    } else if (state.message) toast.error(state.message)
  }, [state])

  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-foreground">Sujet</span>
        <input
          name="subject"
          required
          minLength={4}
          maxLength={140}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={pending}
          className="h-10 rounded-md border border-border bg-background px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-foreground">Corps</span>
        <textarea
          name="body"
          required
          minLength={20}
          maxLength={5000}
          rows={12}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={pending}
          className="min-h-[280px] rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          placeholder="Bonjour,

Voici une mise à jour importante..."
        />
        <span className="text-[11px] text-muted-foreground">
          {body.length} / 5000 caractères. Les sauts de ligne sont préservés.
        </span>
      </label>

      {!confirming ? (
        <Button
          type="button"
          size="default"
          variant="destructive"
          disabled={pending || subject.trim().length < 4 || body.trim().length < 20}
          onClick={() => setConfirming(true)}
        >
          Revoir + confirmer
        </Button>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-destructive">
            Tu vas envoyer cet email à TOUS les propriétaires actifs.
          </p>
          <p className="text-foreground/85">
            Cette action est irréversible et coûte des crédits SMTP.
            Vérifie le sujet + corps ci-dessus.
          </p>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              variant="destructive"
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? 'Envoi en cours…' : 'Envoyer maintenant'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
