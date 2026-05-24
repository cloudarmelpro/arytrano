import 'server-only'
import { prisma } from '@/lib/db'

/**
 * Hard-delete a Testimonial. v0.5 volume is too low to justify a
 * soft-delete archive — admin can always recreate from the AryTrano
 * source-of-truth (the original WhatsApp/email exchange with the
 * owner). Returns true if a row was removed, false if it didn't
 * exist (idempotent).
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
  const result = await prisma.testimonial.deleteMany({ where: { id } })
  return result.count > 0
}
