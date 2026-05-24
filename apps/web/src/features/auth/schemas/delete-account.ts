import { z } from 'zod'

export const deleteAccountSchema = z.object({
  confirm: z.literal('SUPPRIMER', { message: 'Tape exactement SUPPRIMER pour confirmer' }),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>
