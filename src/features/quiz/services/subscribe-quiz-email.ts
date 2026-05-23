import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { errors } from '@/lib/api/errors'

/**
 * Attach an email to a previously-submitted quiz row.
 *
 * Idempotent on the email value, but only allowed when the row's email
 * is currently NULL — prevents an attacker who guesses a submission id
 * from overwriting someone else's address.
 */

export const subscribeQuizEmailSchema = z.object({
  submissionId: z.string().min(20).max(40),
  email: z.string().trim().toLowerCase().email().max(254),
})

export type SubscribeQuizEmailInput = z.infer<typeof subscribeQuizEmailSchema>

export async function subscribeQuizEmail(input: {
  data: SubscribeQuizEmailInput
  ipHash: string | null
}): Promise<void> {
  const limit = await rateLimiters.quizSubmit(input.ipHash ?? `noip:quiz`)
  if (!limit.success) throw errors.rateLimited('Trop de tentatives')

  const result = await prisma.quizSubmission.updateMany({
    where: { id: input.data.submissionId, email: null },
    data: { email: input.data.email },
  })
  if (result.count === 0) {
    // Row doesn't exist OR was already claimed. Same 404 in both cases —
    // we don't want to disclose which submission ids exist.
    throw errors.notFound('Soumission introuvable ou déjà liée')
  }
}
