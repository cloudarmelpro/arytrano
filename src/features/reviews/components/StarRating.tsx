'use client'

/**
 * Star rating widget — display + interactive modes.
 *
 * Display: pass `value` only; renders 5 stars filled up to `value`.
 * Interactive: pass `onChange` to make it clickable + keyboard-navigable.
 *
 * Visuals match the brand: indigo fill, muted outline.
 */
export function StarRating({
  value,
  onChange,
  size = 18,
  ariaLabel,
}: {
  value: number
  onChange?: (next: number) => void
  size?: number
  ariaLabel?: string
}) {
  const interactive = typeof onChange === 'function'
  const stars = [1, 2, 3, 4, 5]
  if (!interactive) {
    return (
      <span
        role="img"
        aria-label={ariaLabel ?? `${value} / 5`}
        className="inline-flex items-center gap-0.5"
      >
        {stars.map((n) => (
          <Star key={n} filled={n <= value} size={size} />
        ))}
      </span>
    )
  }
  return (
    <span
      role="radiogroup"
      aria-label={ariaLabel ?? 'Note'}
      className="inline-flex items-center gap-0.5"
    >
      {stars.map((n) => {
        const filled = n <= value
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} / 5`}
            onClick={() => onChange?.(n)}
            className="inline-flex items-center justify-center rounded transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star filled={filled} size={size} />
          </button>
        )
      })}
    </span>
  )
}

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={filled ? 'text-primary' : 'text-muted-foreground'}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
