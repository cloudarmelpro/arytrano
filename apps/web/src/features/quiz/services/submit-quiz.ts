import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { rateLimiters } from '@/lib/rate-limit'
import { errors } from '@/lib/api/errors'
import { quizAnswersSchema } from '../schemas/quiz-answer'

/**
 * Persist a completed quiz. Anonymous — caller is responsible for
 * passing `ipHash` (extracted from headers in the action / API handler).
 *
 * Returns the submission id so the optional email-capture flow can
 * update the same row instead of creating a new one.
 */

export const submitQuizSchema = z.object({
  answers: quizAnswersSchema,
  recommendedSlugs: z.array(z.string().min(1).max(64)).min(1).max(8),
})

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>

export async function submitQuiz(input: {
  data: SubmitQuizInput
  ipHash: string | null
  locale: 'fr-MG' | 'mg'
}): Promise<{ submissionId: string }> {
  const limit = await rateLimiters.quizSubmit(input.ipHash ?? `noip:quiz`)
  if (!limit.success) throw errors.rateLimited('Trop de tentatives')

  const row = await prisma.quizSubmission.create({
    data: {
      locale: input.locale,
      email: null,
      answers: input.data.answers,
      recommendedSlugs: input.data.recommendedSlugs,
      ipHash: input.ipHash,
    },
    select: { id: true },
  })
  return { submissionId: row.id }
}
