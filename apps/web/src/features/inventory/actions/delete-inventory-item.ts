'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import { deleteInventoryItemSchema } from '../schemas'
import { deleteInventoryItem } from '../services/delete-inventory-item'

export type DeleteInventoryActionState = {
  ok: boolean
  message?: string
}

export async function deleteInventoryItemAction(
  _prev: DeleteInventoryActionState,
  formData: FormData,
): Promise<DeleteInventoryActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  let input
  try {
    input = deleteInventoryItemSchema.parse({
      leaseId: formData.get('leaseId'),
      itemId: formData.get('itemId'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: 'Identifiants invalides.' }
    }
    throw err
  }

  const outcome = await deleteInventoryItem(input, session.user.id)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/dashboard/leases/${input.leaseId}/inventory`)
      return { ok: true }
    case 'lease_not_found':
    case 'item_not_found':
      return { ok: false, message: 'Élément introuvable.' }
    case 'not_a_party':
    case 'item_wrong_lease':
      return { ok: false, message: 'Accès refusé.' }
    case 'entry_locked_after_termination':
      return {
        ok: false,
        message:
          'L’état des lieux d’entrée est verrouillé après la fin du bail (preuves de litige).',
      }
  }
}
