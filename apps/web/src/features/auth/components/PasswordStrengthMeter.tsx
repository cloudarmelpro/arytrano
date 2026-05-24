'use client'

import { useMemo } from 'react'

export type StrengthLevel = 0 | 1 | 2 | 3 | 4

function computeStrength(password: string): { level: StrengthLevel; label: string } {
  if (password.length === 0) return { level: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const level = Math.min(score, 4) as StrengthLevel
  const label =
    level <= 1 ? 'Faible' : level === 2 ? 'Moyen' : level === 3 ? 'Bon' : 'Fort'
  return { level, label }
}

const HINTS = '8 caractères · 1 chiffre · 1 majuscule'

export function PasswordStrengthMeter({ value }: { value: string }) {
  const { level, label } = useMemo(() => computeStrength(value), [value])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{HINTS}</span>
        {label && (
          <span
            className={
              level >= 3
                ? 'text-success font-medium'
                : level === 2
                  ? 'text-foreground/70 font-medium'
                  : 'text-destructive font-medium'
            }
          >
            {label}
          </span>
        )}
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => {
          const filled = i < level
          const color =
            level >= 3 ? 'bg-success' : level === 2 ? 'bg-foreground/60' : 'bg-destructive'
          return (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 flex-1 rounded-full ${
                filled ? color : 'bg-border'
              } transition-colors`}
            />
          )
        })}
      </div>
    </div>
  )
}
