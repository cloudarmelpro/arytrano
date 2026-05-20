/**
 * Public surface of the `quiz` feature.
 *
 * Client-safe: exports the wizard component + types. The Server
 * Actions and the scoring service live behind their own imports
 * (`features/quiz/actions/...`, `features/quiz/services/...`) for
 * Route Handler / Server Component callers.
 */
export { QuizWizard } from './components/QuizWizard'
export type {
  QuizAnswers,
  ScoredQuartier,
  QuartierProfile,
  BudgetTier,
  SchoolFocus,
  HousingType,
  Vibe,
  Mobility,
  Priority,
} from './types'
