'use client'

import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { setPasswordAction, changePasswordAction } from '../actions/set-password'
import {
  setPasswordSchema,
  changePasswordSchema,
  type SetPasswordInput,
  type ChangePasswordInput,
} from '../schemas'

export function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  if (hasPassword) return <ChangePassword />
  return <AddPassword />
}

function AddPassword() {
  const t = useT()
  const [pending, startTransition] = useTransition()

  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '' },
  })

  function onSubmit(values: SetPasswordInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('password', values.password)
      const result = await setPasswordAction({ ok: false }, formData)
      if (result.ok) {
        toast.success(result.message ?? t('password.toast.added'))
        form.reset()
        return
      }
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={pending} className="contents">
      <FieldGroup>
        <p className="text-sm text-muted-foreground">{t('password.add.lead')}</p>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="add-password">{t('password.add.label')}</FieldLabel>
              <Input
                {...field}
                id="add-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'add-password-error' : undefined}
              />
              {fieldState.invalid && (
                <FieldError id="add-password-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <div>
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
            {pending ? t('password.add.submitting') : t('password.add.submit')}
          </button>
        </div>
      </FieldGroup>
      </fieldset>
    </form>
  )
}

function ChangePassword() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched',
    defaultValues: { currentPassword: '', newPassword: '' },
  })

  function onSubmit(values: ChangePasswordInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('currentPassword', values.currentPassword)
      formData.append('newPassword', values.newPassword)
      const result = await changePasswordAction({ ok: false }, formData)
      if (result.ok) {
        toast.success(result.message ?? t('password.toast.updated'))
        form.reset()
        setOpen(false)
        return
      }
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  if (!open) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('password.change.set')}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="change-password-form"
          className="rounded-md border border-border px-4 py-1.5 text-sm font-medium hover:bg-muted"
        >
          {t('password.change.edit')}
        </button>
      </div>
    )
  }

  return (
    <form id="change-password-form" onSubmit={form.handleSubmit(onSubmit)}>
      <fieldset disabled={pending} className="contents">
      <FieldGroup>
        <Controller
          name="currentPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="current-password">{t('password.change.current.label')}</FieldLabel>
              <Input
                {...field}
                id="current-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'current-password-error' : undefined}
              />
              {fieldState.invalid && (
                <FieldError id="current-password-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="newPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="new-password-change">{t('password.change.new.label')}</FieldLabel>
              <Input
                {...field}
                id="new-password-change"
                type="password"
                autoComplete="new-password"
                minLength={8}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.invalid ? 'new-password-change-error' : undefined}
              />
              {fieldState.invalid && (
                <FieldError id="new-password-change-error" errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
            {pending ? t('password.change.submitting') : t('password.change.submit')}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setOpen(false)
              form.reset()
            }}
            className="rounded-md border border-border px-5 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('password.cancel')}
          </button>
        </div>
      </FieldGroup>
      </fieldset>
    </form>
  )
}
