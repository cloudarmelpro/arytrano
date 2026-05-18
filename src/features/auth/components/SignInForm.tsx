'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { signInAction } from '../actions/sign-in'
import { loginSchema, type LoginInput } from '../schemas'

export function SignInForm({
  onPendingChange,
}: {
  onPendingChange?: (pending: boolean) => void
} = {}) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [twofaPrompt, setTwofaPrompt] = useState(false)
  const [totpCode, setTotpCode] = useState('')
  const [totpError, setTotpError] = useState<string | null>(null)

  useEffect(() => {
    onPendingChange?.(pending)
  }, [pending, onPendingChange])

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  function submitWithValues(values: LoginInput, code?: string) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)
      if (code) formData.append('totpCode', code)
      const result = await signInAction({ ok: false }, formData)
      if (result.ok) return // redirect handled by Server Action

      if (result.needTotp) {
        setTwofaPrompt(true)
        setTotpError(result.message ?? null)
        if (result.message) toast.error(result.message)
        return
      }

      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  function onSubmit(values: LoginInput) {
    submitWithValues(values)
  }

  function onTotpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTotpError(null)
    const values = form.getValues()
    submitWithValues(values, totpCode.trim())
  }

  function backToCredentials() {
    setTwofaPrompt(false)
    setTotpCode('')
    setTotpError(null)
  }

  if (twofaPrompt) {
    return (
      <form onSubmit={onTotpSubmit}>
        <FieldGroup>
          <header className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-foreground">
              {t('signIn.twofa.title')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('signIn.twofa.lead')}</p>
          </header>

          <Field data-invalid={!!totpError}>
            <FieldLabel htmlFor="sign-in-totp">{t('signIn.twofa.code.label')}</FieldLabel>
            <Input
              id="sign-in-totp"
              type="text"
              inputMode="text"
              autoComplete="one-time-code"
              autoFocus
              placeholder="123456"
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.slice(0, 20))}
              maxLength={20}
              aria-invalid={!!totpError}
              aria-describedby={totpError ? 'sign-in-totp-error sign-in-totp-hint' : 'sign-in-totp-hint'}
              disabled={pending}
              className="h-10 font-mono tracking-widest"
            />
            <FieldDescription id="sign-in-totp-hint">{t('signIn.twofa.code.hint')}</FieldDescription>
            {totpError && <FieldError id="sign-in-totp-error" errors={[{ message: totpError }]} />}
          </Field>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={backToCredentials}
              disabled={pending}
            >
              {t('signIn.twofa.back')}
            </Button>
            <Button
              type="submit"
              variant="default"
              size="default"
              disabled={pending || totpCode.trim().length < 6}
              aria-busy={pending}
              className="inline-flex items-center justify-center gap-2"
            >
              {pending && (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                  aria-hidden
                />
              )}
              {pending ? t('signIn.twofa.submitting') : t('signIn.twofa.submit')}
            </Button>
          </div>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-in-email">{t('signIn.email.label')}</FieldLabel>
              <Input
                {...field}
                id="sign-in-email"
                type="email"
                autoComplete="email"
                placeholder={t('signIn.email.placeholder')}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'sign-in-email-error' : undefined}
                disabled={pending}
                className='h-10'
              />
              {fieldState.invalid && (
                <FieldError id="sign-in-email-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="sign-in-password">{t('signIn.password.label')}</FieldLabel>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs text-muted-foreground hover:text-primary disabled:opacity-60"
                  aria-pressed={showPassword}
                  disabled={pending}
                >
                  {showPassword ? t('signIn.password.hide') : t('signIn.password.show')}
                </button>
              </div>
              <Input
                {...field}
                id="sign-in-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'sign-in-password-error' : undefined}
                placeholder='********'
                disabled={pending}
                className='h-10'
              />
              <FieldDescription className="flex justify-end">
                <Link href="/forgot-password" className="text-primary hover:underline">
                  {t('signIn.forgot')}
                </Link>
              </FieldDescription>
              {fieldState.invalid && (
                <FieldError id="sign-in-password-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
          {pending ? t('signIn.submitting') : t('signIn.submit')}
        </button>
      </FieldGroup>
    </form>
  )
}
