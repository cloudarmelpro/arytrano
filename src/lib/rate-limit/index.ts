import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env } from '@/lib/env'

/**
 * Rate limiters for AryTrano. Each limiter is keyed by an identifier you
 * provide at call site (typically `ipHash:email` or `ipHash` alone).
 *
 * When UPSTASH_REDIS_REST_URL / TOKEN are missing, every limiter returns
 * `{ success: true }` (fail-open) — a warning is logged once at startup
 * so dev environments don't break.
 */

let warned = false
function warnOnce() {
  if (warned) return
  warned = true
  if (env.NODE_ENV !== 'production') {
    console.warn(
      '[rate-limit] UPSTASH_REDIS_REST_URL / TOKEN missing — rate limiting is DISABLED (fail-open).',
    )
  }
}

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

type LimiterConfig = {
  /** Number of requests allowed per window */
  requests: number
  /** Sliding window duration, e.g. '1 m', '1 h' */
  window: Parameters<typeof Ratelimit.slidingWindow>[1]
}

function makeLimiter(prefix: string, cfg: LimiterConfig) {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.requests, cfg.window),
    prefix: `arytrano:${prefix}`,
    analytics: true,
  })
}

// Login & credentials authorize: 10 attempts per IP per 5 min
const loginLimiter = makeLimiter('login', { requests: 10, window: '5 m' })

// Password reset request: 3 per email per hour + 10 per IP per hour
const forgotPasswordByEmail = makeLimiter('forgot-email', { requests: 3, window: '1 h' })
const forgotPasswordByIp = makeLimiter('forgot-ip', { requests: 10, window: '1 h' })

// Registration: 5 accounts per IP per hour
const registerLimiter = makeLimiter('register', { requests: 5, window: '1 h' })

// Listings — owner creates a DRAFT: 10 / 1h / user
const createListingLimiter = makeLimiter('listing-create', { requests: 10, window: '1 h' })

// Photo upload — 30 / 1h / user (account-wide), 8 / 1min / listing (burst)
const photoUploadByUser = makeLimiter('listing-photo-user', { requests: 30, window: '1 h' })
const photoUploadByListing = makeLimiter('listing-photo-listing', { requests: 8, window: '1 m' })

// Reporting — 10 / 1h / IP (broad cap), 3 / 1h / IP+listingId (anti-pile-on)
const reportByIp = makeLimiter('report-ip', { requests: 10, window: '1 h' })
const reportByIpListing = makeLimiter('report-ip-listing', { requests: 3, window: '1 h' })

// Contact reveal — 30 / 1h / IP+listingId. Phones are revealed server-side
// after the click is recorded; without a cap a scraper could harvest every
// phone in the catalog by clicking through listings.
const contactByIpListing = makeLimiter('contact-ip-listing', { requests: 30, window: '1 h' })

// Magic-link sign-in email — closes the SMTP-relay abuse vector. Without
// this an attacker could spam any victim's inbox via our Gmail relay
// (reputation damage + Gmail's daily send cap as collateral DoS). 3/email/h
// and 10/IP/h match the forgot-password shape since both paths trigger
// an outbound email.
const signInEmailByEmail = makeLimiter('signin-email-email', { requests: 3, window: '1 h' })
const signInEmailByIp = makeLimiter('signin-email-ip', { requests: 10, window: '1 h' })

// Email verification resend — same shape as forgot-password (3/email/h
// + 10/IP/h). Keeps a separate bucket so a user who maxed out their
// password resets still has room to receive a verification email.
const resendVerificationByEmail = makeLimiter('verify-resend-email', { requests: 3, window: '1 h' })
const resendVerificationByIp = makeLimiter('verify-resend-ip', { requests: 10, window: '1 h' })

// RGPD data export (T-052) — heavy multi-table read, downloaded as a
// JSON blob. 1/h/user is generous : a legitimate audit doesn't need
// more, and an abuser can't scrape competitors' data because the
// export is keyed to the requester's own user id.
const exportUserDataLimiter = makeLimiter('export-user-data', { requests: 1, window: '1 h' })

// Transactional emails (T-034) — cap per-user per-event-type to prevent
// storms if a service retry loop or webhook double-fires. 10/h is enough
// for healthy activity (multiple publishes/reviews per hour shouldn't
// be silently dropped) and tight enough to bound damage.
const transactionalEmailLimiter = makeLimiter('email-transactional', {
  requests: 10,
  window: '1 h',
})

// Quiz submission — anonymous, low-value but writes to DB. 20/h/IP is
// generous for legitimate retries while bounding bot flooding of the
// QuizSubmission table.
const quizSubmitLimiter = makeLimiter('quiz-submit', {
  requests: 20,
  window: '1 h',
})

// WhatsApp alert subscription — anonymous, writes to DB, also surfaces
// the user's phone number (PII). Tighter than the quiz: 5/h/IP keeps
// a bot from harvesting a list of valid MG phone formats by spraying.
const whatsappAlertLimiter = makeLimiter('whatsapp-alert', {
  requests: 5,
  window: '1 h',
})

// Owner listing stats (E-T21 Tier-2) — bearer-keyed, 60/min/userId.
// Bounds a compromised or scraping-OWNER token from enumerating
// listing ids cheaply. 60/min is generous for legitimate dashboard
// auto-refresh + mobile-app polling.
const listingStatsLimiter = makeLimiter('listing-stats', {
  requests: 60,
  window: '1 m',
})

type RateLimitResult = { success: boolean; remaining?: number; reset?: number }

async function check(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    warnOnce()
    return { success: true }
  }
  const result = await limiter.limit(identifier)
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  }
}

export const rateLimiters = {
  /** Login attempt — 10 / 5min / IP */
  login: (ipHash: string) => check(loginLimiter, ipHash),

  /** Forgot password — 3 / 1h / email + 10 / 1h / IP. Returns success only if BOTH pass. */
  forgotPassword: async (email: string, ipHash: string): Promise<RateLimitResult> => {
    const byEmail = await check(forgotPasswordByEmail, email.toLowerCase())
    if (!byEmail.success) return byEmail
    return check(forgotPasswordByIp, ipHash)
  },

  /** Registration — 5 / 1h / IP */
  register: (ipHash: string) => check(registerLimiter, ipHash),

  /** Create listing (DRAFT) — 10 / 1h / userId */
  createListing: (userId: string) => check(createListingLimiter, userId),

  /** Report submission — 10 / 1h / IP overall + 3 / 1h / (IP, listing) anti-pile-on. */
  report: async (ipHash: string, listingId: string): Promise<RateLimitResult> => {
    const byIp = await check(reportByIp, ipHash)
    if (!byIp.success) return byIp
    return check(reportByIpListing, `${ipHash}:${listingId}`)
  },

  /** Photo upload — fails if either per-user (30/h) or per-listing (8/min) hits. */
  photoUpload: async (userId: string, listingId: string): Promise<RateLimitResult> => {
    const byUser = await check(photoUploadByUser, userId)
    if (!byUser.success) return byUser
    return check(photoUploadByListing, listingId)
  },

  /** Contact reveal — 30 / 1h / (IP, listing). Caps a single IP from harvesting every owner phone. */
  contactReveal: (ipHash: string, listingId: string) =>
    check(contactByIpListing, `${ipHash}:${listingId}`),

  /** Magic-link send — 3/email/h + 10/IP/h. Returns success only if BOTH pass. */
  signInEmail: async (email: string, ipHash: string): Promise<RateLimitResult> => {
    const byEmail = await check(signInEmailByEmail, email.toLowerCase())
    if (!byEmail.success) return byEmail
    return check(signInEmailByIp, ipHash)
  },

  /** Resend verification email — 3/email/h + 10/IP/h. Same shape as forgot-password. */
  resendVerification: async (email: string, ipHash: string): Promise<RateLimitResult> => {
    const byEmail = await check(resendVerificationByEmail, email.toLowerCase())
    if (!byEmail.success) return byEmail
    return check(resendVerificationByIp, ipHash)
  },

  /** RGPD data export — 1/h per userId. Fail-CLOSED on null userId. */
  exportUserData: (userId: string) => check(exportUserDataLimiter, userId),

  /** Transactional email — 10/h per (userId, eventType). Fail-soft caller. */
  transactionalEmail: (userId: string, eventType: string) =>
    check(transactionalEmailLimiter, `${userId}:${eventType}`),

  /** Quiz submission — 20/h per IP. Fails CLOSED if IP cannot be derived. */
  quizSubmit: (ipHash: string | null) =>
    check(quizSubmitLimiter, ipHash ?? 'noip:quiz-submit'),

  /** WhatsApp alert subscription — 5/h per IP. Fails CLOSED if no IP. */
  whatsappAlert: (ipHash: string | null) =>
    check(whatsappAlertLimiter, ipHash ?? 'noip:whatsapp-alert'),

  /** Owner listing stats — 60/min per userId. */
  listingStats: (userId: string) => check(listingStatsLimiter, userId),
}
