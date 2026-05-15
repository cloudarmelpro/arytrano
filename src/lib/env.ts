import 'server-only'
import { z } from 'zod'

// ============================================================
// AryTrano — Typed environment variables
// Validated at boot. Empty strings in .env are treated as missing.
// ============================================================

const isProd = process.env.NODE_ENV === 'production'

/** In prod the value must be present; in dev/test it's optional. */
function requiredInProd(message: string) {
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
  GOALPAY_API_TOKEN_DEV: z.string().optional(),
  GOALPAY_WEBHOOK_SECRET: z.string().optional(),
  GOALPAY_BASE_URL: z.string().url().default('https://donation.goalpay.pro'),

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
