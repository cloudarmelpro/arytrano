'use client'

import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { z } from 'zod'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { updateProfileAction } from '../actions/update-profile'
import { uploadAvatarAction, removeAvatarAction } from '../actions/avatar'
import { updateProfileSchema } from '../schemas'

type ProfileFormValues = z.input<typeof updateProfileSchema>

export type ProfileFormProps = {
  defaultValues: {
    name: string | null
    phone: string | null
    locale: 'FR_MG' | 'MG'
    email: string
    image: string | null
  }
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const t = useT()
  const [pending, startTransition] = useTransition()
  const [avatarPending, setAvatarPending] = useState(false)
  const busy = pending || avatarPending

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onTouched',
    defaultValues: {
      name: defaultValues.name ?? '',
      phone: defaultValues.phone ?? '',
      locale: defaultValues.locale,
    },
  })

  function onSubmit(values: ProfileFormValues) {
    startTransition(async () => {
      const formData = new FormData()
      if (values.name) formData.append('name', values.name)
      if (values.phone) formData.append('phone', values.phone)
      if (values.locale) formData.append('locale', values.locale)
      const result = await updateProfileAction({ ok: false }, formData)
      if (result.ok) {
        toast.success(result.message ?? t('profileForm.toast.saved'))
        return
      }
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  async function handleAvatarChange(file: File) {
    setAvatarPending(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const result = await uploadAvatarAction({ ok: false }, formData)
      if (result.ok) toast.success(result.message ?? t('profileForm.toast.avatarSaved'))
      else toast.error(result.message ?? t('profileForm.toast.avatarFailed'))
    } finally {
      setAvatarPending(false)
    }
  }

  async function handleAvatarRemove() {
    setAvatarPending(true)
    try {
      const result = await removeAvatarAction()
      if (result.ok) toast.success(result.message ?? t('profileForm.toast.avatarRemoved'))
      else toast.error(result.message ?? t('profileForm.toast.error'))
    } finally {
      setAvatarPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Avatar row */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-1 ring-border">
          {defaultValues.image && <AvatarImage src={defaultValues.image} alt={t('profileForm.avatar.title')} />}
          <AvatarFallback className="text-2xl font-semibold text-primary">
            {defaultValues.name?.[0]?.toUpperCase() ?? defaultValues.email[0]?.toUpperCase() ?? 'A'}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium">{t('profileForm.avatar.title')}</p>
          <p className="text-xs text-muted-foreground">{t('profileForm.avatar.lead')}</p>
          <div className="mt-1 flex items-center gap-2">
            <label
              className={`inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium transition ${
                busy
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer hover:bg-muted'
              }`}
            >
              {avatarPending && <span className="h-3 w-3 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" aria-hidden />}
              {avatarPending ? t('profileForm.avatar.uploading') : t('profileForm.avatar.change')}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarChange(file)
                  e.target.value = ''
                }}
              />
            </label>
            {defaultValues.image && (
              <button
                type="button"
                onClick={handleAvatarRemove}
                disabled={busy}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('profileForm.avatar.remove')}
              </button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-name">{t('profileForm.name.label')}</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    placeholder={t('profileForm.name.placeholder')}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'profile-name-error' : undefined}
                    disabled={busy}
                    className='h-10'
                  />
                  {fieldState.invalid && (
                    <FieldError id="profile-name-error" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="profile-email">{t('profileForm.email.label')}</FieldLabel>
              <Input
                id="profile-email"
                defaultValue={defaultValues.email}
                disabled
                readOnly
                className='h-10'
              />
            </Field>

            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-phone">{t('profileForm.phone.label')}</FieldLabel>
                  <Input
                    {...field}
                    value={field.value ?? ''}
                    id="profile-phone"
                    type="tel"
                    placeholder={t('profileForm.phone.placeholder')}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={fieldState.invalid ? 'profile-phone-error profile-phone-hint' : 'profile-phone-hint'}
                    disabled={busy}
                    className='h-10'
                  />
                  <FieldDescription id="profile-phone-hint">{t('profileForm.phone.hint')}</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError id="profile-phone-error" errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="locale"
              control={form.control}
              render={({ field }) => {
                const localeItems = [
                  { value: 'FR_MG', label: t('profileForm.locale.fr-MG') },
                  { value: 'MG', label: t('profileForm.locale.mg') },
                ]
                return (
                  <Field>
                    <FieldLabel htmlFor="profile-locale">{t('profileForm.locale.label')}</FieldLabel>
                    <Select
                      value={field.value ?? 'FR_MG'}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={busy}
                      items={localeItems}
                    >
                      <SelectTrigger id="profile-locale" className="h-10 w-full">
                        <SelectValue placeholder={t('profileForm.locale.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {localeItems.map((it) => (
                          <SelectItem key={it.value} value={it.value}>
                            {it.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => form.reset()}
              disabled={busy}
              className="rounded-md border border-border px-5 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('profileForm.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy}
              aria-busy={pending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
              {pending ? t('profileForm.saving') : t('profileForm.save')}
            </button>
          </div>
        </FieldGroup>
      </form>
    </div>
  )
}
