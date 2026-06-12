'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import { upsertInventoryItemSchema } from '../schemas'
import { upsertInventoryItem } from '../services/upsert-inventory-item'

export type UpsertInventoryActionState = {
  ok: boolean
  message?: string
  itemId?: string
  fields?: Record<string, string[]>
}

/**
 * E-T27.2 — Server Action wrapping the upsert. ADMIN bypass intentional :
 * the inventory belongs to the parties, not the operator.
 */
export async function upsertInventoryItemAction(
  _prev: UpsertInventoryActionState,
  formData: FormData,
): Promise<UpsertInventoryActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  let input
  try {
    input = upsertInventoryItemSchema.parse({
      leaseId: formData.get('leaseId'),
      phase: formData.get('phase'),
      roomKey: formData.get('roomKey'),
      notes: formData.get('notes') ?? undefined,
      photoUrls: formData
        .getAll('photoUrls')
        .filter((v): v is string => typeof v === 'string'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      const fields: Record<string, string[]> = {}
      for (const issue of err.issues) {
        const key = issue.path[0]?.toString() ?? '_form'
        fields[key] ??= []
        fields[key]?.push(issue.message)
      }
      return { ok: false, message: 'Champs invalides.', fields }
    }
    throw err
  }

  const outcome = await upsertInventoryItem(input, session.user.id)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/dashboard/leases/${input.leaseId}/inventory`)
      revalidatePath(`/dashboard/leases/${input.leaseId}`)
      return { ok: true, itemId: outcome.itemId }
    case 'lease_not_found':
      return { ok: false, message: 'Bail introuvable.' }
    case 'not_a_party':
      return { ok: false, message: 'Accès refusé.' }
    case 'invalid_phase_for_status':
      return {
        ok: false,
        message: `Le bail est en statut ${outcome.status} — pas d’upload ${outcome.phase} possible.`,
      }
  }
}
