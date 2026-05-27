'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/features/admin/services/require-admin'
import { createCity } from '../services/create-city'

export type CreateCityActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function createCityAction(
  _prev: CreateCityActionState,
  formData: FormData,
): Promise<CreateCityActionState> {
  await requireAdmin()

  const result = await createCity({
    slug: String(formData.get('slug') ?? '').trim(),
    nameFr: String(formData.get('nameFr') ?? '').trim(),
    nameMg: String(formData.get('nameMg') ?? '').trim(),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  })

  switch (result.kind) {
    case 'ok':
      revalidatePath('/admin/geo')
      // Public consumers: every page that lists cities or counts them.
      revalidatePath('/')
      revalidatePath('/quartiers')
      revalidatePath('/villes')
      updateTag('neighborhoods-counts')
      redirect(`/admin/geo/cities/${result.slug}`)
    case 'slug_taken':
      return {
        ok: false,
        fields: { slug: ['Ce slug est déjà utilisé'] },
      }
    case 'validation_failed':
      return {
        ok: false,
        message: 'Champs invalides.',
        fields: Object.fromEntries(
          result.issues.map((i) => [i.path, [i.message]]),
        ),
      }
  }
}
