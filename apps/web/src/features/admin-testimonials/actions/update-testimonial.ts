'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { requireAdmin } from '@/features/admin/server'
import { updateTestimonial } from '../services/update-testimonial'
import { updateTestimonialSchema } from '../schemas/testimonial'

type ActionResult = {
  ok: boolean
  fieldErrors?: Record<string, string[]>
  message?: string
}

export async function updateTestimonialAction(
  id: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin()

  let patch
  try {
    patch = updateTestimonialSchema.parse({
      audience: formData.get('audience'),
      body: formData.get('body'),
      authorName: formData.get('authorName'),
      authorMeta: formData.get('authorMeta'),
      sortOrder: Number(formData.get('sortOrder') ?? 0),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, fieldErrors: err.flatten().fieldErrors }
    }
    throw err
  }

  try {
    await updateTestimonial(id, patch)
  } catch {
    return { ok: false, message: 'Impossible de mettre à jour le témoignage.' }
  }

  revalidatePath('/admin/testimonials')
  revalidatePath(`/admin/testimonials/${id}/edit`)
  // Always revalidate the landing cache — even an unpublished edit can
  // affect the public if the row was already published.
  revalidateTag('landing-testimonials', 'max')
  redirect('/admin/testimonials')
}
