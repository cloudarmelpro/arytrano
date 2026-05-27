'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/features/admin/services/require-admin'
import { createNeighborhood } from '../services/create-neighborhood'

export type CreateNeighborhoodActionState = {
  ok: boolean
  message?: string
  fields?: Record<string, string[]>
}

export async function createNeighborhoodAction(
  _prev: CreateNeighborhoodActionState,
  formData: FormData,
): Promise<CreateNeighborhoodActionState> {
  await requireAdmin()

  const citySlug = String(formData.get('citySlug') ?? '').trim()
  const result = await createNeighborhood({
    citySlug,
    slug: String(formData.get('slug') ?? '').trim(),
    nameFr: String(formData.get('nameFr') ?? '').trim(),
    nameMg: String(formData.get('nameMg') ?? '').trim(),
    lat: formData.get('lat'),
    lng: formData.get('lng'),
  })

  switch (result.kind) {
    case 'ok':
      revalidatePath('/admin/geo')
      revalidatePath(`/admin/geo/cities/${citySlug}`)
      revalidatePath(`/quartiers/${citySlug}`)
      revalidatePath(`/villes/${citySlug}`)
      updateTag('neighborhoods-counts')
      redirect(
        `/admin/geo/cities/${citySlug}/neighborhoods/${result.slug}`,
      )
    case 'city_not_found':
      return { ok: false, message: 'Ville introuvable.' }
    case 'slug_taken':
      return {
        ok: false,
        fields: {
          slug: ['Ce slug est déjà utilisé dans cette ville'],
        },
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
