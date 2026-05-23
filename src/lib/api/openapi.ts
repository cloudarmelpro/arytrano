import 'server-only'
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

/**
 * OpenAPI 3.1 spec generator for `/api/v1/`.
 *
 * SCOPE : documents the endpoints the mobile MVP consumes (E-T22) +
 * the few public web endpoints third parties might integrate against.
 * Owner-portal flows (photo upload, availability calendar, reviews
 * moderation, OAuth connections) are intentionally undocumented for
 * now — they are dashboard-only and not part of any external contract.
 *
 * HOW TO ADD AN ENDPOINT :
 *  1. Define the response schema below (or inline with .openapi() metadata)
 *  2. Call `registry.registerPath({ method, path, request?, responses })`
 *  3. The spec at `GET /api/v1/openapi.json` updates automatically
 *
 * The spec is deliberately decoupled from internal Zod schemas — we
 * publish a STABLE API contract, while internal schemas evolve freely.
 */

const registry = new OpenAPIRegistry()

// ────────────────────────────────────────────────────────────────────
// Shared response shapes — every endpoint wraps its payload in either
// `{ data: T }` (success) or `{ error: { code, message, fields? } }`.
// ────────────────────────────────────────────────────────────────────

const ApiErrorSchema = z
  .object({
    error: z.object({
      code: z.enum([
        'validation_failed',
        'unauthorized',
        'totp_required',
        'forbidden',
        'not_found',
        'conflict',
        'rate_limited',
        'internal_error',
      ]),
      message: z.string(),
      fields: z.record(z.string(), z.array(z.string())).optional(),
    }),
  })
  .openapi('ApiError')

registry.register('ApiError', ApiErrorSchema)

const errorResponses = {
  400: { description: 'Validation failed', content: { 'application/json': { schema: ApiErrorSchema } } },
  401: { description: 'Authentication required', content: { 'application/json': { schema: ApiErrorSchema } } },
  403: { description: 'Forbidden', content: { 'application/json': { schema: ApiErrorSchema } } },
  404: { description: 'Not found', content: { 'application/json': { schema: ApiErrorSchema } } },
  409: { description: 'Conflict', content: { 'application/json': { schema: ApiErrorSchema } } },
  429: { description: 'Rate limited', content: { 'application/json': { schema: ApiErrorSchema } } },
  500: { description: 'Internal error', content: { 'application/json': { schema: ApiErrorSchema } } },
}

// ────────────────────────────────────────────────────────────────────
// Bearer auth scheme
// ────────────────────────────────────────────────────────────────────

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
})

// ────────────────────────────────────────────────────────────────────
// Catalog (cities, neighborhoods) — public, no auth
// ────────────────────────────────────────────────────────────────────

const CitySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    nameFr: z.string(),
    nameMg: z.string(),
    lat: z.number(),
    lng: z.number(),
  })
  .openapi('City')

const NeighborhoodSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    nameFr: z.string(),
    nameMg: z.string(),
    lat: z.number(),
    lng: z.number(),
  })
  .openapi('Neighborhood')

registry.registerPath({
  method: 'get',
  path: '/api/v1/cities',
  summary: 'List all cities',
  tags: ['Catalog'],
  responses: {
    200: {
      description: 'Cities catalog',
      content: { 'application/json': { schema: z.object({ data: z.array(CitySchema) }) } },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/cities/{slug}/neighborhoods',
  summary: 'List neighborhoods of one city',
  tags: ['Catalog'],
  request: {
    params: z.object({ slug: z.string().openapi({ example: 'fianarantsoa' }) }),
  },
  responses: {
    200: {
      description: 'Neighborhoods for the city',
      content: { 'application/json': { schema: z.object({ data: z.array(NeighborhoodSchema) }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Listings — public list + detail, owner-only mutations
// ────────────────────────────────────────────────────────────────────

const ListingTypeSchema = z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'HOUSE']).openapi('ListingType')

const PublicListingCardSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    type: ListingTypeSchema,
    priceMonthlyMGA: z.number().int(),
    publishedAt: z.string().datetime().nullable(),
    verifiedAt: z.string().datetime().nullable(),
    city: z.object({ slug: z.string(), nameFr: z.string() }),
    neighborhood: z.object({ slug: z.string(), nameFr: z.string() }),
    photo: z
      .object({
        url: z.string().url(),
        width: z.number().int(),
        height: z.number().int(),
        blurhash: z.string().nullable(),
        altFr: z.string().nullable(),
      })
      .nullable(),
  })
  .openapi('PublicListingCard')

registry.registerPath({
  method: 'get',
  path: '/api/v1/listings',
  summary: 'List published listings (paginated, filtered)',
  description:
    'Public, no auth. Supports cursor-based pagination via `?cursor=<id>`. Filters: `type`, `city`, `neighborhood`, `priceMin`, `priceMax`, `sort`, `amenities` (CSV), `q` (full-text on title + description).',
  tags: ['Listings'],
  request: {
    query: z.object({
      cursor: z.string().optional(),
      type: ListingTypeSchema.optional(),
      city: z.string().optional(),
      neighborhood: z.string().optional(),
      priceMin: z.string().optional(),
      priceMax: z.string().optional(),
      sort: z.enum(['newest', 'price-asc', 'price-desc']).optional(),
      amenities: z.string().optional().describe('CSV list of Amenity enum values'),
      q: z.string().min(2).max(120).optional(),
    }),
  },
  responses: {
    200: {
      description: 'Page of listings',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(PublicListingCardSchema),
            meta: z.object({
              nextCursor: z.string().nullable(),
              hasMore: z.boolean(),
            }),
          }),
        },
      },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/v1/listings/{id}',
  summary: 'Get one published listing (detail)',
  tags: ['Listings'],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Listing detail (photos, full description, owner display name)',
      content: { 'application/json': { schema: z.object({ data: z.unknown() }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Contact reveal — auth optional
// ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/api/v1/contact/{listingId}',
  summary: 'Reveal owner phone + log a contact event',
  description:
    'Rate-limited 30/h per (IP, listing). On success the client opens `whatsapp://send?phone=...` or `tel:<phoneE164>`. Anonymous reveal is supported.',
  tags: ['Contact'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ listingId: z.string() }),
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ channel: z.enum(['WHATSAPP', 'PHONE']) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Phone revealed',
      content: {
        'application/json': {
          schema: z.object({
            data: z.object({
              channel: z.enum(['WHATSAPP', 'PHONE']),
              phoneE164: z.string().openapi({ example: '261341234567' }),
              ownerDisplayName: z.string(),
            }),
          }),
        },
      },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Auth — register, login, refresh, forgot/reset password
// ────────────────────────────────────────────────────────────────────

const AuthTokenSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number().int().describe('Access token TTL in seconds'),
  })
  .openapi('AuthTokens')

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  summary: 'Create a new account',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string().min(8),
            name: z.string().min(2),
            locale: z.enum(['fr-MG', 'mg']).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Account created, tokens issued',
      content: { 'application/json': { schema: z.object({ data: AuthTokenSchema }) } },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'Exchange credentials for JWT pair',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            email: z.string().email(),
            password: z.string(),
            totpCode: z.string().optional().describe('6-digit TOTP if 2FA enabled'),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Tokens issued', content: { 'application/json': { schema: z.object({ data: AuthTokenSchema }) } } },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/refresh',
  summary: 'Exchange refresh token for a fresh access token',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: z.object({ refreshToken: z.string() }) } },
    },
  },
  responses: {
    200: { description: 'Fresh tokens', content: { 'application/json': { schema: z.object({ data: AuthTokenSchema }) } } },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/forgot-password',
  summary: 'Request a password-reset email',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: z.object({ email: z.string().email() }) } },
    },
  },
  responses: {
    200: {
      description: 'Email sent if the address matches an account',
      content: { 'application/json': { schema: z.object({ data: z.object({ ok: z.literal(true) }) }) } },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/reset-password',
  summary: 'Reset password using the token from the email',
  tags: ['Auth'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ token: z.string(), newPassword: z.string().min(8) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset',
      content: { 'application/json': { schema: z.object({ data: z.object({ ok: z.literal(true) }) }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Me (current user) — get, patch, delete
// ────────────────────────────────────────────────────────────────────

const MeSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().nullable(),
    role: z.enum(['STUDENT', 'OWNER', 'ADMIN']),
    locale: z.enum(['fr-MG', 'mg']),
    avatarUrl: z.string().url().nullable(),
    phone: z.string().nullable(),
    emailVerified: z.string().datetime().nullable(),
  })
  .openapi('Me')

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/me',
  summary: 'Profile of the bearer user',
  tags: ['Profile'],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: { description: 'Current user', content: { 'application/json': { schema: z.object({ data: MeSchema }) } } },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/me',
  summary: 'Update profile fields',
  tags: ['Profile'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            name: z.string().min(2).optional(),
            phone: z.string().optional(),
            locale: z.enum(['fr-MG', 'mg']).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: 'Updated', content: { 'application/json': { schema: z.object({ data: MeSchema }) } } },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/users/me',
  summary: 'Soft-delete the bearer user',
  tags: ['Profile'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ confirm: z.literal('SUPPRIMER') }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Account soft-deleted',
      content: { 'application/json': { schema: z.object({ data: z.object({ deleted: z.literal(true) }) }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Favorites
// ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/v1/favorites',
  summary: "List the bearer user's favorited listings",
  tags: ['Favorites'],
  security: [{ [bearerAuth.name]: [] }],
  request: { query: z.object({ cursor: z.string().optional() }) },
  responses: {
    200: {
      description: 'Favorites page',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(PublicListingCardSchema),
            meta: z.object({ nextCursor: z.string().nullable(), hasMore: z.boolean() }),
          }),
        },
      },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/favorites',
  summary: 'Toggle a listing in/out of favorites',
  tags: ['Favorites'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: z.object({ listingId: z.string() }) } },
    },
  },
  responses: {
    200: {
      description: 'Favorite toggled',
      content: { 'application/json': { schema: z.object({ data: z.object({ favorited: z.boolean() }) }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Saved searches
// ────────────────────────────────────────────────────────────────────

const SavedSearchSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    filters: z.record(z.string(), z.unknown()),
    alertsOn: z.boolean(),
    createdAt: z.string().datetime(),
  })
  .openapi('SavedSearch')

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/me/saved-searches',
  summary: "List the bearer user's saved searches",
  tags: ['Saved searches'],
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: 'Saved searches list',
      content: { 'application/json': { schema: z.object({ data: z.array(SavedSearchSchema) }) } },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/me/saved-searches/{id}',
  summary: 'Toggle whether the alert cron fires for this saved search',
  description:
    '404 (not 403) when the id is not owned by the bearer — anti-leak so callers cannot probe which ids exist.',
  tags: ['Saved searches'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ alertsOn: z.boolean() }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Alerts state updated',
      content: {
        'application/json': {
          schema: z.object({ data: z.object({ alertsOn: z.boolean() }) }),
        },
      },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/users/me/saved-searches/{id}',
  summary: 'Hard-delete a saved search',
  tags: ['Saved searches'],
  security: [{ [bearerAuth.name]: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Deleted',
      content: {
        'application/json': {
          schema: z.object({ data: z.object({ deleted: z.literal(true) }) }),
        },
      },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Owner-side endpoints — listing stats, review responses
// ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/v1/listings/{id}/stats',
  summary: 'Owner stats for one listing',
  description:
    'Total + 30-day contact event counts (split by WhatsApp / Phone), review totals, and the 5 most recent contacts (channel + timestamp + has-known-viewer flag — no PII). Owner-only.',
  tags: ['Listings'],
  security: [{ [bearerAuth.name]: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Listing stats',
      content: { 'application/json': { schema: z.object({ data: z.unknown() }) } },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/reviews/{id}/response',
  summary: 'Owner publishes (or updates) their reply to a review',
  description:
    'Idempotent — upserts the `Review.ownerResponse` column. Non-owners get 404 (not 403) to avoid disclosing which review IDs exist.',
  tags: ['Reviews'],
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({ body: z.string().min(10).max(1000) }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Response saved',
      content: { 'application/json': { schema: z.object({ data: z.object({ ok: z.literal(true) }) }) } },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'delete',
  path: '/api/v1/reviews/{id}/response',
  summary: "Owner removes their reply to a review",
  tags: ['Reviews'],
  security: [{ [bearerAuth.name]: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: 'Response removed',
      content: { 'application/json': { schema: z.object({ data: z.object({ deleted: z.literal(true) }) }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// Quiz (anonymous, rate-limited)
// ────────────────────────────────────────────────────────────────────

const QuizAnswersSchema = z
  .object({
    budget: z.enum(['lt150k', '150_250k', '250_400k', 'gte400k']),
    school: z.enum(['university', 'lycee', 'unsure']),
    housingType: z.enum(['ROOM', 'STUDIO', 'APARTMENT', 'any']),
    vibe: z.enum(['calm', 'lively', 'mixed']),
    mobility: z.enum(['walk', 'taxibe', 'car']),
    priority: z.enum(['price', 'school', 'calm', 'social']),
  })
  .openapi('QuizAnswers')

registry.registerPath({
  method: 'post',
  path: '/api/v1/quiz/submit',
  summary: 'Record a completed quartier-matching quiz',
  description:
    'Anonymous. Persists answers + recommended quartier slugs and returns the submission id, which the client can later pass to /quiz/subscribe-email to attach an email.',
  tags: ['Quiz'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            answers: QuizAnswersSchema,
            recommendedSlugs: z.array(z.string()).min(1).max(8),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Quiz recorded',
      content: {
        'application/json': {
          schema: z.object({ data: z.object({ submissionId: z.string() }) }),
        },
      },
    },
    ...errorResponses,
  },
})

registry.registerPath({
  method: 'post',
  path: '/api/v1/quiz/subscribe-email',
  summary: 'Attach an email to a previously-submitted quiz',
  description:
    'Anonymous, but the submissionId must still have a null email — returns 404 if already claimed (prevents an attacker who guesses a submission id from overwriting someone else\'s address).',
  tags: ['Quiz'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            submissionId: z.string(),
            email: z.string().email(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Email attached',
      content: { 'application/json': { schema: z.object({ data: z.object({ ok: z.literal(true) }) }) } },
    },
    ...errorResponses,
  },
})

// ────────────────────────────────────────────────────────────────────
// WhatsApp alerts (anonymous)
// ────────────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/api/v1/whatsapp-alerts/subscribe',
  summary: 'Subscribe a Madagascar phone to WhatsApp listing alerts',
  description:
    'Anonymous, rate-limited per IP. Idempotent — re-subscribing returns `{ alreadySubscribed: true }`. Re-sub also clears unsubscribedAt so a user who opted out can opt back in without admin intervention.',
  tags: ['Alerts'],
  request: {
    body: {
      required: true,
      content: {
        'application/json': {
          schema: z.object({
            phone: z.string().openapi({ example: '+261341234567' }),
            quartierSlug: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Subscribed (new or updated)',
      content: {
        'application/json': {
          schema: z.object({ data: z.object({ alreadySubscribed: z.boolean() }) }),
        },
      },
    },
    ...errorResponses,
  },
})

/**
 * Generate the full OpenAPI 3.1 document. Called by the
 * `/api/v1/openapi.json` route handler.
 */
export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV31(registry.definitions)
  return generator.generateDocument({
    openapi: '3.1.0',
    info: {
      title: 'AryTrano API',
      version: '1.0.0',
      description:
        'Public REST API for the AryTrano student-housing platform. Powers the React Native mobile app and any third-party integrations.\n\nAuth : `Authorization: Bearer <JWT>` issued by `POST /api/v1/auth/login` or `/register`. Refresh via `/auth/refresh`.\n\nPagination : cursor-based (`?cursor=<id>`), never offset. Response shape : `{ data, meta? }` on success, `{ error: { code, message, fields? } }` on failure.',
      contact: { name: 'AryTrano', url: 'https://arytrano.mg' },
    },
    servers: [
      { url: 'https://arytrano.mg', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local dev' },
    ],
    tags: [
      { name: 'Catalog', description: 'Cities + neighborhoods (public)' },
      { name: 'Listings', description: 'Published listings (public)' },
      { name: 'Contact', description: 'Reveal phone + log contact event' },
      { name: 'Auth', description: 'Account + token endpoints' },
      { name: 'Profile', description: 'Current user' },
      { name: 'Favorites', description: 'User-saved listings' },
      { name: 'Saved searches', description: 'User-saved search filters' },
      { name: 'Reviews', description: 'Tenant reviews + owner responses' },
      { name: 'Quiz', description: 'Quartier-matching quiz' },
      { name: 'Alerts', description: 'WhatsApp broadcast opt-in' },
    ],
  })
}
