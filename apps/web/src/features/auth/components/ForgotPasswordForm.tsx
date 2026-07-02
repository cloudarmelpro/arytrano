'use client'

import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { forgotPasswordAction } from '../actions/forgot-password'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas'

export function ForgotPasswordForm() {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
    defaultValues: { email: '' },
  })

  function onSubmit(values: ForgotPasswordInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', values.email)
      const result = await forgotPasswordAction({ ok: false }, formData)
      if (result.ok) {
        toast.success(result.message ?? t('forgot.toast.sent'))
        setDone(result.message ?? t('forgot.toast.sent'))
        return
      }
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  if (done) {
    return (
      <div role="status" className="rounded-md bg-success/10 p-4 text-sm text-foreground">
        {done}
      </div>
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
              <FieldLabel htmlFor="forgot-email">{t('forgot.email.label')}</FieldLabel>
              <Input
                {...field}
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder={t('forgot.email.placeholder')}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'forgot-email-error forgot-email-hint' : 'forgot-email-hint'}
                disabled={pending}
                className='h-10'
              />
              <FieldDescription id="forgot-email-hint">{t('forgot.email.hint')}</FieldDescription>
              {fieldState.invalid && (
                <FieldError id="forgot-email-error" errors={[fieldState.error]} />
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
          {pending ? t('forgot.submitting') : t('forgot.submit')}
        </button>
      </FieldGroup>
    </form>
  )
}
