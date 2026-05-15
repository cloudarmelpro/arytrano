'use client'

import { useMemo, useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AMENITY_CATALOG, AmenityIcon } from '../amenities'
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
import { Button } from '@/components/ui/button'
import { applyServerErrors } from '@/lib/forms/apply-server-errors'
import { useT } from '@/lib/i18n/client'
import { createListingAction } from '../actions/create-listing'
import { updateListingAction } from '../actions/update-listing'
import { createListingSchema } from '../schemas'
import type { CityWithNeighborhoods } from '@/features/geo'

type FormValues = z.input<typeof createListingSchema>

const LISTING_TYPES: ReadonlyArray<FormValues['type']> = ['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE']

export type ListingFormProps =
  | {
      mode: 'create'
      cities: CityWithNeighborhoods[]
    }
  | {
      mode: 'edit'
      listingId: string
      cities: CityWithNeighborhoods[]
      defaultValues: FormValues
    }

export function ListingForm(props: ListingFormProps) {
  const t = useT()
  const [pending, startTransition] = useTransition()

  const typeOptions = useMemo(
    () => LISTING_TYPES.map((value) => ({ value, label: t(`listing.type.${value}` as const) })),
    [t],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues:
      props.mode === 'edit'
        ? props.defaultValues
        : {
            title: '',
            description: '',
            type: 'ROOM',
            priceMonthlyMGA: undefined as unknown as number,
            cityId: '',
            neighborhoodId: '',
            surfaceM2: undefined,
            bedrooms: undefined,
            bathrooms: undefined,
            furnished: false,
            amenities: [],
            customAmenities: [],
          },
  })

  const cityId = form.watch('cityId')
  const neighborhoods = useMemo(() => {
    const city = props.cities.find((c) => c.id === cityId)
    return city?.neighborhoods ?? []
  }, [cityId, props.cities])

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const fd = new FormData()
      fd.append('title', values.title)
      fd.append('description', values.description)
      fd.append('type', values.type)
      fd.append('priceMonthlyMGA', String(values.priceMonthlyMGA))
      fd.append('cityId', values.cityId)
      fd.append('neighborhoodId', values.neighborhoodId)
      if (values.surfaceM2) fd.append('surfaceM2', String(values.surfaceM2))
      if (values.bedrooms !== undefined) fd.append('bedrooms', String(values.bedrooms))
      if (values.bathrooms !== undefined) fd.append('bathrooms', String(values.bathrooms))
      fd.append('furnished', values.furnished ? 'true' : 'false')
      // Amenities: append one entry per checked value so `formData.getAll('amenities')`
      // on the server returns the full string[]. Always send (even empty) so an
      // edit that unchecks the last amenity actually clears the field server-side.
      fd.append('amenitiesSent', '1')
      for (const a of values.amenities ?? []) fd.append('amenities', a)
      for (const c of values.customAmenities ?? []) fd.append('customAmenities', c)

      const result =
        props.mode === 'create'
          ? await createListingAction({ ok: false }, fd)
          : await updateListingAction(props.listingId, { ok: false }, fd)

      if (result.ok) {
        toast.success(result.message ?? t('listingForm.toast.saved'))
        return
      }
      const { message } = applyServerErrors(form, result)
      if (message) toast.error(message)
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Native fieldset disables every input/textarea/checkbox/button inside.
          shadcn Selects need explicit disabled (Radix doesn't read fieldset). */}
      <fieldset disabled={pending} className="contents">
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="listing-title">{t('listingForm.title.label')}</FieldLabel>
              <Input
                {...field}
                id="listing-title"
                placeholder={t('listingForm.title.placeholder')}
                className="h-10"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="listing-desc">{t('listingForm.description.label')}</FieldLabel>
              <textarea
                {...field}
                id="listing-desc"
                rows={5}
                placeholder={t('listingForm.description.placeholder')}
                aria-invalid={fieldState.invalid}
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <FieldDescription>{t('listingForm.description.hint')}</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-type">{t('listingForm.type.label')}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                  disabled={pending}
                  items={typeOptions}
                >
                  <SelectTrigger id="listing-type" className="h-10 w-full">
                    <SelectValue placeholder={t('listingForm.type.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="priceMonthlyMGA"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-price">{t('listingForm.price.label')}</FieldLabel>
                <Input
                  id="listing-price"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  placeholder="250000"
                  className="h-10 font-mono"
                  value={field.value == null ? '' : String(field.value)}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  onBlur={field.onBlur}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Controller
            name="cityId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-city">{t('listingForm.city.label')}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v)
                    form.setValue('neighborhoodId', '', { shouldValidate: false })
                  }}
                  disabled={pending}
                  items={props.cities.map((c) => ({ value: c.id, label: c.nameFr }))}
                >
                  <SelectTrigger id="listing-city" className="h-10 w-full">
                    <SelectValue placeholder={t('listingForm.city.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {props.cities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="neighborhoodId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-neighborhood">{t('listingForm.neighborhood.label')}</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v)}
                  disabled={pending || neighborhoods.length === 0}
                  items={neighborhoods.map((n) => ({ value: n.id, label: n.nameFr }))}
                >
                  <SelectTrigger id="listing-neighborhood" className="h-10 w-full">
                    <SelectValue
                      placeholder={cityId ? t('listingForm.neighborhood.placeholder') : t('listingForm.neighborhood.pickCityFirst')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {neighborhoods.map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.nameFr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Controller
            name="surfaceM2"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-surface">{t('listingForm.surface.label')}</FieldLabel>
                <Input
                  id="listing-surface"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  placeholder="12"
                  className="h-10"
                  value={field.value == null ? '' : String(field.value)}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  onBlur={field.onBlur}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="bedrooms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-bedrooms">{t('listingForm.bedrooms.label')}</FieldLabel>
                <Input
                  id="listing-bedrooms"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="1"
                  className="h-10"
                  value={field.value == null ? '' : String(field.value)}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  onBlur={field.onBlur}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="bathrooms"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="listing-bathrooms">{t('listingForm.bathrooms.label')}</FieldLabel>
                <Input
                  id="listing-bathrooms"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="1"
                  className="h-10"
                  value={field.value == null ? '' : String(field.value)}
                  onChange={(e) =>
                    field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                  }
                  onBlur={field.onBlur}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="furnished"
          control={form.control}
          render={({ field }) => (
            <Field>
              <Label className="font-normal">
                <Checkbox
                  checked={field.value === true || field.value === 'true'}
                  onCheckedChange={(c) => field.onChange(c)}
                />
                <span>{t('listingForm.furnished.label')}</span>
              </Label>
            </Field>
          )}
        />

        {/* Amenity multi-select — bound to an Amenity[] array. */}
        <Controller
          name="amenities"
          control={form.control}
          render={({ field }) => {
            const selected = new Set<string>(field.value ?? [])
            function toggle(value: string) {
              const next = new Set(selected)
              if (next.has(value)) next.delete(value)
              else next.add(value)
              field.onChange(Array.from(next))
            }
            return (
              <Field>
                <span className="text-sm font-medium text-foreground">
                  {t('listingForm.amenities.label')}
                </span>
                <p className="-mt-1 text-xs text-muted-foreground">
                  {t('listingForm.amenities.hint')}
                </p>
                <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {AMENITY_CATALOG.map((a) => {
                    const isOn = selected.has(a.value)
                    return (
                      <li key={a.value}>
                        <Label className="cursor-pointer rounded-md border border-input bg-background px-3 py-2 transition hover:bg-muted data-[checked=true]:border-primary data-[checked=true]:bg-primary/5 font-normal" data-checked={isOn}>
                          <Checkbox
                            checked={isOn}
                            onCheckedChange={() => toggle(a.value)}
                          />
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                            <AmenityIcon amenity={a.value} />
                          </span>
                          <span className="text-sm">{t(a.labelKey)}</span>
                        </Label>
                      </li>
                    )
                  })}
                </ul>
              </Field>
            )
          }}
        />

        {/* Custom amenities — free-form labels for what isn't in the catalog. */}
        <Controller
          name="customAmenities"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <span className="text-sm font-medium text-foreground">
                {t('listingForm.customAmenities.label')}
              </span>
              <p className="-mt-1 text-xs text-muted-foreground">
                {t('listingForm.customAmenities.hint')}
              </p>
              <CustomAmenitiesEditor
                value={field.value ?? []}
                onChange={(next) => field.onChange(next)}
                t={t}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            variant="default"
            size="default"
            disabled={pending}
            aria-busy={pending}
            className="inline-flex items-center gap-2"
          >
            {pending && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" aria-hidden />}
            {pending
              ? t('listingForm.submit.saving')
              : props.mode === 'create'
                ? t('listingForm.submit.create')
                : t('listingForm.submit.update')}
          </Button>
        </div>
      </FieldGroup>
      </fieldset>
    </form>
  )
}

function CustomAmenitiesEditor({
  value,
  onChange,
  t,
}: {
  value: string[]
  onChange: (next: string[]) => void
  t: ReturnType<typeof useT>
}) {
  const [draft, setDraft] = useState('')
  const trimmed = draft.trim()
  const tooLong = trimmed.length > 60
  const dup = trimmed.length > 0 && value.includes(trimmed)
  const limitReached = value.length >= 10
  const canAdd = trimmed.length >= 2 && !tooLong && !dup && !limitReached

  function add() {
    if (!canAdd) return
    onChange([...value, trimmed])
    setDraft('')
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t('listingForm.customAmenities.listAria')}>
          {value.map((label, i) => (
            <li
              key={`${label}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm text-foreground"
            >
              <CustomAmenitySparkle />
              <span>{label}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={t('listingForm.customAmenities.remove', { label })}
                className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={t('listingForm.customAmenities.placeholder')}
          maxLength={60}
          disabled={limitReached}
          className="h-10 flex-1"
        />
        <Button type="button" variant="outline" size="default" onClick={add} disabled={!canAdd}>
          {t('listingForm.customAmenities.add')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {limitReached
          ? t('listingForm.customAmenities.limitReached')
          : t('listingForm.customAmenities.counter', { count: value.length, max: 10 })}
      </p>
    </div>
  )
}

function CustomAmenitySparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-primary">
      <path d="M12 2l2.39 5.96L20 9l-4.5 4.39L17 20l-5-3-5 3 1.5-6.61L4 9l5.61-1.04z" />
    </svg>
  )
}
