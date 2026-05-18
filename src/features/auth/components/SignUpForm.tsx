'use client'

import { useEffect, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { z } from 'zod'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import { signUpAction } from '../actions/sign-up'
import { signUpSchema } from '../schemas'

type SignUpFormValues = z.input<typeof signUpSchema>

export function SignUpForm({
  role,
  onPendingChange,
}: {
  role: 'STUDENT' | 'OWNER'
  /** Lets the parent lock the role selector / OAuth buttons during submission. */
  onPendingChange?: (pending: boolean) => void
}) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    onPendingChange?.(pending)
  }, [pending, onPendingChange])

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    // role is lifted to the parent SignUpClient — kept out of the form so
    // user input (email/password/name) is not reset when the parent re-renders.
    defaultValues: { email: '', password: '', name: '' },
  })

  const password = form.watch('password') ?? ''

  function onSubmit(values: SignUpFormValues) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)
      formData.append('password', values.password)
      if (values.name) formData.append('name', values.name)
      // Role comes from the parent SignUpClient — single source of truth so
      // the OAuth path and the credentials path share the same selection.
      formData.append('role', role)
      const result = await signUpAction({ ok: false }, formData)
      if (result.ok) return // redirect handled by Server Action
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-name">{t('signUp.name.label')}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                id="sign-up-name"
                type="text"
                autoComplete="name"
                placeholder={t('signUp.name.placeholder')}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'sign-up-name-error' : undefined}
                disabled={pending}
                className='h-10'
              />
              {fieldState.invalid && (
                <FieldError id="sign-up-name-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="sign-up-email">{t('signUp.email.label')}</FieldLabel>
              <Input
                {...field}
                id="sign-up-email"
                type="email"
                autoComplete="email"
                placeholder={t('signUp.email.placeholder')}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'sign-up-email-error' : undefined}
                disabled={pending}
                className='h-10'
              />
              {fieldState.invalid && (
                <FieldError id="sign-up-email-error" errors={[fieldState.error]} />
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
                <FieldLabel htmlFor="sign-up-password">{t('signUp.password.label')}</FieldLabel>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs text-muted-foreground hover:text-primary disabled:opacity-60"
                  aria-pressed={showPassword}
                  disabled={pending}
                >
                  {showPassword ? t('signUp.password.hide') : t('signUp.password.show')}
                </button>
              </div>
              <Input
                {...field}
                id="sign-up-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'sign-up-password-error' : undefined}
                disabled={pending}
                className='h-10'
              />
              <PasswordStrengthMeter value={password} />
              {fieldState.invalid && (
                <FieldError id="sign-up-password-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <div className="flex items-start gap-3 rounded-md bg-muted/60 p-3 text-sm">
          <Badge variant="secondary" className="shrink-0 uppercase tracking-wider text-[10px]">
            {t('signUp.verifyBadge')}
          </Badge>
          <p className="text-muted-foreground">{t('signUp.verifyHint')}</p>
        </div>

        <Label className="items-start text-foreground font-normal">
          <Checkbox required defaultChecked disabled={pending} className="mt-0.5" />
          <span>{t('signUp.terms')}</span>
        </Label>

        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
          {pending ? t('signUp.submitting') : t('signUp.submit')}
        </button>
      </FieldGroup>
    </form>
  )
}
