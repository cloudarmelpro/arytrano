'use client'

import { useActionState, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminUpdateListingAction } from '../actions/admin-update-listing'

const INITIAL = { ok: false as const }

type Defaults = {
  listingId: string
  title: string
  description: string
  priceMonthlyMGA: number
  cautionMonths: number | null
  surfaceM2: number | null
  bedrooms: number | null
  bathrooms: number | null
  furnished: boolean
  type: 'ROOM' | 'STUDIO' | 'APARTMENT' | 'HOUSE'
  cityId: string
  neighborhoodId: string
}

/**
 * ADM-12 — minimal admin form. Not a fully-featured editor (photos +
 * amenities live in the owner-side ListingForm) — just the fields an
 * admin would need to fix content on a moderated listing. Title,
 * description, price, and structural fields.
 */
export function AdminEditListingForm({ defaults }: { defaults: Defaults }) {
  const boundAction = adminUpdateListingAction.bind(null, defaults.listingId)
  const [state, action, pending] = useActionState(boundAction, INITIAL)
  const [values, setValues] = useState({
    title: defaults.title,
    description: defaults.description,
    priceMonthlyMGA: String(defaults.priceMonthlyMGA),
    cautionMonths: String(defaults.cautionMonths ?? 2),
    surfaceM2: defaults.surfaceM2 !== null ? String(defaults.surfaceM2) : '',
    bedrooms: defaults.bedrooms !== null ? String(defaults.bedrooms) : '',
    bathrooms: defaults.bathrooms !== null ? String(defaults.bathrooms) : '',
    furnished: defaults.furnished,
  })

  useEffect(() => {
    if (state.ok) toast.success(state.message ?? 'Sauvegardé.')
    else if (state.message) toast.error(state.message)
  }, [state])

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="type" value={defaults.type} />
      <input type="hidden" name="cityId" value={defaults.cityId} />
      <input type="hidden" name="neighborhoodId" value={defaults.neighborhoodId} />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Titre</span>
        <Input
          name="title"
          required
          minLength={5}
          maxLength={140}
          value={values.title}
          onChange={(e) => setValues({ ...values, title: e.target.value })}
          disabled={pending}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={4000}
          rows={6}
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          disabled={pending}
          className="min-h-[160px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Prix / mois (Ar)</span>
          <Input
            name="priceMonthlyMGA"
            type="number"
            required
            min={0}
            step={1000}
            value={values.priceMonthlyMGA}
            onChange={(e) => setValues({ ...values, priceMonthlyMGA: e.target.value })}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Caution (mois)</span>
          <Input
            name="cautionMonths"
            type="number"
            min={0}
            max={6}
            step={0.5}
            value={values.cautionMonths}
            onChange={(e) => setValues({ ...values, cautionMonths: e.target.value })}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Surface (m²)</span>
          <Input
            name="surfaceM2"
            type="number"
            min={0}
            value={values.surfaceM2}
            onChange={(e) => setValues({ ...values, surfaceM2: e.target.value })}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Chambres</span>
          <Input
            name="bedrooms"
            type="number"
            min={0}
            value={values.bedrooms}
            onChange={(e) => setValues({ ...values, bedrooms: e.target.value })}
            disabled={pending}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Sanitaires</span>
          <Input
            name="bathrooms"
            type="number"
            min={0}
            value={values.bathrooms}
            onChange={(e) => setValues({ ...values, bathrooms: e.target.value })}
            disabled={pending}
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm">
          <input
            type="checkbox"
            checked={values.furnished}
            onChange={(e) => setValues({ ...values, furnished: e.target.checked })}
            disabled={pending}
          />
          <input type="hidden" name="furnished" value={String(values.furnished)} />
          <span>Meublé</span>
        </label>
      </div>

      <Button type="submit" size="default" disabled={pending} className="self-start">
        {pending ? 'Sauvegarde…' : 'Sauvegarder'}
      </Button>
    </form>
  )
}
