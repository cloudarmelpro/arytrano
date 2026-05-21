import { NextRequest, NextResponse } from 'next/server'

/**
 * Next.js 16 — Proxy (formerly middleware.ts).
 *
 * Two responsibilities:
 *
 *   1. **CSP nonce**: generate a per-request nonce, inject it into the
 *      `Content-Security-Policy` header (so we can drop `'unsafe-inline'`
 *      from `script-src`) and into a request header so Server Components
 *      can stamp it on their own inline scripts.
 *
 *   2. **`/mg/` locale prefix**: when the URL begins with `/mg`, set
 *      `x-locale=mg`, refresh the locale cookie, and REWRITE the request
 *      to the path-without-prefix. Pages remain unaware of the prefix —
 *      `getLocale()` reads the header and the cookie keeps subsequent
 *      navigations in the chosen language.
 *
 * Nonces FORCE dynamic rendering on matched routes. AryTrano's pages are
 * already dynamic (DB reads on every render), so we lose nothing here.
 */
export function proxy(request: NextRequest) {
  // ─── 1. Locale prefix detection ────────────────────────────────────
  const { pathname } = request.nextUrl
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
