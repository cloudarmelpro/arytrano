'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { ZodError } from 'zod'
import { requireAdmin } from '@/features/admin/server'
import { createTestimonial } from '../services/create-testimonial'
import { createTestimonialSchema } from '../schemas/testimonial'

type ActionResult = {
  ok: boolean
  fieldErrors?: Record<string, string[]>
  message?: string
}

/**
 * Admin-only Server Action that creates a Testimonial.
 *
 * Auth path : `requireAdmin()` re-reads role from DB (no JWT trust).
 * On success : revalidate the admin list page + the landing-testimonials
 * tag so `getFeaturedOwnerTestimonial` picks up new published rows.
 * Then redirect to `/admin/testimonials` so the admin sees the result.
 */
export async function createTestimonialAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin()

  let input
  try {
    input = createTestimonialSchema.parse({
      audience: formData.get('audience'),
      body: formData.get('body'),
      authorName: formData.get('authorName'),
      authorMeta: formData.get('authorMeta'),
      sortOrder: Number(formData.get('sortOrder') ?? 0),
      publishImmediately: formData.get('publishImmediately') === 'on',
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, fieldErrors: err.flatten().fieldErrors }
    }
    throw err
  }

  try {
    await createTestimonial(input)
  } catch {
    return { ok: false, message: 'Impossible de créer le témoignage.' }
  }

  revalidatePath('/admin/testimonials')
  if (input.publishImmediately) {
    revalidateTag('landing-testimonials', 'max')
  }
  redirect('/admin/testimonials')
}
