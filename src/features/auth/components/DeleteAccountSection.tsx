'use client'

import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { deleteAccountAction } from '../actions/delete-account'
import { deleteAccountSchema, type DeleteAccountInput } from '../schemas'

function AlertIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export function DeleteAccountSection() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const form = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { confirm: '' as DeleteAccountInput['confirm'] },
    mode: 'onChange',
  })

  const confirmValue = form.watch('confirm') as unknown as string
  const valid = confirmValue === 'SUPPRIMER'

  function onSubmit(values: DeleteAccountInput) {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('confirm', values.confirm)
      const result = await deleteAccountAction({ ok: false }, formData)
      if (result.ok) {
        toast.success(t('deleteAccount.toast.success'))
        return // Server Action redirects to /?goodbye=1
      }
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t('deleteAccount.lead')}</p>
        <Button
          type="button"
          variant="destructive"
          size="default"
          onClick={() => setOpen(true)}
          className="self-start sm:self-auto cursor-pointer"
        >
          <AlertIcon className="size-4" />
          {t('deleteAccount.cta')}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <span className="mt-0.5 shrink-0 text-destructive">
            <AlertIcon />
          </span>
          <div className="flex flex-col gap-2 text-sm">
            <p className="font-medium text-destructive">{t('deleteAccount.warning.title')}</p>
            <ul className="ml-1 list-inside list-disc space-y-1 text-foreground/80">
              <li>{t('deleteAccount.warning.item.pii')}</li>
              <li>{t('deleteAccount.warning.item.listings')}</li>
              <li>{t('deleteAccount.warning.item.oauth')}</li>
              <li>{t('deleteAccount.warning.item.signOut')}</li>
            </ul>
          </div>
        </div>

        <Controller
          name="confirm"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="delete-confirm" className="text-foreground">
                {t('deleteAccount.confirm.label')}{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
                  SUPPRIMER
                </code>{' '}
                {t('deleteAccount.confirm.suffix')}
              </FieldLabel>
              <Input
                {...field}
                id="delete-confirm"
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                disabled={pending}
                className="focus-visible:ring-destructive"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="destructive"
            size="default"
            disabled={pending || !valid}
            aria-busy={pending}
            className="inline-flex items-center gap-2"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-destructive-foreground/30 border-t-destructive-foreground" aria-hidden />}
            {pending ? t('deleteAccount.submitting') : t('deleteAccount.submit')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={pending}
            onClick={() => {
              setOpen(false)
              form.reset()
            }}
          >
            {t('deleteAccount.cancel')}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
