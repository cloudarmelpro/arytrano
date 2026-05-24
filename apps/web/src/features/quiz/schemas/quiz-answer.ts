import { z } from 'zod'

/**
 * Zod schema for quiz answers — used by:
 *   - the client wizard to validate before submit
 *   - the Server Action that persists the submission
 *   - any future REST endpoint
 *
 * Keep enum lists in lockstep with `src/features/quiz/types.ts`.
 */
export const quizAnswersSchema = z.object({
  budget: z.enum(['lt150k', '150_250k', '250_400k', 'gte400k']),
  school: z.enum(['university', 'lycee', 'unsure']),
  housingType: z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'any']),
  vibe: z.enum(['calm', 'lively', 'mixed']),
  mobility: z.enum(['walk', 'taxibe', 'car']),
  priority: z.enum(['price', 'school', 'calm', 'social']),
})

export const quizSubmissionSchema = z.object({
  answers: quizAnswersSchema,
  // Optional email — the wizard does not block on this. Plain Zod
  // email check is sufficient; we don't verify deliverability here.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email()
    .max(254) // RFC 5321 max email length
    .optional()
    .or(z.literal('').transform(() => undefined)),
  // Locale comes from the proxy header on the server; client never
  // sends it. We accept it in the schema only for the test suite.
  locale: z.enum(['fr-MG', 'mg']),
})

export type QuizAnswersInput = z.infer<typeof quizAnswersSchema>
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>
