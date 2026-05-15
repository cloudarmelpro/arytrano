'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useT } from '@/lib/i18n/client'
import {
  disableTotpAction,
  enableTotpAction,
  startTotpSetupAction,
} from '../actions/totp'

type Phase =
  | { kind: 'idle' }
  | { kind: 'setup'; secret: string; otpauth: string; qrDataUrl: string; code: string; error: string | null }
  | { kind: 'recovery'; codes: string[]; confirmed: boolean }
  | { kind: 'disabling'; code: string; error: string | null }

export function TwoFactorSection({
  initialEnabled,
  activeRecoveryCodes,
}: {
  initialEnabled: boolean
  activeRecoveryCodes: number
}) {
  const t = useT()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [pending, startTransition] = useTransition()

  function beginSetup() {
    startTransition(async () => {
      const result = await startTotpSetupAction()
      if (!result.ok) {
        toast.error(result.message)
        return
      }
      setPhase({
        kind: 'setup',
        secret: result.secret,
        otpauth: result.otpauth,
        qrDataUrl: result.qrDataUrl,
        code: '',
        error: null,
      })
    })
  }

  function submitSetupCode() {
    if (phase.kind !== 'setup') return
    startTransition(async () => {
      const result = await enableTotpAction({ secret: phase.secret, code: phase.code })
      if (!result.ok) {
        setPhase({ ...phase, error: result.message })
        return
      }
      toast.success(t('twofa.toast.enabled'))
      setEnabled(true)
      setPhase({ kind: 'recovery', codes: result.recoveryCodes, confirmed: false })
    })
  }

  function finishRecovery() {
    if (phase.kind !== 'recovery') return
    setPhase({ kind: 'idle' })
  }

  function startDisable() {
    setPhase({ kind: 'disabling', code: '', error: null })
  }

  function submitDisable() {
    if (phase.kind !== 'disabling') return
    startTransition(async () => {
      const result = await disableTotpAction(phase.code)
      if (!result.ok) {
        setPhase({ ...phase, error: result.message ?? 'Échec' })
        return
      }
      toast.success(t('twofa.toast.disabled'))
      setEnabled(false)
      setPhase({ kind: 'idle' })
    })
  }

  // ============ RECOVERY CODES (one-time view) ============
  if (phase.kind === 'recovery') {
    return (
      <div className="flex flex-col gap-4 rounded-md border border-success/30 bg-success/5 p-4">
        <header className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-success">{t('twofa.recovery.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('twofa.recovery.lead')}</p>
        </header>
        <ul className="grid grid-cols-2 gap-2 rounded-md bg-background p-3 font-mono text-sm">
          {phase.codes.map((c) => (
            <li key={c} className="text-foreground">
              {c}
            </li>
          ))}
        </ul>
        <Label className="items-start text-foreground font-normal">
          <Checkbox
            checked={phase.confirmed}
            onCheckedChange={(c) => setPhase({ ...phase, confirmed: c })}
            className="mt-0.5"
          />
          <span>{t('twofa.recovery.confirm')}</span>
        </Label>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={finishRecovery}
            disabled={!phase.confirmed}
          >
            {t('twofa.recovery.done')}
          </Button>
        </div>
      </div>
    )
  }

  // ============ SETUP (scan + first code) ============
  if (phase.kind === 'setup') {
    return (
      <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
        <header className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-foreground">{t('twofa.setup.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('twofa.setup.lead')}</p>
        </header>

        <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3 sm:flex-row sm:items-center">
          <div className="relative h-40 w-40 shrink-0 self-center sm:self-start">
            <Image src={phase.qrDataUrl} alt={t('twofa.setup.qrAlt')} fill unoptimized className="object-contain" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-xs text-muted-foreground">{t('twofa.setup.cantScan')}</p>
            <code className="select-all break-all rounded-md bg-muted px-2 py-1.5 font-mono text-xs">
              {phase.secret}
            </code>
            <p className="text-xs text-muted-foreground">{t('twofa.setup.afterScan')}</p>
          </div>
        </div>

        <Field data-invalid={!!phase.error}>
          <FieldLabel htmlFor="twofa-setup-code">{t('twofa.setup.code.label')}</FieldLabel>
          <Input
            id="twofa-setup-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={phase.code}
            onChange={(e) => setPhase({ ...phase, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            maxLength={6}
            disabled={pending}
            className="h-10 font-mono tracking-widest"
            aria-invalid={!!phase.error}
          />
          {phase.error && <FieldError errors={[{ message: phase.error }]} />}
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="default" onClick={() => setPhase({ kind: 'idle' })} disabled={pending}>
            {t('twofa.cancel')}
          </Button>
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={submitSetupCode}
            disabled={pending || phase.code.length !== 6}
            aria-busy={pending}
            className="inline-flex items-center gap-2"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
            {pending ? t('twofa.setup.submitting') : t('twofa.setup.submit')}
          </Button>
        </div>
      </div>
    )
  }

  // ============ DISABLING (verify code first) ============
  if (phase.kind === 'disabling') {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
        <header className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-destructive">{t('twofa.disable.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('twofa.disable.lead')}</p>
        </header>
        <Field data-invalid={!!phase.error}>
          <FieldLabel htmlFor="twofa-disable-code">{t('twofa.disable.code.label')}</FieldLabel>
          <Input
            id="twofa-disable-code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            placeholder="123456"
            value={phase.code}
            onChange={(e) => setPhase({ ...phase, code: e.target.value.slice(0, 10) })}
            maxLength={10}
            disabled={pending}
            className="h-10 font-mono"
            aria-invalid={!!phase.error}
          />
          {phase.error && <FieldError errors={[{ message: phase.error }]} />}
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="default" onClick={() => setPhase({ kind: 'idle' })} disabled={pending}>
            {t('twofa.cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="default"
            onClick={submitDisable}
            disabled={pending || phase.code.length < 6}
            aria-busy={pending}
            className="inline-flex items-center gap-2"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" aria-hidden />}
            {pending ? t('twofa.disable.submitting') : t('twofa.disable.submit')}
          </Button>
        </div>
      </div>
    )
  }

  // ============ IDLE (status + primary action) ============
  return (
    <div className="flex flex-col gap-3">
      {enabled ? (
        <div className="flex flex-col gap-3 rounded-md border border-success/30 bg-success/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-success">{t('twofa.idle.enabled.title')}</p>
            <p className="text-xs text-muted-foreground">
              {t('twofa.idle.enabled.codesLeft', { count: activeRecoveryCodes })}
            </p>
          </div>
          <Button type="button" variant="outline" size="default" onClick={startDisable}>
            {t('twofa.idle.enabled.disableCta')}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-foreground">{t('twofa.idle.disabled.title')}</p>
            <p className="text-xs text-muted-foreground">{t('twofa.idle.disabled.lead')}</p>
          </div>
          <Button
            type="button"
            variant="default"
            size="default"
            onClick={beginSetup}
            disabled={pending}
            aria-busy={pending}
            className="inline-flex items-center gap-2"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
            {t('twofa.idle.disabled.enableCta')}
          </Button>
        </div>
      )}
    </div>
  )
}
