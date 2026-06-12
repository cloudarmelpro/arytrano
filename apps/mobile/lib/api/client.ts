import {
  type ApiFailure,
  type ApiSuccess,
  type AuthTokens,
  type PublicCity,
  type PublicListingCard,
  type PublicNeighborhood,
  type PageMeta,
  type ContactRequest,
  type ContactResponse,
  type LoginRequest,
  type PublicListingDetail,
  type RegisterRequest,
  type SavedSearchRow,
  type LeaseRow,
  type LeaseDetail,
  publicCitySchema,
  publicNeighborhoodSchema,
  publicListingCardSchema,
  publicListingDetailSchema,
  contactResponseSchema,
  authTokensSchema,
  savedSearchRowSchema,
  leaseRowSchema,
  leaseDetailSchema,
  initiateLeaseResponseSchema,
  tenantPayLeaseResponseSchema,
  type InitiateLeaseBody,
  type InitiateLeaseResponse,
  type TenantPayLeaseResponse,
  // E-T28 mobile — concierge leads.
  type CreateInterestLeadBody,
  type CreateInterestLeadResponse,
  createInterestLeadResponseSchema,
  // T-002 mobile — phone OTP.
  type RequestPhoneOtpBody,
  type RequestPhoneOtpResponse,
  type VerifyPhoneOtpBody,
  type VerifyPhoneOtpResponse,
  requestPhoneOtpResponseSchema,
  verifyPhoneOtpResponseSchema,
} from '@arytrano/shared'
import { z } from 'zod'
import { API_BASE_URL } from '../config'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpiring,
  saveTokens,
} from '../auth/token-store'

/**
 * Typed `fetch` wrapper around `/api/v1/`.
 *
 * Responsibilities :
 *  - Attach `Authorization: Bearer <accessToken>` when present
 *  - Auto-refresh on a 401 with code='unauthorized' (single retry,
 *    no infinite loop). If the refresh itself 401s, the tokens are
 *    cleared and the caller's promise rejects — the UI navigates
 *    to /auth/sign-in.
 *  - Validate the response body against the passed Zod schema so a
 *    backend regression surfaces here, not three layers downstream.
 *
 * Endpoint helpers (`listCities`, `revealContact`, etc.) live below
 * the generic core — every helper picks its own schema and never
 * leaks `unknown` upward.
 */

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string[]>

  constructor(opts: {
    status: number
    code: string
    message: string
    fields?: Record<string, string[]>
  }) {
    super(opts.message)
    this.status = opts.status
    this.code = opts.code
    this.fields = opts.fields
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  /** Skip the access-token attach + refresh dance (auth endpoints). */
  anon?: boolean
  /** Locale hint sent as `x-locale` header — drives server-side i18n. */
  locale?: 'fr-MG' | 'mg'
}

async function rawRequest(path: string, opts: RequestOptions): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (opts.locale) headers['x-locale'] = opts.locale

  if (!opts.anon) {
    const token = await getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  return res
}

async function attemptRefresh(): Promise<boolean> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return false

  const res = await rawRequest('/api/v1/auth/refresh', {
    method: 'POST',
    anon: true,
    body: { refreshToken },
  })
  if (!res.ok) {
    await clearTokens()
    return false
  }
  const parsed = (await res.json()) as ApiSuccess<unknown> | ApiFailure
  if ('error' in parsed) {
    await clearTokens()
    return false
  }
  const tokens = authTokensSchema.safeParse(parsed.data)
  if (!tokens.success) {
    await clearTokens()
    return false
  }
  await saveTokens(tokens.data)
  return true
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  opts: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  // Proactive refresh : if the access token is within 30s of expiry,
  // refresh BEFORE making the call. Saves a round-trip 401 on the
  // first request after a long-foreground delay.
  if (!opts.anon && (await isAccessTokenExpiring())) {
    await attemptRefresh()
  }

  let res = await rawRequest(path, opts)

  // Reactive refresh : single retry on unauthorized.
  if (res.status === 401 && !opts.anon) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      res = await rawRequest(path, opts)
    }
  }

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<unknown>
    | ApiFailure
    | null

  if (!res.ok || !json || 'error' in json) {
    const err = (json && 'error' in json ? json.error : null) ?? {
      code: 'unknown_error',
      message: `HTTP ${res.status}`,
    }
    throw new ApiError({
      status: res.status,
      code: err.code,
      message: err.message,
      fields: 'fields' in err ? err.fields : undefined,
    })
  }

  // Validate the success-shape `data` field against the caller's schema.
  // The cast through `unknown` is what `schema.parse` is FOR — if the
  // backend ever ships a regression, the throw lands here with a clear
  // Zod issue path rather than a JSX crash downstream.
  const data = schema.parse(json.data) as T
  return { data, meta: json.meta }
}

// ────────────────────────────────────────────────────────────────────
// Catalog endpoints (public, anon)
// ────────────────────────────────────────────────────────────────────

export async function listCities(): Promise<PublicCity[]> {
  const r = await request(
    '/api/v1/cities',
    z.array(publicCitySchema),
    { anon: true },
  )
  return r.data
}

export async function listNeighborhoods(
  citySlug: string,
): Promise<PublicNeighborhood[]> {
  const r = await request(
    `/api/v1/cities/${encodeURIComponent(citySlug)}/neighborhoods`,
    z.array(publicNeighborhoodSchema),
    { anon: true },
  )
  return r.data
}

// ────────────────────────────────────────────────────────────────────
// Listings (public list, public detail)
// ────────────────────────────────────────────────────────────────────

export async function listListings(
  query: Partial<{
    cursor: string
    type: 'ROOM' | 'STUDIO' | 'APARTMENT' | 'HOUSE'
    city: string
    neighborhood: string
    priceMin: number
    priceMax: number
    sort: 'newest' | 'price-asc' | 'price-desc'
    amenities: string[]
    q: string
  }> = {},
): Promise<{ items: PublicListingCard[]; meta: PageMeta }> {
  const sp = new URLSearchParams()
  if (query.cursor) sp.set('cursor', query.cursor)
  if (query.type) sp.set('type', query.type)
  if (query.city) sp.set('city', query.city)
  if (query.neighborhood) sp.set('neighborhood', query.neighborhood)
  if (query.priceMin !== undefined) sp.set('priceMin', String(query.priceMin))
  if (query.priceMax !== undefined) sp.set('priceMax', String(query.priceMax))
  if (query.sort) sp.set('sort', query.sort)
  if (query.amenities && query.amenities.length > 0) {
    sp.set('amenities', query.amenities.join(','))
  }
  if (query.q) sp.set('q', query.q)
  const qs = sp.toString()
  const path = qs ? `/api/v1/listings?${qs}` : '/api/v1/listings'

  const r = await request(path, z.array(publicListingCardSchema), { anon: true })
  return {
    items: r.data,
    meta: {
      nextCursor: (r.meta?.nextCursor as string | null | undefined) ?? null,
      hasMore: Boolean(r.meta?.hasMore),
    },
  }
}

export async function getListingById(id: string): Promise<PublicListingDetail> {
  const r = await request(
    `/api/v1/listings/${encodeURIComponent(id)}/public`,
    publicListingDetailSchema,
    { anon: true },
  )
  return r.data
}

// ────────────────────────────────────────────────────────────────────
// Contact reveal (anon OK, signed-in caller stamped on the event)
// ────────────────────────────────────────────────────────────────────

export async function revealContact(
  listingId: string,
  body: ContactRequest,
): Promise<ContactResponse> {
  const r = await request(
    `/api/v1/contact/${encodeURIComponent(listingId)}`,
    contactResponseSchema,
    { method: 'POST', body },
  )
  return r.data
}

// ────────────────────────────────────────────────────────────────────
// Saved searches — bearer-required
// ────────────────────────────────────────────────────────────────────

export async function listSavedSearches(): Promise<SavedSearchRow[]> {
  const r = await request(
    '/api/v1/users/me/saved-searches',
    z.array(savedSearchRowSchema),
  )
  return r.data
}

/**
 * Toggle whether the alert cron fires for a saved search. Server
 * returns the new state (echoes the requested value on success);
 * 404 on a row that isn't owned by the bearer.
 */
export async function updateSavedSearchAlerts(
  id: string,
  alertsOn: boolean,
): Promise<{ alertsOn: boolean }> {
  const r = await request(
    `/api/v1/users/me/saved-searches/${encodeURIComponent(id)}`,
    z.object({ alertsOn: z.boolean() }),
    { method: 'PATCH', body: { alertsOn } },
  )
  return r.data
}

export async function deleteSavedSearch(id: string): Promise<void> {
  await request(
    `/api/v1/users/me/saved-searches/${encodeURIComponent(id)}`,
    z.object({ deleted: z.literal(true) }),
    { method: 'DELETE' },
  )
}

// ────────────────────────────────────────────────────────────────────
// Favorites — bearer-required
// ────────────────────────────────────────────────────────────────────

export async function listFavorites(
  cursor?: string,
): Promise<{ items: PublicListingCard[]; meta: PageMeta }> {
  const path = cursor
    ? `/api/v1/favorites?cursor=${encodeURIComponent(cursor)}`
    : '/api/v1/favorites'
  const r = await request(path, z.array(publicListingCardSchema))
  return {
    items: r.data,
    meta: {
      nextCursor: (r.meta?.nextCursor as string | null | undefined) ?? null,
      hasMore: Boolean(r.meta?.hasMore),
    },
  }
}

/**
 * Toggle a listing in/out of the bearer user's favorites. The server
 * returns the resulting state — true if NOW favorited, false if NOW
 * removed. Idempotent: calling twice flips back.
 */
export async function toggleFavorite(
  listingId: string,
): Promise<{ favorited: boolean }> {
  const r = await request(
    '/api/v1/favorites',
    z.object({ favorited: z.boolean() }),
    { method: 'POST', body: { listingId } },
  )
  return r.data
}

// ────────────────────────────────────────────────────────────────────
// Auth — register / login / logout
// ────────────────────────────────────────────────────────────────────

export async function register(body: RegisterRequest): Promise<AuthTokens> {
  const r = await request('/api/v1/auth/register', authTokensSchema, {
    method: 'POST',
    body,
    anon: true,
  })
  await saveTokens(r.data)
  return r.data
}

export async function login(body: LoginRequest): Promise<AuthTokens> {
  const r = await request('/api/v1/auth/login', authTokensSchema, {
    method: 'POST',
    body,
    anon: true,
  })
  await saveTokens(r.data)
  return r.data
}

/** Local logout — clears SecureStore. The server JWT remains valid
 * until expiry (stateless 30d JWT) which matches the v1 ticket spec. */
export async function logout(): Promise<void> {
  await clearTokens()
}

// ────────────────────────────────────────────────────────────────────
// Push notifications — register / unregister Expo token
// ────────────────────────────────────────────────────────────────────

export async function registerExpoPushToken(token: string): Promise<void> {
  await request(
    '/api/v1/users/me/push-token',
    z.object({ registered: z.literal(true) }),
    { method: 'POST', body: { token } },
  )
}

export async function unregisterExpoPushToken(): Promise<void> {
  await request(
    '/api/v1/users/me/push-token',
    z.object({ cleared: z.literal(true) }),
    { method: 'DELETE' },
  )
}

// ────────────────────────────────────────────────────────────────────
// Leases (E-T22 mobile — tenant accept/refuse + owner watch)
// ────────────────────────────────────────────────────────────────────

/** List leases where the caller is owner OR tenant. */
export async function listMyLeases(): Promise<LeaseRow[]> {
  const r = await request('/api/v1/leases', z.array(leaseRowSchema))
  return r.data
}

/** Single lease detail — includes counterpart emails (gated server-side). */
export async function getLeaseById(id: string): Promise<LeaseDetail> {
  const r = await request(
    `/api/v1/leases/${encodeURIComponent(id)}`,
    leaseDetailSchema,
  )
  return r.data
}

/**
 * Tenant accepts the lease — initiates the GoalPay checkout. The
 * caller opens `checkoutUrl` in a WebView / external browser. After
 * the payment lands, the GoalPay webhook flips the lease to ACTIVE
 * server-side ; the app refreshes `/leases/[id]` to see the new state.
 *
 * Revised E-T26 (2026-05-27) — was `signLease(id) → { leaseId }`,
 * is now the tenant-pays initiation that returns the checkout URL.
 */
export async function signLease(id: string): Promise<TenantPayLeaseResponse> {
  const r = await request(
    `/api/v1/leases/${encodeURIComponent(id)}/sign`,
    tenantPayLeaseResponseSchema,
    { method: 'POST' },
  )
  return r.data
}

/**
 * Owner creates a lease draft (S2-10 mobile owner — 2026-05-29).
 * Mirrors the web wizard at /dashboard/listings/[id]/lease/new ; the
 * server derives `cautionMGA` + `platformFeeMGA` from the listing so
 * the mobile form only collects tenant email + dates.
 *
 * After success the app navigates to /leases/[id]. The tenant receives
 * an invite email and accepts (+ pays) from their own device.
 */
export async function initiateLease(
  body: InitiateLeaseBody,
): Promise<InitiateLeaseResponse> {
  const r = await request(
    '/api/v1/leases',
    initiateLeaseResponseSchema,
    { method: 'POST', body },
  )
  return r.data
}

// ────────────────────────────────────────────────────────────────────
// E-T28 — Concierge lead funnel + T-002 phone OTP gate (anon-friendly)
// ────────────────────────────────────────────────────────────────────

/**
 * Submit the public-form concierge lead. The server returns either
 * `{ kind:'ok', leadId }` or `{ kind:'otp_required' }` — in the latter
 * case the caller must run the OTP dance below and re-submit. Bearer
 * is OPTIONAL : signed-in users skip the OTP gate automatically.
 */
export async function createInterestLead(
  body: CreateInterestLeadBody,
): Promise<CreateInterestLeadResponse> {
  const r = await request(
    '/api/v1/leads',
    createInterestLeadResponseSchema,
    { method: 'POST', body, anon: true },
  )
  return r.data
}

/**
 * Ask the server to send a fresh 6-digit OTP to `phoneE164`. Rate-
 * limited at 3/h/phone + 5/h/IP — surface the 429 to the user with a
 * "Réessaie dans une heure" copy.
 */
export async function requestPhoneOtp(
  body: RequestPhoneOtpBody,
): Promise<RequestPhoneOtpResponse> {
  const r = await request(
    '/api/v1/phone/request-otp',
    requestPhoneOtpResponseSchema,
    { method: 'POST', body, anon: true },
  )
  return r.data
}

/**
 * Verify the code the user typed. The server tracks attempts on its
 * own (3-attempt cap + 30/h/phone + 100/h/IP). On success the lead
 * submission can be retried and will not see `otp_required`.
 */
export async function verifyPhoneOtp(
  body: VerifyPhoneOtpBody,
): Promise<VerifyPhoneOtpResponse> {
  const r = await request(
    '/api/v1/phone/verify-otp',
    verifyPhoneOtpResponseSchema,
    { method: 'POST', body, anon: true },
  )
  return r.data
}

/** Tenant refuses the lease. Optional reason flows into the audit log. */
export async function refuseLease(
  id: string,
  reason?: string,
): Promise<{ leaseId: string; paymentRefundQueued: boolean }> {
  const r = await request(
    `/api/v1/leases/${encodeURIComponent(id)}/refuse`,
    z.object({
      leaseId: z.string(),
      paymentRefundQueued: z.boolean(),
    }),
    {
      method: 'POST',
      // Send an empty object instead of omitting the body — keeps the
      // content-type header consistent with the rate-limit guard on
      // the server side.
      body: reason ? { reason } : {},
    },
  )
  return r.data
}
