/**
 * TRU-04 — server-side scam-keyword detector for listing content.
 *
 * Runs at create + update time on `title + description`. Any match
 * auto-opens a Report with reason=SCAM + reporterUserId=null so the
 * admin moderation queue sees it next time they refresh
 * `/admin/reports`. The owner is NOT blocked (low false-positive
 * tolerance, the admin decides) — just flagged.
 *
 * Categories tuned for the Madagascar housing market (caution-fraud
 * patterns surfaced in our security audit + reported incidents from
 * Facebook Marketplace MG).
 *
 * Pure module — no DB, no env. Safe to import from anywhere.
 */

export type ScamSignal = {
  code: ScamCode
  matched: string
  weight: number
}

export type ScamCode =
  | 'MONEY_TRANSFER_SERVICE'
  | 'CRYPTO'
  | 'CAUTION_BEFORE_VISIT'
  | 'OVERSEAS_OWNER'
  | 'URL_SHORTENER'
  | 'FOREIGN_PHONE'
  | 'URGENCY_PRESSURE'
  | 'GIFT_CARD'

type Rule = {
  code: ScamCode
  pattern: RegExp
  weight: number
}

const RULES: Rule[] = [
  // --- Money-transfer services typical of advance-fee scams ----------
  {
    code: 'MONEY_TRANSFER_SERVICE',
    pattern:
      /\b(western\s*union|wu\b|moneygram|ria\s*money|wise\s*transfer|virement\s+international|wire\s*transfer)\b/i,
    weight: 0.7,
  },
  {
    code: 'CRYPTO',
    pattern: /\b(bitcoin|btc\b|usdt|tether|crypto|wallet\s*address)\b/i,
    weight: 0.8,
  },

  // --- "Send the deposit / caution BEFORE the visit" - canonical scam ----
  {
    code: 'CAUTION_BEFORE_VISIT',
    pattern:
      /\b(envoy(?:er|ez)|verser|payer)\s+(?:la\s+)?(?:caution|avance|d[ée]p[ôo]t|acompte)\s+(?:avant|prealable|avant\s+(?:la|le|une)\s+visite|pour\s+r[ée]server)\b/i,
    weight: 0.95,
  },
  {
    code: 'CAUTION_BEFORE_VISIT',
    pattern:
      /\b(send|wire|transfer)\s+(?:the\s+)?(?:deposit|caution)\s+(?:before|to\s+reserve)\b/i,
    weight: 0.95,
  },

  // --- Overseas / "I'm abroad" — classic absentee-owner narrative ------
  {
    code: 'OVERSEAS_OWNER',
    // Tolerate both straight (') and curly (’) apostrophes, plus the
    // "letranger" form. Curly is dominant when text is pasted from
    // social media on mobile keyboards (the platform we're protecting
    // against most), so leaving it out broke detection in practice.
    pattern:
      /\b(actuellement\s+(?:[àa]|en)\s+(?:l['’]?[ée]?tranger|france|paris|usa|canada))\b/i,
    weight: 0.5,
  },
  {
    code: 'OVERSEAS_OWNER',
    pattern: /\b(i\s*am|currently)\s+(?:abroad|overseas|out\s+of\s+(?:country|madagascar))\b/i,
    weight: 0.5,
  },

  // --- URL shorteners hide the real destination ----------------------
  {
    code: 'URL_SHORTENER',
    pattern: /\b(bit\.ly|tinyurl\.com|goo\.gl|t\.co|cutt\.ly|rb\.gy|is\.gd|ow\.ly|rebrand\.ly|shorte\.st)\//i,
    weight: 0.4,
  },

  // --- Phone numbers that aren't +261 Madagascar ---------------------
  // We flag non-MG country codes that show up in MG listings. Studying
  // abroad is legit, owning a MG apartment from there too — but it's a
  // strong correlation with scam patterns when combined with other signals.
  {
    code: 'FOREIGN_PHONE',
    pattern:
      /(?<!\d)\+(?:1(?:[ \-.]?\d){10}|33(?:[ \-.]?\d){9}|44(?:[ \-.]?\d){10}|49(?:[ \-.]?\d){10,11}|234(?:[ \-.]?\d){10})(?!\d)/,
    weight: 0.4,
  },

  // --- Urgency-pressure language -------------------------------------
  {
    code: 'URGENCY_PRESSURE',
    pattern:
      /\b(urgent|d[ée]p[êe]chez[ -]vous|aujourd['’]hui\s+seulement|24h\s+seulement|premier\s+arriv[ée]|act\s+now|today\s+only|appelez[ -]nous\s+vite|vite\s*!)\b/i,
    weight: 0.3,
  },

  // --- Gift cards as deposit (Amazon, iTunes, Steam) -----------------
  {
    code: 'GIFT_CARD',
    pattern: /\b(gift\s*card|amazon\s+card|itunes|steam\s+card|carte\s+cadeau|carte\s+pr[ée]pay[ée]e)\b/i,
    weight: 0.85,
  },
]

export type ScamReport = {
  signals: ScamSignal[]
  /** Sum of weights, capped at 1. >= 0.5 ⇒ auto-flag to admin queue. */
  confidence: number
  /** Convenience boolean for the caller. */
  shouldFlag: boolean
}

const FLAG_THRESHOLD = 0.5

export function detectScamSignals(input: {
  title?: string | null
  description?: string | null
}): ScamReport {
  const haystack = `${input.title ?? ''}\n${input.description ?? ''}`
  const signals: ScamSignal[] = []
  const seenCodes = new Set<ScamCode>()

  for (const rule of RULES) {
    const m = haystack.match(rule.pattern)
    if (!m) continue
    signals.push({ code: rule.code, matched: m[0], weight: rule.weight })
    seenCodes.add(rule.code)
  }

  // De-duplicate the weight contribution per CODE (multiple matches of
  // the same category shouldn't pile up — quality > quantity).
  let confidence = 0
  for (const code of seenCodes) {
    const top = signals.filter((s) => s.code === code).reduce((max, s) =>
      s.weight > max ? s.weight : max,
      0,
    )
    confidence += top
  }
  confidence = Math.min(1, confidence)

  return {
    signals,
    confidence,
    shouldFlag: confidence >= FLAG_THRESHOLD,
  }
}

/**
 * Human-readable summary for the admin moderation queue.
 * Reads like : "CAUTION_BEFORE_VISIT(0.95): «envoyer la caution avant la visite»".
 */
export function summarizeSignals(signals: ScamSignal[]): string {
  return signals
    .map((s) => `${s.code}(${s.weight.toFixed(2)}) : «${s.matched.trim()}»`)
    .join(' · ')
}
