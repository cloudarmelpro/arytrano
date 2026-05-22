'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import {
  publishTestimonial,
  unpublishTestimonial,
} from '../services/publish-testimonial'

type ActionResult = { ok: boolean; message?: string }

export async function publishTestimonialAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin()
  try {
    await publishTestimonial(id)
    revalidatePath('/admin/testimonials')
    revalidateTag('landing-testimonials', 'max')
    return { ok: true }
  } catch {
    return { ok: false, message: 'Impossible de publier le témoignage.' }
  }
}

export async function unpublishTestimonialAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin()
  try {
    await unpublishTestimonial(id)
    revalidatePath('/admin/testimonials')
    revalidateTag('landing-testimonials', 'max')
    return { ok: true }
  } catch {
    return { ok: false, message: 'Impossible de dépublier le témoignage.' }
  }
}
