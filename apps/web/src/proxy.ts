import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js 16 — Proxy (formerly middleware.ts).
 *
 * Three responsibilities:
 *
 *   1. **Route protection (fast path)**: before the route handler even
 *      runs, check the JWT cookie presence and redirect unauthenticated
 *      requests on protected paths to /sign-in (with `?returnTo=`),
 *      and signed-in requests on auth-only pages to /dashboard. This
 *      kills the "URL flashes through /dashboard before redirect" UX
 *      bug — at the middleware layer the redirect is a HTTP 307 issued
 *      before any HTML hits the browser. The layout guards stay as
 *      defense-in-depth (cookie present but expired or user banned).
 *
 *   2. **CSP nonce**: generate a per-request nonce, inject it into the
 *      `Content-Security-Policy` header (so we can drop `'unsafe-inline'`
 *      from `script-src`) and into a request header so Server Components
 *      can stamp it on their own inline scripts.
 *
 *   3. **`/mg/` locale prefix**: when the URL begins with `/mg`, set
 *      `x-locale=mg`, refresh the locale cookie, and REWRITE the request
 *      to the path-without-prefix. Pages remain unaware of the prefix —
 *      `getLocale()` reads the header and the cookie keeps subsequent
 *      navigations in the chosen language.
 *
 * Nonces FORCE dynamic rendering on matched routes. AryTrano's pages are
 * already dynamic (DB reads on every render), so we lose nothing here.
 */

/** Paths that require an active session — middleware bounces anon visitors. */
const PROTECTED_PREFIXES = ['/dashboard', '/admin']

/**
 * Paths only useful to anonymous visitors — middleware bounces signed-in
 * users back to /dashboard. /reset-password, /verify-email, /auth-error
 * are deliberately omitted because token-gated / recovery flows must
 * stay reachable even when signed in (e.g. accepting a verification
 * link from a different account, or surfacing OAuth errors).
 */
const AUTH_ONLY_PATHS = ['/sign-in', '/sign-up', '/forgot-password']

/**
 * Detect Auth.js session cookie presence without parsing the JWT. Fast
 * (no crypto, no DB) — the layout's `auth()` does the real validation.
 *
 * Auth.js v5 cookie name is `authjs.session-token` over HTTP and
 * `__Secure-authjs.session-token` over HTTPS. Large JWTs are also split
 * into `.0`, `.1` chunks, so we match by `startsWith`.
 */
function hasSessionCookie(request: NextRequest): boolean {
  for (const cookie of request.cookies.getAll()) {
    if (
      cookie.name === 'authjs.session-token' ||
      cookie.name === '__Secure-authjs.session-token' ||
      cookie.name.startsWith('authjs.session-token.') ||
      cookie.name.startsWith('__Secure-authjs.session-token.')
    ) {
      // Empty value = stale cookie, not a real session.
      if (cookie.value && cookie.value.length > 0) return true
    }
  }
  return false
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

function isAuthOnlyPath(pathname: string): boolean {
  return AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── 0. Route protection — fast cookie-presence check ─────────────
  // The /mg/* locale prefix is stripped for the auth check so that
  // /mg/dashboard maps to the same policy as /dashboard. We keep the
  // original URL in the redirect so the user lands back on the right
  // locale variant after signing in.
  const unprefixedPath = pathname.startsWith('/mg/')
    ? pathname.slice('/mg'.length)
    : pathname === '/mg'
      ? '/'
      : pathname
  const hasSession = hasSessionCookie(request)

  // Stale-session loop guard. Reaching an auth-only path WITH `?reason`
  // is a signal from a layout (dashboard / admin) that `auth()` refused
  // the JWT — token-version bump, banned user, deleted row, etc. The
  // cookie is still present byte-wise so a naive bounce-to-dashboard
  // here would send the request straight back to the layout that just
  // rejected it → infinite redirect loop. We flag this case and clear
  // the stale cookies once we've built the response below.
  const isStaleSessionHint =
    isAuthOnlyPath(unprefixedPath) &&
    hasSession &&
    request.nextUrl.searchParams.has('reason')

  if (isProtectedPath(unprefixedPath) && !hasSession) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('returnTo', pathname + request.nextUrl.search)
    return NextResponse.redirect(signInUrl)
  }
  if (isAuthOnlyPath(unprefixedPath) && hasSession && !isStaleSessionHint) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ─── 1. Locale prefix detection ────────────────────────────────────
  const isMgPath = pathname === '/mg' || pathname.startsWith('/mg/')
  const locale = isMgPath ? 'mg' : 'fr-MG'

  // ─── 2. CSP nonce ──────────────────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  // Dev needs 'unsafe-eval' because React rebuilds stack frames via eval()
  // for the error overlay. Production never sets it.
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://res.cloudinary.com https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://tiles.stadiamaps.com https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com data: blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.upstash.io https://*.cloudinary.com${isDev ? ' ws: wss:' : ''};
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, ' ')
    .trim()

  // ─── 3. Build request headers (forwarded to RSC) ───────────────────
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-locale', locale)
  requestHeaders.set('Content-Security-Policy', cspHeader)

  // ─── 4. Rewrite /mg/* → /* internally ──────────────────────────────
  // The URL the user sees stays `/mg/...` (good for SEO). Server-side we
  // route to the same page tree, just with locale=mg signaled.
  let response: NextResponse
  if (isMgPath) {
    const rewrittenUrl = new URL(request.nextUrl)
    rewrittenUrl.pathname = pathname === '/mg' ? '/' : pathname.slice('/mg'.length)
    response = NextResponse.rewrite(rewrittenUrl, {
      request: { headers: requestHeaders },
    })
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  // ─── 5. Sync locale cookie + CSP response header ───────────────────
  // Refresh cookie on every MG URL hit so click-throughs from Google
  // searching in Malagasy don't bounce the user back to FR.
  if (isMgPath) {
    response.cookies.set('arytrano_locale', 'mg', {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  // ─── 6. Stale-session cookie cleanup ───────────────────────────────
  // Triggered when an auth-only path was reached WITH `?reason=` (set
  // above). Deleting a missing cookie is a no-op so we can be exhaustive
  // about Auth.js's many variants (HTTP, __Secure-HTTPS, chunked .0/.1).
  if (isStaleSessionHint) {
    const cookieNamesToClear = [
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'authjs.callback-url',
      '__Secure-authjs.callback-url',
      'authjs.csrf-token',
      '__Host-authjs.csrf-token',
    ]
    for (const name of cookieNamesToClear) {
      response.cookies.delete(name)
    }
    for (let i = 0; i < 5; i++) {
      response.cookies.delete(`authjs.session-token.${i}`)
      response.cookies.delete(`__Secure-authjs.session-token.${i}`)
    }
  }

  response.headers.set('Content-Security-Policy', cspHeader)
  return response
}

export const config = {
  matcher: [
    /*
     * Run on all routes EXCEPT:
     *  - /api/* (REST endpoints, no HTML)
     *  - /_next/static, /_next/image (build assets, immutable)
     *  - favicon.ico, /images/* (binary assets)
     *  - prefetch requests from <Link prefetch>
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
