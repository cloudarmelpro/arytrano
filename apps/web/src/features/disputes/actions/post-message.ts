'use server'

import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import { auth } from '@/features/auth'
import { postDisputeMessageSchema } from '../schemas'
import { postDisputeMessage } from '../services/post-dispute-message'

export type PostDisputeMessageActionState = {
  ok: boolean
  message?: string
}

export async function postDisputeMessageAction(
  _prev: PostDisputeMessageActionState,
  formData: FormData,
): Promise<PostDisputeMessageActionState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, message: 'Authentification requise.' }
  }

  let input
  try {
    input = postDisputeMessageSchema.parse({
      disputeId: formData.get('disputeId'),
      body: formData.get('body'),
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Saisie invalide.' }
    }
    throw err
  }

  const outcome = await postDisputeMessage(input, session.user.id, session.user.role)
  switch (outcome.kind) {
    case 'ok':
      revalidatePath(`/admin/disputes/${input.disputeId}`)
      return { ok: true }
    case 'dispute_not_found':
      return { ok: false, message: 'Litige introuvable.' }
    case 'not_authorized':
      return { ok: false, message: 'Accès refusé.' }
    case 'closed':
      return { ok: false, message: 'Ce litige est clôturé.' }
  }
}
