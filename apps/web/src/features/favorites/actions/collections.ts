'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/features/auth'
import { prisma } from '@/lib/db'

const nameSchema = z.string().trim().min(1).max(60)

type ActionResult = { ok: boolean; message?: string; id?: string }

/**
 * TEN-02 — create a new wishlist. Idempotent per (userId, name) so
 * a double click doesn't spawn two rows.
 */
export async function createFavoriteCollectionAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié.' }
  const parsed = nameSchema.safeParse(formData.get('name'))
  if (!parsed.success) return { ok: false, message: 'Nom invalide.' }
  const existing = await prisma.favoriteCollection.findFirst({
    where: { userId: session.user.id, name: parsed.data },
    select: { id: true },
  })
  if (existing) {
    revalidatePath('/dashboard/favoris')
    return { ok: true, id: existing.id }
  }
  const row = await prisma.favoriteCollection.create({
    data: { userId: session.user.id, name: parsed.data },
    select: { id: true },
  })
  revalidatePath('/dashboard/favoris')
  return { ok: true, id: row.id }
}

export async function renameFavoriteCollectionAction(
  collectionId: string,
  name: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié.' }
  const parsed = nameSchema.safeParse(name)
  if (!parsed.success) return { ok: false, message: 'Nom invalide.' }
  const result = await prisma.favoriteCollection.updateMany({
    where: { id: collectionId, userId: session.user.id },
    data: { name: parsed.data },
  })
  if (result.count === 0) return { ok: false, message: 'Liste introuvable.' }
  revalidatePath('/dashboard/favoris')
  return { ok: true }
}

export async function deleteFavoriteCollectionAction(
  collectionId: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié.' }
  // Cascade sets Favorite.collectionId to null so the favorites survive
  // the list's deletion. We just remove the wrapper row.
  const result = await prisma.favoriteCollection.deleteMany({
    where: { id: collectionId, userId: session.user.id },
  })
  if (result.count === 0) return { ok: false, message: 'Liste introuvable.' }
  revalidatePath('/dashboard/favoris')
  return { ok: true }
}

const moveSchema = z.object({
  listingId: z.string().min(1),
  collectionId: z.string().min(1).nullable(),
})

/**
 * TEN-02 — reassign a favorite to a collection (or back to "default"
 * with null). Silently no-ops when the favorite doesn't belong to
 * the caller.
 */
export async function moveFavoriteAction(
  input: unknown,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, message: 'Non authentifié.' }
  const parsed = moveSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: 'Paramètres invalides.' }

  if (parsed.data.collectionId) {
    const coll = await prisma.favoriteCollection.findFirst({
      where: { id: parsed.data.collectionId, userId: session.user.id },
      select: { id: true },
    })
    if (!coll) return { ok: false, message: 'Liste introuvable.' }
  }

  await prisma.favorite.updateMany({
    where: { listingId: parsed.data.listingId, userId: session.user.id },
    data: { collectionId: parsed.data.collectionId },
  })
  revalidatePath('/dashboard/favoris')
  return { ok: true }
}
