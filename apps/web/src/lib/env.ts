import 'server-only'
import { z } from 'zod'

// ============================================================
// AryTrano — Typed environment variables
// Validated at boot. Empty strings in .env are treated as missing.
// ============================================================

const isProd = process.env.NODE_ENV === 'production'
/**
 * Next.js sets `NEXT_PHASE='phase-production-build'` while compiling
 * the prod bundle. Many server modules are loaded during page-data
 * collection — they pull `env.ts` which would otherwise fail-fast on
 * vars that are only present at runtime (CI builds, dev machines that
 * test `npm run build` without real credentials, etc.). We treat the
 * build phase like dev for validation purposes ; the runtime boot
 * (`next start`) and the per-call use-site guards (e.g. `if
 * (!env.GOALPAY_ACCESS_KEY) throw …`) still catch any missing prod
 * value when the server actually starts serving traffic.
 */
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

/** In prod the value must be present; in dev/test/build it's optional. */
function requiredInProd(message: string) {
  if (isBuild) return z.string().min(1).optional()
  return isProd ? z.string().min(1, message) : z.string().min(1).optional()
}

/** A base64-encoded 32-byte key (for AES-256-GCM). */
const base64Key32 = z
  .string()
  .refine((v) => {
    if (!v) return true
    try {
      return Buffer.from(v, 'base64').length === 32
    } catch {
      return false
    }
  }, 'Must decode to exactly 32 bytes (run: openssl rand -base64 32)')

const EnvSchema = z.object({
  // --- Core --------------------------------------------------
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // --- Database (required everywhere) ------------------------
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid Postgres URL'),

  // --- Auth.js v5 (web sessions) + JWT (mobile) -------------
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 chars (generate: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))")'),
  AUTH_URL: z.string().url(),

  // --- OAuth providers (optional — enabled if both pair vars are set)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),

  // --- Cloudinary (image uploads) ---------------------------
  CLOUDINARY_CLOUD_NAME: requiredInProd('CLOUDINARY_CLOUD_NAME is required in production'),
  CLOUDINARY_API_KEY: requiredInProd('CLOUDINARY_API_KEY is required in production'),
  CLOUDINARY_API_SECRET: requiredInProd('CLOUDINARY_API_SECRET is required in production'),
  CLOUDINARY_UPLOAD_PRESET: z.string().optional(),

  // --- GoalPay (v2 — payments) ------------------------------
  // Merchant access key (starts with `TGP_`). Sent in the request
  // body's `access` field — NEVER exposed to the client. No sandbox
  // is documented; both dev and prod use the same merchant account.
  // Naming aligned with the credentials packet GoalPay support sends
  // to merchants (was previously GOALPAY_ACCESS_TOKEN).
  GOALPAY_ACCESS_KEY: requiredInProd('GOALPAY_ACCESS_KEY is required in production'),
  // HMAC-SHA256 shared secret (starts with `SK_`) used to verify the
  // `x-gpay-signature` header on inbound webhooks. Configured in the
  // GoalPay merchant dashboard. Without this, the webhook route
  // refuses all callbacks (fail-closed) — never log or expose this.
  GOALPAY_WEBHOOK_SECRET: requiredInProd('GOALPAY_WEBHOOK_SECRET is required in production'),
  // Full endpoint URL of the GoalPay initiate-payment API. The full
  // path is baked in (vs a bare host) because the credentials packet
  // ships the URL this way ; keeping it as a single env var avoids
  // string concatenation bugs at the call site. No sandbox documented
  // — both dev and prod use the production URL with minimal amounts.
  PAYMENT_GOALPAY_URL: z
    .string()
    .url()
    .default('https://api.goalpay.pro/api/payement/service'),

  // --- PII encryption (v0.5 — OwnerProfile.cin) -------------
  PII_ENCRYPTION_KEY: base64Key32.optional(),

  // --- Email via Gmail SMTP --------------------------------
  // EMAIL_FROM can be a plain email or "Display Name <email>" format
  GMAIL_USER: z.string().email().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().min(3).optional(),

  // --- Upstash Redis (rate limiting) -----------------------
  // When both are set, rate limiters become enforcing.
  // When missing, requests pass (fail-open) — a warning is logged at boot.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // --- Health check (T-055) --------------------------------
  // Path to the file `backup-db.sh` writes its last-success timestamp to.
  // Read by /api/health to report backup freshness. When the file is
  // missing (dev, first deploy), health reports `lastBackupAgeHours: null`
  // — not an error, just unknown.
  BACKUP_FRESHNESS_FILE: z
    .string()
    .default('/var/lib/arytrano/last-backup.txt'),

  // --- Sentry monitoring (T-056) ---------------------------
  // All Sentry vars are optional. When DSN is missing the SDK initializes
  // as a no-op — no network calls, no overhead. Set in prod via
  // /etc/arytrano/app.env to enable error tracking + tracing.
  //
  // NEXT_PUBLIC_SENTRY_DSN is exposed to the browser bundle (intentional —
  // Sentry DSNs are NOT secrets, they only identify the project). Server
  // and edge runtimes also use this same DSN.
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  // SENTRY_AUTH_TOKEN is server-only — used at build time to upload
  // source maps to Sentry for unminified stack traces. Never exposed to
  // the client.
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  // Environment tag for grouping errors in Sentry UI (production /
  // staging / preview). Defaults to NODE_ENV.
  SENTRY_ENVIRONMENT: z.string().optional(),
  // Sample rate for performance traces (0-1). Defaults to 0.1 (10%) in
  // prod to bound monthly quota; 1.0 in dev for visibility.
  SENTRY_TRACES_SAMPLE_RATE: z
    .string()
    .regex(/^(0(\.\d+)?|1(\.0+)?)$/, 'Must be a number between 0 and 1')
    .optional(),

  // --- Expo Push API (E-T22) ------------------------------
  // Optional access token for the Expo Push API. Without it the API
  // works (anonymous) but is rate-limited per-IP. Production should
  // set this to lift the rate limit. Generate via the Expo dashboard
  // → Account Settings → Access Tokens.
  EXPO_ACCESS_TOKEN: z.string().optional(),

  // --- Map tiles provider (AUD-008) ------------------------
  // Stadia Maps API key for production tile delivery. Public — exposed
  // to the browser via `NEXT_PUBLIC_*`. Stadia recommends restricting
  // the key to your domains in the Stadia dashboard so it can't be
  // copy-pasted into a third-party app.
  //
  // When unset, the map falls back to the public `tile.openstreetmap.org`
  // (fine for dev; rate-limited / blocked at commercial scale).
  NEXT_PUBLIC_STADIA_API_KEY: z.string().optional(),
  // Stadia style id. `alidade_smooth` is a clean grey/blue palette
  // close to the AryTrano brand. Other options: `alidade_smooth_dark`,
  // `outdoors`, `osm_bright`, `stamen_terrain`.
  NEXT_PUBLIC_STADIA_STYLE: z.string().default('alidade_smooth'),

  // --- AryTrano concierge hotline (T-018 concierge mode) ----
  // Single contact endpoint shown on EVERY listing instead of the
  // owner's direct phone — AryTrano team handles the relay manually
  // for security (no spam at the owner) and qualification.
  //
  // E.164 DIGITS ONLY, no leading `+`. MG country code 261 + 9 digits.
  // Example : 261341234567 (= +261 34 12 345 67).
  //
  // Both vars are NEXT_PUBLIC_* because the listing detail page
  // renders them client-side after the reveal click. Storing in env
  // (vs hardcoding) lets the team rotate or split per region later.
  NEXT_PUBLIC_ARYTRANO_WHATSAPP: z
    .string()
    .regex(/^261\d{9}$/, 'NEXT_PUBLIC_ARYTRANO_WHATSAPP must be E.164 digits-only (261 + 9 digits)')
    .default('261334537686'),
  NEXT_PUBLIC_ARYTRANO_PHONE: z
    .string()
    .regex(/^261\d{9}$/, 'NEXT_PUBLIC_ARYTRANO_PHONE must be E.164 digits-only (261 + 9 digits)')
    .default('261334537686'),

  // --- Cron secret (T-050 + T-049 + E-T20) -----------------
  // Shared secret expected as `Authorization: Bearer <secret>` on
  // /api/cron/* endpoints. Without it, prod crons would be publicly
  // triggerable. In dev (no scheduler), the routes still respond if
  // the secret is set locally — set a random value in .env to test.
  CRON_SECRET: requiredInProd('CRON_SECRET is required in production'),
})

export type Env = z.infer<typeof EnvSchema>

function parseEnv(): Env {
  // Treat empty strings (".env: KEY=") as missing — Zod otherwise validates
  // them as present-but-too-short.
  const cleaned: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(process.env)) {
    cleaned[k] = v === '' ? undefined : v
  }

  const result = EnvSchema.safeParse(cleaned)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors as Record<string, string[] | undefined>
    console.error('\n❌ Invalid environment configuration:\n')
    for (const [key, msgs] of Object.entries(fieldErrors)) {
      if (msgs && msgs.length > 0) {
        console.error(`  ${key}: ${msgs.join(', ')}`)
      }
    }
    console.error('\nSee .env.example for required values.\n')
    throw new Error('Environment validation failed')
  }
  return result.data
}

export const env = parseEnv()
