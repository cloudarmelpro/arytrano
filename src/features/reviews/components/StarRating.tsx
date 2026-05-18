'use client'

import { useRef } from 'react'

/**
 * Star rating widget — display + interactive modes.
 *
 * Display: pass `value` only; renders 5 stars filled up to `value`.
 * Interactive: pass `onChange` to make it clickable + keyboard-navigable.
 *
 * Keyboard (interactive):
 *  - Tab focuses the active star (or first if none chosen yet) — single
 *    tab stop per WAI-ARIA radiogroup pattern.
 *  - ArrowLeft / ArrowDown: decrement (wraps 1 → 5).
 *  - ArrowRight / ArrowUp: increment (wraps 5 → 1).
 *  - Home / End: jump to 1 / 5.
 *  - Space / Enter: commit the focused value (already committed on focus
 *    via onChange so this is a no-op convenience).
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
  const containerRef = useRef<HTMLSpanElement>(null)
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

  function focusStar(n: number) {
    const btn = containerRef.current?.querySelector<HTMLButtonElement>(
      `[data-star="${n}"]`,
    )
    btn?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    let next: number | null = null
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = value >= 5 ? 1 : value + 1
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        next = value <= 1 ? 5 : value - 1
        break
      case 'Home':
        next = 1
        break
      case 'End':
        next = 5
        break
    }
    if (next !== null) {
      e.preventDefault()
      onChange?.(next)
      focusStar(next)
    }
  }

  // Single-tab-stop: the active star (or 1 if none yet) holds tabIndex=0,
  // every other star is tabIndex=-1 — the WAI-ARIA radiogroup convention.
  const focusIndex = value || 1
  return (
    <span
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel ?? 'Note'}
      onKeyDown={onKeyDown}
      className="inline-flex items-center gap-0.5"
    >
      {stars.map((n) => {
        const filled = n <= value
        const checked = value === n
        return (
          <button
            key={n}
            data-star={n}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={`${n} / 5`}
            tabIndex={n === focusIndex ? 0 : -1}
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
