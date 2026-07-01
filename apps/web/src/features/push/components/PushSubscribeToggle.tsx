'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  subscribePushAction,
  unsubscribePushAction,
} from '../actions/subscribe'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(b64)
  // Allocate a plain ArrayBuffer explicitly so the resulting view is
  // `Uint8Array<ArrayBuffer>` (not `<ArrayBufferLike>`), which
  // BufferSource in the DOM lib expects.
  const buffer = new ArrayBuffer(raw.length)
  const arr = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

/**
 * OWN-12 — dashboard toggle that manages the Push subscription for
 * the current browser. Reads the current subscription from the SW,
 * shows a subscribe / unsubscribe button. Silently unavailable when
 * either the browser or the VAPID env vars are missing.
 */
export function PushSubscribeToggle() {
  const [status, setStatus] = useState<
    'checking' | 'unavailable' | 'off' | 'on'
  >('checking')
  const [pending, startTransition] = useTransition()
  const [endpoint, setEndpoint] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !VAPID_PUBLIC_KEY
      ) {
        if (!cancelled) setStatus('unavailable')
        return
      }
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (cancelled) return
        if (sub) {
          setEndpoint(sub.endpoint)
          setStatus('on')
        } else {
          setStatus('off')
        }
      } catch {
        if (!cancelled) setStatus('unavailable')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (status === 'checking') return null
  if (status === 'unavailable') {
    return (
      <p className="text-xs text-muted-foreground">
        Les notifications push ne sont pas disponibles sur ce navigateur.
      </p>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          Notifications push (navigateur)
        </span>
        <span className="text-[12px] text-foreground/65">
          Recevoir une notification instantanée quand quelqu’un contacte une
          de tes annonces.
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant={status === 'on' ? 'outline' : 'default'}
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            try {
              const reg = await navigator.serviceWorker.ready
              if (status === 'on' && endpoint) {
                const sub = await reg.pushManager.getSubscription()
                await sub?.unsubscribe()
                await unsubscribePushAction(endpoint)
                setEndpoint(null)
                setStatus('off')
                toast.success('Notifications désactivées.')
                return
              }
              const permission = await Notification.requestPermission()
              if (permission !== 'granted') {
                toast.error('Permission refusée par le navigateur.')
                return
              }
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
              })
              const raw = sub.toJSON()
              const result = await subscribePushAction({
                endpoint: raw.endpoint,
                p256dh: raw.keys?.p256dh,
                auth: raw.keys?.auth,
                userAgent: navigator.userAgent,
              })
              if (result.ok) {
                setEndpoint(raw.endpoint ?? null)
                setStatus('on')
                toast.success('Notifications activées.')
              } else {
                toast.error(result.message ?? 'Erreur inconnue.')
              }
            } catch (err) {
              toast.error('Impossible de configurer les notifications.')
              console.error(err)
            }
          })
        }}
      >
        {pending ? '…' : status === 'on' ? 'Désactiver' : 'Activer'}
      </Button>
    </div>
  )
}
