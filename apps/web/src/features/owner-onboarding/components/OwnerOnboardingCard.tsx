import Link from 'next/link'
import type { OnboardingProgress } from '../queries/get-onboarding-progress'

/**
 * OWN-18 — first-time-owner checklist. Rendered on /dashboard when
 * the owner has at least one step outstanding; disappears once every
 * step is done so returning owners don't see it.
 *
 * Pure server component (no interactivity beyond the Link) — cheaper
 * bundle than a Driver.js positional tour and works even with JS
 * disabled.
 */
export function OwnerOnboardingCard({
  progress,
}: {
  progress: OnboardingProgress
}) {
  if (progress.allDone) return null
  const pct = Math.round((progress.doneCount / progress.totalCount) * 100)

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-foreground">
            Bienvenue sur AryTrano
          </h2>
          <p className="text-xs text-foreground/65">
            {progress.doneCount} / {progress.totalCount} étapes terminées — publie
            ta première annonce en moins de 10 min.
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-primary">
          {pct}%
        </span>
      </header>

      <div
        role="progressbar"
        aria-valuenow={progress.doneCount}
        aria-valuemin={0}
        aria-valuemax={progress.totalCount}
        className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="flex flex-col gap-1">
        {progress.steps.map((step, i) => (
          <li key={step.key}>
            <Link
              href={step.href}
              className={`group flex items-start gap-3 rounded-md p-2 transition ${
                step.done ? 'hover:bg-background' : 'hover:bg-primary/5'
              }`}
            >
              <span
                aria-hidden
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  step.done
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground/60'
                }`}
              >
                {step.done ? '✓' : i + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <span
                  className={`text-sm font-medium ${
                    step.done ? 'text-foreground/50 line-through' : 'text-foreground'
                  }`}
                >
                  {step.label}
                </span>
                {!step.done && (
                  <span className="text-[12px] text-foreground/60">{step.hint}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
