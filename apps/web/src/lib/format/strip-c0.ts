/**
 * Strip C0 control characters (U+0000 to U+001F) — PostgreSQL JSONB
 * rejects U+0000 and may misbehave on other C0 controls when the value
 * flows into a `Json` column. Whitespace-substitute keeps the visible
 * content intact for human reviewers without truncating useful context.
 *
 * Used at every boundary that writes attacker-influenced strings into
 * `Json` columns (refuse-reason, webhook rawPayload, audit blobs).
 *
 * Note on construction — the regex is built with `new RegExp(string)`
 * (not a literal) on purpose: Edit/Write tools occasionally normalise
 * invisible control chars inside a regex literal, breaking the match.
 */
const C0_CONTROL_CHARS = new RegExp('[\\u0000-\\u001F]', 'g')

export function stripC0ControlChars(s: string): string {
  return s.replace(C0_CONTROL_CHARS, ' ')
}

/**
 * Recursively scrub control chars from every string value in a JSON-like
 * structure. Returns a new object — does not mutate the input. Used by
 * the GoalPay webhook to harden `PaymentEvent.rawPayload` against
 * provider-side quirks (and future providers with looser hygiene).
 */
export function stripC0FromJson<T>(value: T): T {
  if (typeof value === 'string') {
    return stripC0ControlChars(value) as T
  }
  if (Array.isArray(value)) {
    return value.map((v) => stripC0FromJson(v)) as T
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = stripC0FromJson(v)
    }
    return out as T
  }
  return value
}
