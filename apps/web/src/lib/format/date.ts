/**
 * EDT-15 — canonical French date formatters. Prefer these over
 * bare `new Intl.DateTimeFormat('fr-FR', …)` at call sites so we
 * keep a single source of truth (e.g. "juin" vs "Jun", weekday
 * capitalization, no leading zero on the day).
 *
 * All formatters memoize the Intl instance module-scope so the
 * expensive constructor runs once per bundle.
 */

const shortDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const longDate = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const monthYear = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
  year: 'numeric',
})

const dateTime = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const timeOnly = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit',
})

const weekday = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function fmtShortDate(d: Date): string {
  return shortDate.format(d)
}

export function fmtLongDate(d: Date): string {
  return longDate.format(d)
}

export function fmtMonthYear(d: Date): string {
  return monthYear.format(d)
}

export function fmtDateTime(d: Date): string {
  return dateTime.format(d)
}

export function fmtTimeOnly(d: Date): string {
  return timeOnly.format(d)
}

export function fmtWeekday(d: Date): string {
  return weekday.format(d)
}

/**
 * Relative time — "il y a 2h", "dans 3 jours". Uses Intl.RelativeTimeFormat
 * which handles pluralisation + accents natively.
 */
const relative = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })

export function fmtRelative(target: Date, now: Date = new Date()): string {
  const diffMs = target.getTime() - now.getTime()
  const seconds = Math.round(diffMs / 1000)
  const absS = Math.abs(seconds)
  if (absS < 60) return relative.format(seconds, 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 30) return relative.format(days, 'day')
  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) return relative.format(months, 'month')
  return relative.format(Math.round(months / 12), 'year')
}
