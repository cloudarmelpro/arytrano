'use client'

import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import { resetPasswordAction } from '../actions/reset-password'

// Client schema = server schema + confirm match check (client-only)
const resetPasswordClientSchema = z
  .object({
    password: z.string().min(8, 'Au moins 8 caractères').max(128),
    confirm: z.string().min(8, 'Au moins 8 caractères').max(128),
  })
  .refine((data) => data.password === data.confirm, {
    path: ['confirm'],
    message: 'Les deux mots de passe ne correspondent pas.',
  })

type ResetPasswordValues = z.infer<typeof resetPasswordClientSchema>

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordClientSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirm: '' },
  })

  const password = form.watch('password')

  function onSubmit(values: ResetPasswordValues) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('token', token)
      formData.append('password', values.password)
      const result = await resetPasswordAction({ ok: false }, formData)
      if (result.ok) return // redirect handled by Server Action
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-password">{t('reset.password.label')}</FieldLabel>
              <Input
                {...field}
                id="reset-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'reset-password-error' : undefined}
                disabled={pending}
                className='h-10'
              />
              <PasswordStrengthMeter value={password} />
              {fieldState.invalid && (
                <FieldError id="reset-password-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="confirm"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="reset-confirm">{t('reset.confirm.label')}</FieldLabel>
              <Input
                {...field}
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'reset-confirm-error' : undefined}
                disabled={pending}
                className='h-10'
              />
              {fieldState.invalid && (
                <FieldError id="reset-confirm-error" errors={[fieldState.error]} />
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
          {pending ? t('reset.submitting') : t('reset.submit')}
        </button>
      </FieldGroup>
    </form>
  )
}
