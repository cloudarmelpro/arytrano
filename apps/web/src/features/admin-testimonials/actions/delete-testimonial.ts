'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/features/admin/server'
import { deleteTestimonial } from '../services/delete-testimonial'

type ActionResult = { ok: boolean; message?: string }

export async function deleteTestimonialAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin()
  try {
    const removed = await deleteTestimonial(id)
    if (!removed) {
      return { ok: false, message: 'Témoignage introuvable.' }
    }
    revalidatePath('/admin/testimonials')
    revalidateTag('landing-testimonials', 'max')
    return { ok: true }
  } catch {
    return { ok: false, message: 'Impossible de supprimer le témoignage.' }
  }
}
