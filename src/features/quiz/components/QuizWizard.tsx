'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'motion/react'
import { Radio } from '@base-ui/react/radio'
import { RadioGroup } from '@base-ui/react/radio-group'
import { Button } from '@/components/ui/button'
import { FieldSet, FieldLegend, FieldDescription } from '@/components/ui/field'
import type { Locale } from '@/lib/i18n/config'
import { getT } from '@/lib/i18n/translate'
import type { MessageKey } from '@/lib/i18n/messages'
import type { QuartierRow } from '@/features/landing/server'
import { scoreQuartiers } from '../services/score-quartiers'
import { QUARTIER_PROFILES } from '../data/quartier-profiles'
import type { QuizAnswers, ScoredQuartier } from '../types'
import { QuizResults } from './QuizResults'
import { submitQuizAction } from '../actions/submit-quiz'

type StepKey = keyof QuizAnswers

type StepDef = {
  key: StepKey
  title: MessageKey
  help: MessageKey
  options: Array<{ value: string; label: MessageKey }>
}

const STEPS: StepDef[] = [
  {
    key: 'budget',
    title: 'quiz.q.budget.title',
    help: 'quiz.q.budget.help',
    options: [
      { value: 'lt150k', label: 'quiz.q.budget.opt.lt150k' },
      { value: '150_250k', label: 'quiz.q.budget.opt.150_250k' },
      { value: '250_400k', label: 'quiz.q.budget.opt.250_400k' },
      { value: 'gte400k', label: 'quiz.q.budget.opt.gte400k' },
    ],
  },
  {
    key: 'school',
    title: 'quiz.q.school.title',
    help: 'quiz.q.school.help',
    options: [
      { value: 'university', label: 'quiz.q.school.opt.university' },
      { value: 'lycee', label: 'quiz.q.school.opt.lycee' },
      { value: 'unsure', label: 'quiz.q.school.opt.unsure' },
    ],
  },
  {
    key: 'housingType',
    title: 'quiz.q.housingType.title',
    help: 'quiz.q.housingType.help',
    options: [
      { value: 'ROOM', label: 'quiz.q.housingType.opt.ROOM' },
      { value: 'STUDIO', label: 'quiz.q.housingType.opt.STUDIO' },
      { value: 'APARTMENT', label: 'quiz.q.housingType.opt.APARTMENT' },
      { value: 'any', label: 'quiz.q.housingType.opt.any' },
    ],
  },
  {
    key: 'vibe',
    title: 'quiz.q.vibe.title',
    help: 'quiz.q.vibe.help',
    options: [
      { value: 'calm', label: 'quiz.q.vibe.opt.calm' },
      { value: 'lively', label: 'quiz.q.vibe.opt.lively' },
      { value: 'mixed', label: 'quiz.q.vibe.opt.mixed' },
    ],
  },
  {
    key: 'mobility',
    title: 'quiz.q.mobility.title',
    help: 'quiz.q.mobility.help',
    options: [
      { value: 'walk', label: 'quiz.q.mobility.opt.walk' },
      { value: 'taxibe', label: 'quiz.q.mobility.opt.taxibe' },
      { value: 'car', label: 'quiz.q.mobility.opt.car' },
    ],
  },
  {
    key: 'priority',
    title: 'quiz.q.priority.title',
    help: 'quiz.q.priority.help',
    options: [
      { value: 'price', label: 'quiz.q.priority.opt.price' },
      { value: 'school', label: 'quiz.q.priority.opt.school' },
      { value: 'calm', label: 'quiz.q.priority.opt.calm' },
      { value: 'social', label: 'quiz.q.priority.opt.social' },
    ],
  },
]

export function QuizWizard({
  locale,
  quartiers,
}: {
  locale: Locale
  quartiers: QuartierRow[]
}) {
  const t = getT(locale)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({})
  const [phase, setPhase] = useState<'quiz' | 'results'>('quiz')
  const [results, setResults] = useState<ScoredQuartier[]>([])
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (phase === 'results') {
    return (
      <QuizResults
        locale={locale}
        quartiers={quartiers}
        scored={results}
        submissionId={submissionId}
        onRestart={() => {
          setStep(0)
          setDirection(1)
          setAnswers({})
          setResults([])
          setSubmissionId(null)
          setPhase('quiz')
        }}
      />
    )
  }

  const current = STEPS[step]!
  const currentValue = answers[current.key] ?? ''
  const canContinue = currentValue !== ''
  const isLast = step === STEPS.length - 1

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [current.key]: value }))
  }

  function handleNext() {
    if (!canContinue) return
    if (!isLast) {
      setDirection(1)
      setStep((s) => s + 1)
      return
    }
    // Final step → score + submit + show results.
    // 4 quartiers: 1 top match in the hero card + 3 in "À considérer aussi".
    const finalAnswers = answers as QuizAnswers
    const scored = scoreQuartiers(finalAnswers, QUARTIER_PROFILES, 4)
    setResults(scored)
    setPhase('results')
    // Fire-and-forget submission (no email yet — that comes from the
    // capture form on the results page). Wrap in transition so the
    // UI does not block on the action.
    startTransition(async () => {
      try {
        const res = await submitQuizAction({
          answers: finalAnswers,
          recommendedSlugs: scored.map((s) => s.slug),
        })
        if (res.ok) setSubmissionId(res.submissionId)
      } catch {
        // Network errors are silent here — submission is best-effort
        // analytics, the user already sees their results. The email
        // capture flow degrades to "we can't save your email" rather
        // than breaking the page.
      }
    })
  }

  function handleBack() {
    if (step === 0) return
    setDirection(-1)
    setStep((s) => s - 1)
  }

  return (
    // Respect prefers-reduced-motion at the JS layer too — the global
    // CSS `@media (prefers-reduced-motion: reduce)` only short-circuits
    // CSS transitions, not Motion's RAF-driven animations. With
    // reducedMotion="user", Motion strips translate/scale/rotate
    // entirely when the user opts out; opacity fades stay because
    // they're not a vestibular-motion trigger.
    <MotionConfig reducedMotion="user">
    <div className="mx-auto w-full max-w-[640px]">
      <header className="mb-10 text-center">
        <h1 className="font-serif text-[clamp(30px,3.6vw,46px)] font-normal leading-[1.05] tracking-[-0.02em] text-foreground">
          {t('quiz.h1')}
        </h1>
        <p className="mx-auto mt-3 max-w-[520px] text-[15.5px] leading-[1.55] text-foreground/70">
          {t('quiz.lead')}
        </p>
      </header>

      <ProgressBar step={step + 1} total={STEPS.length} label={t} />

      <div className="relative mt-8 min-h-[400px] overflow-hidden">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction * -40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <FieldSet>
              <FieldLegend className="font-serif text-[clamp(24px,3vw,32px)] font-normal leading-[1.15] tracking-[-0.018em] text-foreground">
                {t(current.title)}
              </FieldLegend>
              <FieldDescription className="-mt-1 mb-2 text-[14px] text-foreground/70">
                {t(current.help)}
              </FieldDescription>
              <RadioGroup
                value={currentValue}
                onValueChange={(v) => handleSelect(String(v))}
                className="flex flex-col gap-2.5"
              >
                {current.options.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={t(opt.label)}
                    selected={currentValue === opt.value}
                  />
                ))}
              </RadioGroup>
            </FieldSet>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="h-11 rounded-xl px-5"
        >
          ← {t('quiz.back')}
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="h-11 min-w-[160px] rounded-xl px-5"
        >
          {isLast ? t('quiz.submit') : `${t('quiz.next')} →`}
        </Button>
      </div>
    </div>
    </MotionConfig>
  )
}

function ProgressBar({
  step,
  total,
  label,
}: {
  step: number
  total: number
  label: ReturnType<typeof getT>
}) {
  const pct = (step / total) * 100
  const labelText = label('quiz.progress', { step, total })
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span
          id="quiz-progress-label"
          className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          {labelText}
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby="quiz-progress-label"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuetext={labelText}
        className="relative h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <motion.div
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
        />
      </div>
    </div>
  )
}

function OptionCard({
  value,
  label,
  selected,
}: {
  value: string
  label: string
  selected: boolean
}) {
  return (
    <Radio.Root
      value={value}
      className={`group flex w-full cursor-pointer items-center gap-3.5 rounded-xl border bg-background px-4 py-3.5 text-left transition outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selected
        ? 'border-primary bg-primary/5'
        : 'border-border hover:border-foreground/30 hover:bg-muted/40'
        }`}
    >
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition ${selected ? 'border-primary' : 'border-border'
          }`}
      >
        <span
          className={`h-2 w-2 rounded-full transition ${selected ? 'bg-primary' : 'bg-transparent'
            }`}
        />
      </span>
      <span className="text-[15px] font-medium text-foreground">{label}</span>
    </Radio.Root>
  )
}
