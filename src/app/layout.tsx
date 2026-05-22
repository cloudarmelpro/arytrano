import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/lib/env'
import { LocaleProvider } from '@/lib/i18n/client'
import { getLocale } from '@/lib/i18n/get-locale'
import { safeJsonLd } from '@/lib/seo/safe-json-ld'
import { SkipToContent } from '@/components/shared/SkipToContent'
// Direct file import (not via the auth barrel) — the barrel also
// re-exports server-only `auth`/`signIn`/`signOut`. Going straight to
// the Client Component file keeps the layout's import graph tight.
import { AuthBroadcastListener } from '@/features/auth/components/AuthBroadcastListener'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  // `swap` avoids invisible-text-during-font-load on 2G/3G — fallback
  // shows immediately, DM Sans swaps in once downloaded. `optional`
  // would silently skip the custom font on slow connections; on a brand
  // site we prefer the brief FOIT-to-FOUT swap.
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const baseUrl = env.AUTH_URL.replace(/\/$/, '')

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'AryTrano — Logement étudiant à Madagascar',
    template: '%s — AryTrano',
  },
  description:
    'Trouve ou propose un logement étudiant à Fianarantsoa, en toute confiance.',
  applicationName: 'AryTrano',
  openGraph: {
    siteName: 'AryTrano',
    locale: 'fr_MG',
    alternateLocale: ['mg_MG'],
    type: 'website',
    images: [
      { url: '/images/arytrano.webp', width: 1200, height: 630, alt: 'AryTrano' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/arytrano.webp'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AryTrano',
  url: baseUrl,
  logo: `${baseUrl}/images/arytrano.png`,
  description:
    'Plateforme de location de logements étudiants à Madagascar — Fianarantsoa et bientôt Antananarivo, Toamasina, Mahajanga, Toliara.',
  areaServed: { '@type': 'Country', name: 'Madagascar' },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full flex flex-col">
        <SkipToContent />
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <Toaster position="bottom-right" closeButton />
        {/* Cross-tab sign-in/out sync — refreshes RSC in other tabs so
            the header / sidebar / route guards pick up the new state
            without the user having to F5 each tab manually. */}
        <AuthBroadcastListener />
        {/*
          JSON-LD scripts are DATA, not executable code. CSP `script-src`
          does not apply to `type="application/ld+json"` so no nonce is
          needed. Skipping the nonce also avoids React's post-hydration
          attribute clear (it strips `nonce` from the DOM for security)
          which would otherwise trigger a hydration mismatch warning.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationJsonLd) }}
        />
      </body>
    </html>
  )
}
